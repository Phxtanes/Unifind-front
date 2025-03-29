package com.example.backlostandfound.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.UUID;

@Document(collection = "Unifind")
public class LostItem {
    @Id
    private String id;

    private String name;
    private String category;
    private String place;
    private LocalDateTime date;
    private String description;
    private String picture;
    private String namereport;
    private Long locker;
    private String id_qr;
    private String status;
    private String identityDoc;
    private String receiver;

    public LostItem() {
        this.id = UUID.randomUUID().toString();  // สร้าง ID อัตโนมัติ
    }

    public LostItem(String name, String category, String place, LocalDateTime date, String description,
                    String picture, String namereport, Long locker, String id_qr, String status,
                    String identityDoc, String receiver) {
        this.id = UUID.randomUUID().toString();
        this.name = name;
        this.category = category;
        this.place = place;
        this.date = date;
        this.description = description;
        this.picture = picture;
        this.namereport = namereport;
        this.locker = locker;
        this.id_qr = id_qr;
        this.status = status;
        this.identityDoc = identityDoc;
        this.receiver = receiver;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getPlace() {
        return place;
    }

    public void setPlace(String place) {
        this.place = place;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPicture() {
        return picture;
    }

    public void setPicture(String picture) {
        this.picture = picture;
    }

    public String getNamereport() {
        return namereport;
    }

    public void setNamereport(String namereport) {
        this.namereport = namereport;
    }

    public Long getLocker() {
        return locker;
    }

    public void setLocker(Long locker) {
        this.locker = locker;
    }

    public String getId_qr() {
        return id_qr;
    }

    public void setId_qr(String id_qr) {
        this.id_qr = id_qr;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getIdentityDoc() {
        return identityDoc;
    }

    public void setIdentityDoc(String identityDoc) {
        this.identityDoc = identityDoc;
    }

    public String getReceiver() {
        return receiver;
    }

    public void setReceiver(String receiver) {
        this.receiver = receiver;
    }
}
