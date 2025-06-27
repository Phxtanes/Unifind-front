package com.example.backlostandfound.controller;

import com.example.backlostandfound.model.LostItem;
import com.example.backlostandfound.repository.LostItemRepository;
import com.example.backlostandfound.service.GridFsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/lost-items")
@CrossOrigin(origins = "http://localhost:3000")
public class LostItemController {

    @Autowired
    private LostItemRepository repository;

    @Autowired
    private GridFsService gridFsService;

    //  เพิ่มของหาย
    @PostMapping
    public LostItem addLostItem(@RequestBody LostItem item) {
        // Debug: แสดงข้อมูลที่ได้รับจาก Frontend
        System.out.println("=== DEBUG: Received data from frontend ===");
        System.out.println("Name: " + item.getName());
        System.out.println("Category: " + item.getCategory());
        System.out.println("Place: " + item.getPlace());
        System.out.println("Description: " + item.getDescription());
        System.out.println("NameReport: " + item.getNamereport());
        System.out.println("Locker: " + item.getLocker());
        System.out.println("FinderType: " + item.getFinderType());
        System.out.println("PhoneNumber: " + item.getPhoneNumber());
        System.out.println("StudentId: " + item.getStudentId());
        System.out.println("UniversityEmail: " + item.getUniversityEmail());
        System.out.println("=========================================");

        LostItem savedItem = repository.save(item);

        // Debug: แสดงข้อมูลที่บันทึกลงฐานข้อมูล
        System.out.println("=== DEBUG: Saved data to database ===");
        System.out.println("Saved ID: " + savedItem.getId());
        System.out.println("Saved FinderType: " + savedItem.getFinderType());
        System.out.println("Saved PhoneNumber: " + savedItem.getPhoneNumber());
        System.out.println("Saved StudentId: " + savedItem.getStudentId());
        System.out.println("Saved UniversityEmail: " + savedItem.getUniversityEmail());
        System.out.println("====================================");

        return savedItem;
    }

    // ดึงรายการของหายทั้งหมด
    @GetMapping
    public List<LostItem> getAllLostItems() {
        return repository.findAll();
    }

    // ดึงของหายตาม ID พร้อม normalize
    @GetMapping("/{id}")
    public LostItem getLostItemById(@PathVariable String id) {
        LostItem item = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lost item not found"));
        return normalizeItem(item);
    }

    //  ดึงของหายตามสถานะ "removed" พร้อม normalize
    @GetMapping("/status/removed")
    public List<LostItem> getLostItemsByRemoved(
            @RequestParam(required = false) String date,
            @RequestParam(required = false) Integer locker) {

        List<LostItem> items;

        if (date != null) {
            LocalDate localDate = LocalDate.parse(date.trim());
            LocalDateTime start = localDate.atStartOfDay();
            LocalDateTime end = localDate.plusDays(1).atStartOfDay();
            if (locker != null) {
                items = repository.findByStatusAndDateBetweenAndLocker("removed", start, end, locker);
            } else {
                items = repository.findByStatusAndDateBetween("removed", start, end);
            }
        } else if (locker != null) {
            items = repository.findByStatusAndLocker("removed", locker);
        } else {
            items = repository.findByStatus("removed");
        }

        // Normalize ข้อมูลทั้งหมด
        return items.stream()
                .map(this::normalizeItem)
                .collect(Collectors.toList());
    }

    //  ดึงของหายตามสถานะ "stored" พร้อม normalize
    @GetMapping("/status/stored")
    public List<LostItem> getLostItemsByStored(
            @RequestParam(required = false) String date,
            @RequestParam(required = false) Integer locker) {

        List<LostItem> items;

        if (date != null) {
            LocalDate localDate = LocalDate.parse(date.trim());
            LocalDateTime start = localDate.atStartOfDay();
            LocalDateTime end = localDate.plusDays(1).atStartOfDay();
            if (locker != null) {
                items = repository.findByStatusAndDateBetweenAndLocker("stored", start, end, locker);
            } else {
                items = repository.findByStatusAndDateBetween("stored", start, end);
            }
        } else if (locker != null) {
            items = repository.findByStatusAndLocker("stored", locker);
        } else {
            items = repository.findByStatus("stored");
        }

        // Normalize ข้อมูลทั้งหมด
        return items.stream()
                .map(this::normalizeItem)
                .collect(Collectors.toList());
    }

    // Helper method เพื่อ normalize ข้อมูล
    private LostItem normalizeItem(LostItem item) {
        if (item.getFinderType() == null) item.setFinderType("");
        if (item.getStudentId() == null) item.setStudentId("");
        if (item.getUniversityEmail() == null) item.setUniversityEmail("");
        if (item.getPhoneNumber() == null) item.setPhoneNumber("");
        return item;
    }

    //  อัปเดตสถานะของหายเป็น "removed"
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

        //  ถ้ามีไฟล์แนบ ให้ upload ไป GridFS
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

    // อัปเดตข้อมูลของหาย (รวมฟิลด์ใหม่)
    @PutMapping("/edit/{id}")
    public LostItem updateLostItem(@PathVariable String id, @RequestBody LostItem newItem) {
        System.out.println("=== DEBUG: Updating item with ID: " + id + " ===");
        System.out.println("New FinderType: " + newItem.getFinderType());
        System.out.println("New PhoneNumber: " + newItem.getPhoneNumber());
        System.out.println("New StudentId: " + newItem.getStudentId());
        System.out.println("New UniversityEmail: " + newItem.getUniversityEmail());

        LostItem item = repository.findById(id).orElseThrow(() -> new RuntimeException("Lost item not found"));

        item.setName(newItem.getName().toUpperCase());
        item.setCategory(newItem.getCategory());
        item.setPlace(newItem.getPlace());
        item.setDescription(newItem.getDescription());
        item.setNamereport(newItem.getNamereport());
        item.setLocker(newItem.getLocker());

        // อัปเดตฟิลด์ใหม่สำหรับข้อมูลผู้พบ
        if (newItem.getFinderType() != null) {
            item.setFinderType(newItem.getFinderType());
        }
        if (newItem.getPhoneNumber() != null) {
            item.setPhoneNumber(newItem.getPhoneNumber());
        }
        if (newItem.getStudentId() != null) {
            item.setStudentId(newItem.getStudentId());
        }
        if (newItem.getUniversityEmail() != null) {
            item.setUniversityEmail(newItem.getUniversityEmail());
        }

        LostItem savedItem = repository.save(item);
        System.out.println("=== DEBUG: Updated item saved ===");
        return savedItem;
    }

    //  ลบออกจาก DB
    @DeleteMapping("/delete/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteLostItem(@PathVariable String id) {
        LostItem item = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lost item not found"));

        // ตรวจสอบและลบไฟล์จาก GridFS ถ้ามีไฟล์ที่เกี่ยวข้อง
        if (item.getPicture() != null&& !item.getPicture().isEmpty()) {
            try {
                gridFsService.deleteFile(item.getPicture()); // ลบไฟล์รูปภาพจาก GridFS
            } catch (IOException e) {
                throw new RuntimeException("ลบไฟล์ใน GridFS ล้มเหลว", e);
            }
        }

        if (item.getIdentityDoc() != null && !item.getIdentityDoc().isEmpty()) {
            try {
                gridFsService.deleteFile(item.getIdentityDoc()); // ลบไฟล์เอกสารประจำตัวจาก GridFS
            } catch (IOException e) {
                throw new RuntimeException("ลบไฟล์เอกสารประจำตัวใน GridFS ล้มเหลว", e);
            }
        }

        // ลบข้อมูล LostItem จากฐานข้อมูล
        repository.delete(item);
    }

    // API สำหรับอัปโหลดรูปภาพไปยัง MongoDB GridFS
    @PostMapping(value = "/{id}/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public String uploadImage(@PathVariable String id, @RequestParam("file") MultipartFile file) {
        try {
            String fileId = gridFsService.uploadFile(file); //  อัปโหลดไฟล์ไป GridFS
            LostItem item = repository.findById(id).orElseThrow(() -> new RuntimeException("Lost item not found"));
            item.setPicture(fileId); //  บันทึก GridFS ID ไว้ใน DB
            repository.save(item);
            return fileId;
        } catch (IOException e) {
            return "Upload failed: " + e.getMessage();
        }
    }

    // API สำหรับดึงรูปภาพจาก MongoDB GridFS
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
                    .contentType(MediaType.IMAGE_JPEG) //  สามารถเปลี่ยนเป็นไฟล์ประเภทอื่นได้
                    .body(fileData);
        } catch (IOException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}/identityDoc")
    public ResponseEntity<byte[]> getIdentityDoc(@PathVariable String id) {
        LostItem item = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lost item not found"));

        if (item.getIdentityDoc() == null) {
            return ResponseEntity.notFound().build();
        }
        try {
            byte[] fileData = gridFsService.getFile(item.getIdentityDoc());
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + item.getIdentityDoc() + "\"")
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(fileData);
        } catch (IOException e) {
            return ResponseEntity.badRequest().build();
        }
    }

}