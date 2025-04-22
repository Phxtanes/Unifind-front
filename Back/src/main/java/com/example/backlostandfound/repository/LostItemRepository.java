package com.example.backlostandfound.repository;

import com.example.backlostandfound.model.LostItem;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface LostItemRepository extends MongoRepository<LostItem, String> {
    List<LostItem> findByStatus(String status);
    List<LostItem> findByStatusAndDateBetween(String status, LocalDateTime start, LocalDateTime end);
    List<LostItem> findByStatusAndLocker(String status, Integer locker);
    List<LostItem> findByStatusAndDateBetweenAndLocker(String status, LocalDateTime start, LocalDateTime end, Integer locker);
}
