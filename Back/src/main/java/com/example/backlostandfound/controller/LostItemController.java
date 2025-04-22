package com.example.backlostandfound.controller;

import com.example.backlostandfound.model.LostItem;
import com.example.backlostandfound.repository.LostItemRepository;
import com.example.backlostandfound.service.GridFsService; // ✅ Import GridFsService
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/lost-items")
@CrossOrigin(origins = "http://localhost:3000")
public class LostItemController {

    @Autowired
    private LostItemRepository repository;

    @Autowired
    private GridFsService gridFsService; // ✅ Inject GridFsService

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

    // 🔹 ดึงของหายตาม ID
    @GetMapping("/{id}")
    public LostItem getLostItemById(@PathVariable String id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lost item not found"));
    }

    // 🔹 ดึงของหายตามสถานะ "removed"
    @GetMapping("/status/removed")
    public List<LostItem> getLostItemsByRemoved() {
        return repository.findByStatus("removed");
    }

    // 🔹 ดึงของหายตามสถานะ "stored"
    @GetMapping("/status/stored")
    public List<LostItem> getLostItemsByStored() {
        return repository.findByStatus("stored");
    }

    // 🔹 อัปเดตสถานะของหายเป็น "removed"
    @PutMapping(value = "/status/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public LostItem updateLostItemStatusWithFile(
            @PathVariable String id,
            @RequestPart("receiver") String receiver,
            @RequestPart("staffName") String staffName,
            @RequestPart(value = "identityDoc", required = false) MultipartFile identityDoc) {

        LostItem item = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lost item not found"));

        item.setReceiver(receiver);
        item.setStaffName(staffName);
        item.setStatus("removed");

        // ✅ ถ้ามีไฟล์แนบ ให้ upload ไป GridFS
        if (identityDoc != null && !identityDoc.isEmpty()) {
            try {
                String fileId = gridFsService.uploadFile(identityDoc);
                item.setIdentityDoc(fileId); // บันทึก File ID ลงในฟิลด์
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload identity document", e);
            }
        }

        return repository.save(item);
    }

    // 🔹 อัปเดตข้อมูลของหาย
    @PutMapping("/edit/{id}")
    public LostItem updateLostItem(@PathVariable String id, @RequestBody LostItem newItem) {
        LostItem item = repository.findById(id).orElseThrow(() -> new RuntimeException("Lost item not found"));

        item.setName(newItem.getName().toUpperCase());
        item.setCategory(newItem.getCategory());
        item.setPlace(newItem.getPlace());
        item.setDescription(newItem.getDescription());
        item.setNamereport(newItem.getNamereport());
        item.setLocker(newItem.getLocker());
        return repository.save(item);
    }

    // 🔹 เพิ่ม QRUrl
    @PutMapping("/QR/{id}")
    public LostItem AddQRURL(@PathVariable String id, @RequestBody LostItem newItem) {
        LostItem item = repository.findById(id).orElseThrow(() -> new RuntimeException("Lost item not found"));
        item.setId_qr(newItem.getId_qr());
        return repository.save(item);
    }

    // 🔹 API สำหรับอัปโหลดรูปภาพไปยัง MongoDB GridFS
    @PostMapping(value = "/{id}/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public String uploadImage(@PathVariable String id, @RequestParam("file") MultipartFile file) {
        try {
            String fileId = gridFsService.uploadFile(file); // ✅ อัปโหลดไฟล์ไป GridFS
            LostItem item = repository.findById(id).orElseThrow(() -> new RuntimeException("Lost item not found"));
            item.setPicture(fileId); // ✅ บันทึก GridFS ID ไว้ใน DB
            repository.save(item);
            return fileId;
        } catch (IOException e) {
            return "Upload failed: " + e.getMessage();
        }
    }

    // 🔹 API สำหรับดึงรูปภาพจาก MongoDB GridFS
    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getImage(@PathVariable String id) {
        LostItem item = repository.findById(id).orElseThrow(() -> new RuntimeException("Lost item not found"));
        if (item.getPicture() == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            byte[] fileData = gridFsService.getFile(item.getPicture());
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + item.getPicture() + "\"")
                    .contentType(MediaType.IMAGE_JPEG) // ✅ สามารถเปลี่ยนเป็นไฟล์ประเภทอื่นได้
                    .body(fileData);
        } catch (IOException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
