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
    public List<LostItem> getAllLostItems() {return repository.findAll();
    }

    @GetMapping("/status") //ดูของตาม status ลองเทสได้  http://localhost:8080/api/lost-items/status?status=เก็บอยู่
    public List<LostItem> getLostItemsByStatus(@RequestParam String status) {
        return repository.findByStatus(status);
    }

    @PutMapping("/status/{id}") //รับ pk จาก font แล้วมาเซ้ตค่าใหม่เป็น Remove
    public LostItem updateLostItemStatus(@PathVariable String id) {
        LostItem item = repository.findById(id).orElseThrow(() -> new RuntimeException("Lost item not found"));
        item.setStatus("removed");
        return repository.save(item);
    }


}
