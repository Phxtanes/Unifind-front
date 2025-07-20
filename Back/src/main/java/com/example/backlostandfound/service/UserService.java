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

    // สมัครสมาชิกใหม่ (เป็น member ก่อน รอการอนุมัติ)
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

        // สำหรับผู้ใช้ใหม่ที่สมัครผ่านหน้าเว็บ จะเป็น member และรอการอนุมัติ
        user.setRole("member");
        user.setIsApproved(false);

        return userRepository.save(user);
    }

    // ล็อกอิน - เฉพาะ staff และ admin ที่ approved เท่านั้น
    public User authenticateUser(String usernameOrEmail, String password) {
        Optional<User> userOpt;

        // ค้นหาผู้ใช้ด้วย username หรือ email
        if (usernameOrEmail.contains("@")) {
            userOpt = userRepository.findByEmail(usernameOrEmail);
        } else {
            userOpt = userRepository.findByUsername(usernameOrEmail);
        }

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // ตรวจสอบรหัสผ่านก่อน
            if (!PasswordUtil.verifyPassword(password, user.getPassword())) {
                throw new RuntimeException("Username/Email หรือ Password ไม่ถูกต้อง");
            }

            // ตรวจสอบว่าบัญชียังใช้งานได้หรือไม่
            if (!user.getIsActive()) {
                throw new RuntimeException("บัญชีของคุณถูกปิดการใช้งาน กรุณาติดต่อผู้ดูแลระบบ");
            }

            //  ห้าม member เข้าสู่ระบบโดยเด็ดขาด
            if ("member".equals(user.getRole())) {
                throw new RuntimeException("บัญชีของคุณยังไม่ได้รับการอนุมัติจากผู้ดูแลระบบ กรุณารอการอนุมัติเพื่อเป็นเจ้าหน้าที่");
            }

            //  ตรวจสอบ staff ที่ยังไม่ได้รับการอนุมัติ
            if ("staff".equals(user.getRole()) && !user.getIsApproved()) {
                throw new RuntimeException("บัญชีของคุณยังไม่ได้รับการอนุมัติ กรุณารอการอนุมัติจากผู้ดูแลระบบ");
            }

            // ตรวจสอบว่าเป็น admin หรือ staff ที่ได้รับการอนุมัติแล้วเท่านั้น
            if (!("admin".equals(user.getRole()) || ("staff".equals(user.getRole()) && user.getIsApproved()))) {
                throw new RuntimeException("คุณไม่มีสิทธิ์เข้าสู่ระบบ กรุณาติดต่อผู้ดูแลระบบ");
            }

            return user;
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

    // ดึงรายการผู้ใช้ที่รอการอนุมัติ (member ที่รอเป็น staff)
    public List<User> getPendingApprovalUsers() {
        return userRepository.findByRoleAndIsApproved("member", false);
    }

    // อนุมัติผู้ใช้ (เปลี่ยนจาก member เป็น staff)
    public User approveUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ไม่พบผู้ใช้"));

        // ตรวจสอบว่าเป็น member ที่รอการอนุมัติหรือไม่
        if (!"member".equals(user.getRole())) {
            throw new RuntimeException("ไม่สามารถอนุมัติผู้ใช้นี้ได้ เนื่องจากไม่ได้อยู่ในสถานะรอการอนุมัติ");
        }

        // เปลี่ยนจาก member เป็น staff และอนุมัติ
        user.setRole("staff");
        user.setIsApproved(true);

        return userRepository.save(user);
    }

    // ปฏิเสธการอนุมัติผู้ใช้ (ยังคงเป็น member แต่ไม่อนุมัติ)
    public User rejectUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ไม่พบผู้ใช้"));

        // ตรวจสอบว่าเป็น member ที่รอการอนุมัติหรือไม่
        if (!"member".equals(user.getRole())) {
            throw new RuntimeException("ไม่สามารถปฏิเสธผู้ใช้นี้ได้ เนื่องจากไม่ได้อยู่ในสถานะรอการอนุมัติ");
        }

        // ยังคงเป็น member แต่ปฏิเสธการอนุมัติ
        user.setIsApproved(false);

        return userRepository.save(user);
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
            String oldRole = user.getRole();
            user.setRole(userDetails.getRole());

            // จัดการสิทธิ์ตาม role ใหม่
            if ("admin".equals(userDetails.getRole())) {
                user.setIsApproved(true); // admin อนุมัติอัตโนมัติ
            } else if ("member".equals(userDetails.getRole())) {
                user.setIsApproved(false); // member ไม่อนุมัติ
            } else if ("staff".equals(userDetails.getRole())) {
                // ถ้าเปลี่ยนเป็น staff และเดิมไม่ใช่ staff ให้ต้องอนุมัติใหม่
                if (!"staff".equals(oldRole)) {
                    user.setIsApproved(false);
                }
            }
        }

        if (userDetails.getIsActive() != null) {
            user.setIsActive(userDetails.getIsActive());
        }

        if (userDetails.getIsApproved() != null) {
            user.setIsApproved(userDetails.getIsApproved());
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