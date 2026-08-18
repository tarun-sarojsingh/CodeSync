package com.codesync.handler;

import com.codesync.model.RoomSnapshot;
import com.codesync.model.RoomUpdate;
import com.codesync.repository.RoomSnapshotRepository;
import com.codesync.repository.RoomUpdateRepository;
import com.codesync.security.JwtUtils;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.AbstractWebSocketHandler;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import com.codesync.repository.ChatMessageRepository;
import com.codesync.model.ChatMessage;
import com.codesync.service.CodeExecutionService;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Component
public class YjsWebSocketHandler extends AbstractWebSocketHandler {

    private final ConcurrentHashMap<String, Set<WebSocketSession>> roomSessions = new ConcurrentHashMap<>();
    private final RedisTemplate<String, byte[]> redisTemplate;
    private final JwtUtils jwtUtils;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    private final RoomSnapshotRepository snapshotRepository;
    private final RoomUpdateRepository updateRepository;
    private final ChatMessageRepository chatRepository;
    private final CodeExecutionService codeExecutionService;
    private final ExecutorService dbExecutor = Executors.newSingleThreadExecutor();

    public YjsWebSocketHandler(RedisTemplate<String, byte[]> redisTemplate, 
                               JwtUtils jwtUtils,
                               RoomSnapshotRepository snapshotRepository,
                               RoomUpdateRepository updateRepository,
                               ChatMessageRepository chatRepository,
                               CodeExecutionService codeExecutionService) {
        this.redisTemplate = redisTemplate;
        this.jwtUtils = jwtUtils;
        this.snapshotRepository = snapshotRepository;
        this.updateRepository = updateRepository;
        this.chatRepository = chatRepository;
        this.codeExecutionService = codeExecutionService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String query = session.getUri().getQuery();
        String token = null;
        if (query != null && query.contains("token=")) {
            String[] params = query.split("&");
            for (String param : params) {
                if (param.startsWith("token=")) {
                    token = param.substring(6);
                    break;
                }
            }
        }
        
        if (token != null && jwtUtils.validateJwtToken(token)) {
            String userId = jwtUtils.getUserIdFromJwtToken(token);
            String username = jwtUtils.getUserNameFromJwtToken(token);
            session.getAttributes().put("authenticated", true);
            session.getAttributes().put("userId", userId);
            session.getAttributes().put("username", username);

            String roomId = extractRoomId(session);
            roomSessions.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet()).add(session);
            
            // Synchronize state: send snapshot and updates
            sendRoomStateToClient(session, roomId);
        } else {
            session.getAttributes().put("authenticated", false);
            try {
                session.close(CloseStatus.NOT_ACCEPTABLE);
            } catch (IOException e) {}
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        JsonNode json = objectMapper.readTree(message.getPayload());
        String type = json.has("type") ? json.get("type").asText() : "";

        if ("CHAT".equals(type)) {
            Boolean isAuthenticated = (Boolean) session.getAttributes().get("authenticated");
            if (isAuthenticated != null && isAuthenticated) {
                String roomId = extractRoomId(session);
                String messageText = json.has("message") ? json.get("message").asText() : "";
                String userId = (String) session.getAttributes().get("userId");
                String username = (String) session.getAttributes().get("username");
                
                ChatMessage chat = new ChatMessage(roomId, userId, username, messageText, Instant.now());
                dbExecutor.submit(() -> chatRepository.save(chat));
                
                // Broadcast chat
                String chatJson = String.format("{\"type\":\"CHAT\",\"userId\":\"%s\",\"username\":\"%s\",\"message\":\"%s\"}", userId, username, messageText.replace("\"", "\\\""));
                broadcastTextToLocalRoom(roomId, session.getId(), chatJson);
                // In a full implementation, we would also broadcast this over Redis
            }
        } else if ("RUN_CODE".equals(type)) {
            Boolean isAuthenticated = (Boolean) session.getAttributes().get("authenticated");
            if (isAuthenticated != null && isAuthenticated) {
                String language = json.has("language") ? json.get("language").asText() : "";
                String code = json.has("code") ? json.get("code").asText() : "";
                
                dbExecutor.submit(() -> {
                    String output = codeExecutionService.executeCode(language, code);
                    String outputJson = String.format("{\"type\":\"RUN_OUTPUT\",\"output\":\"%s\"}", output.replace("\"", "\\\"").replace("\n", "\\n"));
                    try {
                        session.sendMessage(new TextMessage(outputJson));
                    } catch (IOException e) { }
                });
            }
        }
    }

    public void broadcastTextToLocalRoom(String roomId, String senderSessionId, String payload) {
        Set<WebSocketSession> sessions = roomSessions.get(roomId);
        if (sessions != null) {
            TextMessage msg = new TextMessage(payload);
            for (WebSocketSession s : sessions) {
                Boolean isAuthenticated = (Boolean) s.getAttributes().get("authenticated");
                if (s.isOpen() && isAuthenticated != null && isAuthenticated) {
                    try {
                        s.sendMessage(msg);
                    } catch (IOException e) { }
                }
            }
        }
    }

    private void sendRoomStateToClient(WebSocketSession session, String roomId) {
        dbExecutor.submit(() -> {
            try {
                // Send latest snapshot if it exists
                RoomSnapshot snapshot = snapshotRepository.findTopByRoomIdOrderByCreatedAtDesc(roomId).orElse(null);
                Instant afterTime = Instant.EPOCH;
                if (snapshot != null) {
                    afterTime = snapshot.getCreatedAt();
                    // Wrap the raw snapshot data into a y-protocols Update message (message type 0, sync type 2)
                    // Wait, if snapshotData is just the raw Yjs state vector, we might need to send it properly.
                    // For now, assume snapshotData is a valid Update binary.
                    session.sendMessage(new BinaryMessage(snapshot.getSnapshotData()));
                }

                // Send all updates since the snapshot
                List<RoomUpdate> updates = updateRepository.findByRoomIdAndTimestampAfterOrderByTimestampAsc(roomId, afterTime);
                for (RoomUpdate update : updates) {
                    session.sendMessage(new BinaryMessage(update.getUpdateData()));
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }

    @Override
    protected void handleBinaryMessage(WebSocketSession session, BinaryMessage message) throws Exception {
        Boolean isAuthenticated = (Boolean) session.getAttributes().get("authenticated");
        if (isAuthenticated == null || !isAuthenticated) {
            session.close(CloseStatus.NOT_ACCEPTABLE);
            return;
        }

        String roomId = extractRoomId(session);
        byte[] payload = message.getPayload().array();

        // Persist the message if it's a Sync message (message type 0)
        if (payload.length > 0 && payload[0] == 0) {
            dbExecutor.submit(() -> {
                updateRepository.save(new RoomUpdate(roomId, payload, Instant.now()));
            });
        }

        // Broadcast to local clients immediately
        broadcastToLocalRoom(roomId, session.getId(), payload);

        // Publish to Redis for cross-server sync
        byte[] sessionIdBytes = session.getId().getBytes();
        int sessionIdLength = sessionIdBytes.length;
        byte[] redisPayload = new byte[1 + sessionIdLength + payload.length];
        
        redisPayload[0] = (byte) sessionIdLength;
        System.arraycopy(sessionIdBytes, 0, redisPayload, 1, sessionIdLength);
        System.arraycopy(payload, 0, redisPayload, 1 + sessionIdLength, payload.length);

        redisTemplate.convertAndSend("room:" + roomId, redisPayload);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String roomId = extractRoomId(session);
        Set<WebSocketSession> sessions = roomSessions.get(roomId);
        if (sessions != null) {
            sessions.remove(session);
            if (sessions.isEmpty()) {
                roomSessions.remove(roomId);
            }
        }
    }

    public void broadcastToLocalRoom(String roomId, String senderSessionId, byte[] payload) {
        Set<WebSocketSession> sessions = roomSessions.get(roomId);
        if (sessions != null) {
            BinaryMessage msg = new BinaryMessage(payload);
            for (WebSocketSession s : sessions) {
                Boolean isAuthenticated = (Boolean) s.getAttributes().get("authenticated");
                if (s.isOpen() && isAuthenticated != null && isAuthenticated && (senderSessionId == null || !s.getId().equals(senderSessionId))) {
                    try {
                        s.sendMessage(msg);
                    } catch (IOException e) {
                    }
                }
            }
        }
    }

    private String extractRoomId(WebSocketSession session) {
        String path = session.getUri().getPath();
        return path.substring(path.lastIndexOf('/') + 1);
    }
}
