package com.example.backlostandfound.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.UUID;

@Document(collection = "users")
public class User {
    @Id
    private String id;

    @Indexed(unique = true)
    private String username;

    private String password;

    @Indexed(unique = true)
    private String email;

    private LocalDateTime createdAt;
    private Boolean isActive;
    private String role; // "admin", "staff", "member"
    private Boolean isApproved; // สำหรับการอนุมัติผู้ใช้ใหม่

    public User() {
        this.id = UUID.randomUUID().toString();
        this.createdAt = LocalDateTime.now();
        this.isActive = true; // ค่าเริ่มต้นเป็น active
        this.role = "member"; // ค่าเริ่มต้นเป็น member (รอการอนุมัติ)
        this.isApproved = false; // ค่าเริ่มต้นยังไม่ได้รับการอนุมัติ
    }

    public User(String username, String password, String email, String role) {
        this();
        this.username = username;
        this.password = password;
        this.email = email;
        // ถ้าเป็น admin ให้อนุมัติอัตโนมัติ, ถ้าไม่ใช่ให้เป็น member และรอการอนุมัติ
        if ("admin".equals(role)) {
            this.role = role;
            this.isApproved = true;
        } else {
            this.role = "member";
            this.isApproved = false;
        }
    }

    // Getters และ Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Boolean getIsApproved() {
        return isApproved;
    }

    public void setIsApproved(Boolean isApproved) {
        this.isApproved = isApproved;
    }

    @Override
    public String toString() {
        return "User{" +
                "id='" + id + '\'' +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", createdAt=" + createdAt +
                ", isActive=" + isActive +
                ", role='" + role + '\'' +
                ", isApproved=" + isApproved +
                '}';
    }
}