package com.example.backlostandfound.repository;

import com.example.backlostandfound.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    // ค้นหาผู้ใช้ตาม username
    Optional<User> findByUsername(String username);

    // ค้นหาผู้ใช้ตาม email
    Optional<User> findByEmail(String email);

    // ค้นหาผู้ใช้ตาม username หรือ email
    Optional<User> findByUsernameOrEmail(String username, String email);

    // ตรวจสอบว่า username มีอยู่แล้วหรือไม่
    boolean existsByUsername(String username);

    // ตรวจสอบว่า email มีอยู่แล้วหรือไม่
    boolean existsByEmail(String email);

    // ค้นหาผู้ใช้ที่ active
    List<User> findByIsActive(Boolean isActive);

    // ค้นหาผู้ใช้ตาม role
    List<User> findByRole(String role);

    // ค้นหาผู้ใช้ที่ active และมี role ที่กำหนด
    List<User> findByIsActiveAndRole(Boolean isActive, String role);

    // ค้นหาผู้ใช้สำหรับการ login (active เท่านั้น)
    Optional<User> findByUsernameAndIsActive(String username, Boolean isActive);

    Optional<User> findByEmailAndIsActive(String email, Boolean isActive);
}