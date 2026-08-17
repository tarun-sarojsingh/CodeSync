package com.codesync.handler;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.BinaryWebSocketHandler;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class YjsWebSocketHandler extends BinaryWebSocketHandler {

    private final ConcurrentHashMap<String, Set<WebSocketSession>> roomSessions = new ConcurrentHashMap<>();
    private final RedisTemplate<String, byte[]> redisTemplate;

    public YjsWebSocketHandler(RedisTemplate<String, byte[]> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String roomId = extractRoomId(session);
        roomSessions.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet()).add(session);
    }

    @Override
    protected void handleBinaryMessage(WebSocketSession session, BinaryMessage message) throws Exception {
        String roomId = extractRoomId(session);
        byte[] payload = message.getPayload().array();

        // Broadcast to local clients immediately
        broadcastToLocalRoom(roomId, session.getId(), payload);

        // Publish to Redis for cross-server sync
        byte[] sessionIdBytes = session.getId().getBytes();
        int sessionIdLength = sessionIdBytes.length;
        byte[] redisPayload = new byte[1 + sessionIdLength + payload.length];
        
        // Custom payload format: [1 byte length][sessionId][yjs payload]
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
                if (s.isOpen() && (senderSessionId == null || !s.getId().equals(senderSessionId))) {
                    try {
                        s.sendMessage(msg);
                    } catch (IOException e) {
                        // ignore dropped connections
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
