package com.example.backlostandfound.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.UUID;

@Document(collection = "lost_items")
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

    public String getCategory() {
        return category;
    }

    public String getPlace() {
        return place;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public String getDescription() {
        return description;
    }

    public String getPicture() {
        return picture;
    }

    public String getNamereport() {
        return namereport;
    }

    public Long getLocker() {
        return locker;
    }

    public String getId_qr() {
        return id_qr;
    }

    public String getStatus() {
        return status;
    }

    public String getIdentityDoc() {
        return identityDoc;
    }

    public String getReceiver() {
        return receiver;
    }
}
