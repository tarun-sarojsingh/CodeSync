package com.codesync.model;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "room_snapshots")
public class RoomSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String roomId;
    
    @Lob
    private byte[] snapshotData;
    
    private Instant createdAt;

    public RoomSnapshot() {}

    public RoomSnapshot(String roomId, byte[] snapshotData, Instant createdAt) {
        this.roomId = roomId;
        this.snapshotData = snapshotData;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }
    public byte[] getSnapshotData() { return snapshotData; }
    public void setSnapshotData(byte[] snapshotData) { this.snapshotData = snapshotData; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
