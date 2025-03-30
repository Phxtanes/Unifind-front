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

    //ดึงของจาก ID
    @GetMapping("/{id}")
    public LostItem getLostItemById(@PathVariable String id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lost item not found"));
    }

    //ดูของตาม status removed
    @GetMapping("/status/removed")
    public List<LostItem> getLostItemsByRemoved() {
        return repository.findByStatus("removed");
    }

    //ดูของตาม status stored
    @GetMapping("/status/stored")
    public List<LostItem> getLostItemsByStored() {
        return repository.findByStatus("stored");
    }

    @PutMapping("/status/{id}") //รับ pk จาก font แล้วมาเซ้ตค่าใหม่เป็น Remove
    public LostItem updateLostItemStatus(@PathVariable String id,@RequestBody LostItem updatedData) {
        LostItem item = repository.findById(id).orElseThrow(() -> new RuntimeException("Lost item not found"));
        item.setIdentityDoc(updatedData.getIdentityDoc());
        item.setReceiver(updatedData.getReceiver());
        item.setStaffName(updatedData.getStaffName());
        item.setStatus("removed");

        return repository.save(item);
    }

    //edit ฟรอม
    @PutMapping("/edit/{id}")
    public LostItem updateLostItem(@PathVariable String id, @RequestBody LostItem newItem) {
        LostItem item = repository.findById(id).orElseThrow(() -> new RuntimeException("Lost item not found"));

        item.setName(newItem.getName().toUpperCase());
        item.setCategory(newItem.getCategory());
        item.setPlace(newItem.getPlace());
        item.setDescription(newItem.getDescription());
        item.setPicture(newItem.getPicture());
        item.setNamereport(newItem.getNamereport());
        item.setLocker(newItem.getLocker());

        return repository.save(item);
    }

}
