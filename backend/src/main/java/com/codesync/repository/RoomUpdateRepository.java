package com.codesync.repository;

import com.codesync.model.RoomUpdate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface RoomUpdateRepository extends JpaRepository<RoomUpdate, Long> {
    List<RoomUpdate> findByRoomIdAndTimestampAfterOrderByTimestampAsc(String roomId, Instant timestamp);
    List<RoomUpdate> findByRoomIdOrderByTimestampAsc(String roomId);
}
