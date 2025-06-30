package com.example.backlostandfound.service;

import com.example.backlostandfound.model.User;
import com.example.backlostandfound.repository.UserRepository;
import com.example.backlostandfound.util.PasswordUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // สมัครสมาชิกใหม่
    public User registerUser(User user) {
        // ตรวจสอบว่า username หรือ email มีอยู่แล้วหรือไม่
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username นี้มีผู้ใช้แล้ว");
        }

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email นี้มีผู้ใช้แล้ว");
        }

        // เข้ารหัสรหัสผ่านด้วย PasswordUtil
        user.setPassword(PasswordUtil.encodePassword(user.getPassword()));

        return userRepository.save(user);
    }

    // ล็อกอิน
    public User authenticateUser(String usernameOrEmail, String password) {
        Optional<User> userOpt;

        // ค้นหาผู้ใช้ด้วย username หรือ email
        if (usernameOrEmail.contains("@")) {
            userOpt = userRepository.findByEmailAndIsActive(usernameOrEmail, true);
        } else {
            userOpt = userRepository.findByUsernameAndIsActive(usernameOrEmail, true);
        }

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // ตรวจสอบรหัสผ่านด้วย PasswordUtil
            if (PasswordUtil.verifyPassword(password, user.getPassword())) {
                return user;
            }
        }

        throw new RuntimeException("Username/Email หรือ Password ไม่ถูกต้อง");
    }

    // ค้นหาผู้ใช้ตาม ID
    public Optional<User> findById(String id) {
        return userRepository.findById(id);
    }

    // ค้นหาผู้ใช้ตาม username
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    // ดึงรายการผู้ใช้ทั้งหมด
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ดึงรายการผู้ใช้ที่ active
    public List<User> getActiveUsers() {
        return userRepository.findByIsActive(true);
    }

    // อัปเดตข้อมูลผู้ใช้
    public User updateUser(String id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ไม่พบผู้ใช้"));

        // อัปเดตข้อมูลที่สามารถเปลี่ยนได้
        if (userDetails.getEmail() != null) {
            // ตรวจสอบว่า email ใหม่ไม่ซ้ำกับผู้ใช้คนอื่น
            if (!user.getEmail().equals(userDetails.getEmail()) &&
                    userRepository.existsByEmail(userDetails.getEmail())) {
                throw new RuntimeException("Email นี้มีผู้ใช้แล้ว");
            }
            user.setEmail(userDetails.getEmail());
        }

        if (userDetails.getRole() != null) {
            user.setRole(userDetails.getRole());
        }

        if (userDetails.getIsActive() != null) {
            user.setIsActive(userDetails.getIsActive());
        }

        return userRepository.save(user);
    }

    // เปลี่ยนรหัสผ่าน
    public User changePassword(String id, String oldPassword, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ไม่พบผู้ใช้"));

        // ตรวจสอบรหัสผ่านเก่าด้วย PasswordUtil
        if (!PasswordUtil.verifyPassword(oldPassword, user.getPassword())) {
            throw new RuntimeException("รหัสผ่านเก่าไม่ถูกต้อง");
        }

        // เข้ารหัสรหัสผ่านใหม่ด้วย PasswordUtil
        user.setPassword(PasswordUtil.encodePassword(newPassword));

        return userRepository.save(user);
    }

    // ปิดการใช้งานผู้ใช้ (แทนการลบ)
    public User deactivateUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ไม่พบผู้ใช้"));

        user.setIsActive(false);
        return userRepository.save(user);
    }

    // เปิดการใช้งานผู้ใช้
    public User activateUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ไม่พบผู้ใช้"));

        user.setIsActive(true);
        return userRepository.save(user);
    }

    // ลบผู้ใช้จริง (ควรใช้อย่างระมัดระวัง)
    public void deleteUser(String id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("ไม่พบผู้ใช้");
        }
        userRepository.deleteById(id);
    }
}