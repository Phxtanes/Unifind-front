package com.example.backlostandfound.repository;

import com.example.backlostandfound.model.LostItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LostItemRepository extends MongoRepository<LostItem, String> {

    // ค้นหาตามสถานะ
    List<LostItem> findByStatus(String status);

    // ค้นหาตามสถานะและช่วงวันที่
    List<LostItem> findByStatusAndDateBetween(String status, LocalDateTime startDate, LocalDateTime endDate);

    // ค้นหาตามสถานะและหมายเลขล็อคเกอร์
    List<LostItem> findByStatusAndLocker(String status, Integer locker);

    // ค้นหาตามสถานะ ช่วงวันที่ และหมายเลขล็อคเกอร์
    List<LostItem> findByStatusAndDateBetweenAndLocker(String status, LocalDateTime startDate, LocalDateTime endDate, Integer locker);

    // ค้นหาตามชื่อสิ่งของ (case insensitive)
    @Query("{'name': {$regex: ?0, $options: 'i'}}")
    List<LostItem> findByNameContainingIgnoreCase(String name);

    // ค้นหาตามหมวดหมู่
    List<LostItem> findByCategory(String category);

    // ค้นหาตามสถานที่พบ
    @Query("{'place': {$regex: ?0, $options: 'i'}}")
    List<LostItem> findByPlaceContainingIgnoreCase(String place);

    // ฟังก์ชันใหม่สำหรับข้อมูลผู้พบ

    // ค้นหาตามประเภทผู้พบ
    List<LostItem> findByFinderType(String finderType);

    // ค้นหาตามเลขทะเบียนนักศึกษา
    List<LostItem> findByStudentId(String studentId);

    // ค้นหาตามอีเมลมหาลัย
    List<LostItem> findByUniversityEmail(String universityEmail);

    // ค้นหาตามเบอร์โทรศัพท์
    List<LostItem> findByPhoneNumber(String phoneNumber);

    // ค้นหาตามชื่อผู้แจ้ง
    @Query("{'namereport': {$regex: ?0, $options: 'i'}}")
    List<LostItem> findByNamereportContainingIgnoreCase(String namereport);

    // ค้นหาของหายของนักศึกษาตามเลขทะเบียนและสถานะ
    List<LostItem> findByStudentIdAndStatus(String studentId, String status);

    // ค้นหาตามประเภทผู้พบและสถานะ
    List<LostItem> findByFinderTypeAndStatus(String finderType, String status);

    // ค้นหาตามเบอร์โทรศัพท์และสถานะ
    List<LostItem> findByPhoneNumberAndStatus(String phoneNumber, String status);

    // ค้นหาข้อมูลสถิติ - นับจำนวนตามประเภทผู้พบ
    @Query(value = "{'finderType': ?0}", count = true)
    long countByFinderType(String finderType);

    // ค้นหาข้อมูลสถิติ - นับจำนวนตามประเภทผู้พบและสถานะ
    long countByFinderTypeAndStatus(String finderType, String status);

    // ค้นหาตามช่วงวันที่และประเภทผู้พบ
    List<LostItem> findByDateBetweenAndFinderType(LocalDateTime startDate, LocalDateTime endDate, String finderType);

    // ค้นหาตามหลายเงื่อนไข - สำหรับการค้นหาขั้นสูง
    @Query("{'$and': [" +
            "{'$or': [{'finderType': {$exists: false}}, {'finderType': ?0}]}," +
            "{'$or': [{'status': {$exists: false}}, {'status': ?1}]}," +
            "{'date': {$gte: ?2, $lte: ?3}}" +
            "]}")
    List<LostItem> findAdvanced(String finderType, String status, LocalDateTime startDate, LocalDateTime endDate);
}