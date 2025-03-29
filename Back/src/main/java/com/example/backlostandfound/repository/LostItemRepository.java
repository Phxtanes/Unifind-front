package com.example.backlostandfound.repository;

import com.example.backlostandfound.model.LostItem;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface LostItemRepository extends MongoRepository<LostItem, String> {
}