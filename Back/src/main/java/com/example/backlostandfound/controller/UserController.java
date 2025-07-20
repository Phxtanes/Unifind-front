package com.example.backlostandfound.controller;

import com.example.backlostandfound.model.User;
import com.example.backlostandfound.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService userService;

    // สมัครสมาชิก (สำหรับเจ้าหน้าที่)
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody User user) {
        Map<String, Object> response = new HashMap<>();

        try {
            // ตรวจสอบข้อมูลพื้นฐาน
            if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "กรุณากรอก Username");
                return ResponseEntity.badRequest().body(response);
            }

            if (user.getPassword() == null || user.getPassword().length() < 6) {
                response.put("success", false);
                response.put("message", "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
                return ResponseEntity.badRequest().body(response);
            }

            if (user.getEmail() == null || !user.getEmail().contains("@")) {
                response.put("success", false);
                response.put("message", "กรุณากรอก Email ที่ถูกต้อง");
                return ResponseEntity.badRequest().body(response);
            }

            User newUser = userService.registerUser(user);

            // ไม่ส่งรหัสผ่านกลับไป
            newUser.setPassword(null);

            response.put("success", true);
            response.put("message", "สมัครสมาชิกสำเร็จ กรุณารอการอนุมัติจากผู้ดูแลระบบเพื่อเป็นเจ้าหน้าที่");
            response.put("user", newUser);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "เกิดข้อผิดพลาดในระบบ");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ล็อกอิน
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginData) {
        Map<String, Object> response = new HashMap<>();

        try {
            String usernameOrEmail = loginData.get("username");
            String password = loginData.get("password");

            if (usernameOrEmail == null || usernameOrEmail.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "กรุณากรอก Username หรือ Email");
                return ResponseEntity.badRequest().body(response);
            }

            if (password == null || password.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "กรุณากรอกรหัสผ่าน");
                return ResponseEntity.badRequest().body(response);
            }

            User user = userService.authenticateUser(usernameOrEmail.trim(), password);

            // ไม่ส่งรหัสผ่านกลับไป
            user.setPassword(null);

            response.put("success", true);
            response.put("message", "เข้าสู่ระบบสำเร็จ");
            response.put("user", user);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "เกิดข้อผิดพลาดในระบบ");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ดึงข้อมูลผู้ใช้ทั้งหมด (สำหรับ admin)
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        // ลบรหัสผ่านออกจากการส่งกลับ
        users.forEach(user -> user.setPassword(null));
        return ResponseEntity.ok(users);
    }

    // ดึงข้อมูลผู้ใช้ที่รอการอนุมัติ (สำหรับ admin)
    @GetMapping("/users/pending")
    public ResponseEntity<List<User>> getPendingApprovalUsers() {
        List<User> users = userService.getPendingApprovalUsers();
        // ลบรหัสผ่านออกจากการส่งกลับ
        users.forEach(user -> user.setPassword(null));
        return ResponseEntity.ok(users);
    }

    // ดึงข้อมูลผู้ใช้ตาม ID
    @GetMapping("/user/{id}")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();

        try {
            User user = userService.findById(id).orElse(null);
            if (user != null) {
                user.setPassword(null); // ไม่ส่งรหัสผ่านกลับไป
                response.put("success", true);
                response.put("user", user);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "ไม่พบผู้ใช้");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "เกิดข้อผิดพลาดในระบบ");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // อนุมัติผู้ใช้ (เปลี่ยนจาก member เป็น staff)
    @PutMapping("/user/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveUser(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();

        try {
            User user = userService.approveUser(id);
            user.setPassword(null);

            response.put("success", true);
            response.put("message", "อนุมัติผู้ใช้เป็นเจ้าหน้าที่สำเร็จ");
            response.put("user", user);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "เกิดข้อผิดพลาดในระบบ");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ปฏิเสธการอนุมัติผู้ใช้
    @PutMapping("/user/{id}/reject")
    public ResponseEntity<Map<String, Object>> rejectUser(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();

        try {
            User user = userService.rejectUser(id);
            user.setPassword(null);

            response.put("success", true);
            response.put("message", "ปฏิเสธการขอเป็นเจ้าหน้าที่สำเร็จ");
            response.put("user", user);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "เกิดข้อผิดพลาดในระบบ");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // อัปเดตข้อมูลผู้ใช้
    @PutMapping("/user/{id}")
    public ResponseEntity<Map<String, Object>> updateUser(@PathVariable String id, @RequestBody User userDetails) {
        Map<String, Object> response = new HashMap<>();

        try {
            User updatedUser = userService.updateUser(id, userDetails);
            updatedUser.setPassword(null); // ไม่ส่งรหัสผ่านกลับไป

            response.put("success", true);
            response.put("message", "อัปเดตข้อมูลสำเร็จ");
            response.put("user", updatedUser);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "เกิดข้อผิดพลาดในระบบ");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // เปลี่ยนรหัสผ่าน
    @PutMapping("/user/{id}/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(
            @PathVariable String id,
            @RequestBody Map<String, String> passwordData) {

        Map<String, Object> response = new HashMap<>();

        try {
            String oldPassword = passwordData.get("oldPassword");
            String newPassword = passwordData.get("newPassword");

            if (oldPassword == null || newPassword == null) {
                response.put("success", false);
                response.put("message", "กรุณากรอกรหัสผ่านเก่าและใหม่");
                return ResponseEntity.badRequest().body(response);
            }

            if (newPassword.length() < 6) {
                response.put("success", false);
                response.put("message", "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร");
                return ResponseEntity.badRequest().body(response);
            }

            userService.changePassword(id, oldPassword, newPassword);

            response.put("success", true);
            response.put("message", "เปลี่ยนรหัสผ่านสำเร็จ");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "เกิดข้อผิดพลาดในระบบ");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ปิดการใช้งานผู้ใช้
    @PutMapping("/user/{id}/deactivate")
    public ResponseEntity<Map<String, Object>> deactivateUser(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();

        try {
            User user = userService.deactivateUser(id);
            user.setPassword(null);

            response.put("success", true);
            response.put("message", "ปิดการใช้งานผู้ใช้สำเร็จ");
            response.put("user", user);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "เกิดข้อผิดพลาดในระบบ");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // เปิดการใช้งานผู้ใช้
    @PutMapping("/user/{id}/activate")
    public ResponseEntity<Map<String, Object>> activateUser(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();

        try {
            User user = userService.activateUser(id);
            user.setPassword(null);

            response.put("success", true);
            response.put("message", "เปิดการใช้งานผู้ใช้สำเร็จ");
            response.put("user", user);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "เกิดข้อผิดพลาดในระบบ");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ลบผู้ใช้
    @DeleteMapping("/user/{id}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();

        try {
            userService.deleteUser(id);

            response.put("success", true);
            response.put("message", "ลบผู้ใช้สำเร็จ");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "เกิดข้อผิดพลาดในระบบ");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}