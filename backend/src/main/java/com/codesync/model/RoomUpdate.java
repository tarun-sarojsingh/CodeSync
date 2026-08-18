package com.codesync.model;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "room_updates")
public class RoomUpdate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String roomId;

    @Lob
    private byte[] updateData;

    private Instant timestamp;

    public RoomUpdate() {}

    public RoomUpdate(String roomId, byte[] updateData, Instant timestamp) {
        this.roomId = roomId;
        this.updateData = updateData;
        this.timestamp = timestamp;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }
    public byte[] getUpdateData() { return updateData; }
    public void setUpdateData(byte[] updateData) { this.updateData = updateData; }
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}
