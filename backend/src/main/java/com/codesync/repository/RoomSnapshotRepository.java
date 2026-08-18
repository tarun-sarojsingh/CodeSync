package com.codesync.repository;

import com.codesync.model.RoomSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoomSnapshotRepository extends JpaRepository<RoomSnapshot, Long> {
    Optional<RoomSnapshot> findTopByRoomIdOrderByCreatedAtDesc(String roomId);
}
