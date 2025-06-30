package com.example.backlostandfound.util;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

public class PasswordUtil {

    private static final String ALGORITHM = "SHA-256";
    private static final int SALT_LENGTH = 16;

    // สร้าง salt แบบสุ่ม
    public static String generateSalt() {
        SecureRandom random = new SecureRandom();
        byte[] salt = new byte[SALT_LENGTH];
        random.nextBytes(salt);
        return Base64.getEncoder().encodeToString(salt);
    }

    // เข้ารหัสรหัสผ่านพร้อม salt
    public static String hashPassword(String password, String salt) {
        try {
            MessageDigest md = MessageDigest.getInstance(ALGORITHM);
            md.update(Base64.getDecoder().decode(salt));
            byte[] hashedPassword = md.digest(password.getBytes());
            return Base64.getEncoder().encodeToString(hashedPassword);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }

    // เข้ารหัสรหัสผ่าน (สร้าง salt ใหม่)
    public static String encodePassword(String password) {
        String salt = generateSalt();
        String hashedPassword = hashPassword(password, salt);
        return salt + ":" + hashedPassword; // เก็บ salt และ hash รวมกัน
    }

    // ตรวจสอบรหัสผ่าน
    public static boolean verifyPassword(String password, String encodedPassword) {
        try {
            String[] parts = encodedPassword.split(":");
            if (parts.length != 2) {
                return false;
            }

            String salt = parts[0];
            String storedHash = parts[1];
            String hashedInput = hashPassword(password, salt);

            return storedHash.equals(hashedInput);
        } catch (Exception e) {
            return false;
        }
    }
}