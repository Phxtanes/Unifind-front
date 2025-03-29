package com.example.backlostandfound.repository;

import com.example.backlostandfound.model.LostItem;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface LostItemRepository extends MongoRepository<LostItem, String> {
    List<LostItem> findByStatus(String status);

}