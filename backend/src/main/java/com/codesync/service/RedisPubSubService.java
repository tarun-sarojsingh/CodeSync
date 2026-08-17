package com.codesync.service;

import com.codesync.handler.YjsWebSocketHandler;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service
public class RedisPubSubService implements MessageListener {

    private final YjsWebSocketHandler webSocketHandler;

    public RedisPubSubService(@Lazy YjsWebSocketHandler webSocketHandler) {
        this.webSocketHandler = webSocketHandler;
    }

    @Override
    public void onMessage(Message message, byte[] pattern) {
        String channel = new String(message.getChannel());
        if (channel.startsWith("room:")) {
            String roomId = channel.substring(5);
            byte[] body = message.getBody();
            
            if (body != null && body.length > 1) {
                int sessionIdLength = body[0];
                if (body.length > 1 + sessionIdLength) {
                    String senderSessionId = new String(body, 1, sessionIdLength);
                    byte[] yjsPayload = Arrays.copyOfRange(body, 1 + sessionIdLength, body.length);
                    
                    webSocketHandler.broadcastToLocalRoom(roomId, senderSessionId, yjsPayload);
                }
            }
        }
    }
}
