package com.example.backlostandfound.controller;

import com.example.backlostandfound.model.LostItem;
import com.example.backlostandfound.repository.LostItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lost-items")
@CrossOrigin(origins = "http://localhost:3000")
public class LostItemController {

    @Autowired
    private LostItemRepository repository;

    // 🔹 เพิ่มของหาย
    @PostMapping
    public LostItem addLostItem(@RequestBody LostItem item) {
        return repository.save(item);
    }

    // 🔹 ดึงรายการของหายทั้งหมด
    @GetMapping
    public List<LostItem> getAllLostItems() {
        return repository.findAll();
    }
}
