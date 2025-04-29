package com.example.backlostandfound.service;

import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSBuckets;
import com.mongodb.client.gridfs.model.GridFSUploadOptions;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.io.InputStream;
import java.io.ByteArrayOutputStream;

@Service
public class GridFsService {

    private final GridFSBucket gridFSBucket;

    @Autowired
    public GridFsService(MongoDatabaseFactory mongoDatabaseFactory) {
        this.gridFSBucket = GridFSBuckets.create(mongoDatabaseFactory.getMongoDatabase());
    }

    // ✅ อัปโหลดไฟล์ไปยัง MongoDB GridFS
    public String uploadFile(MultipartFile file) throws IOException {
        try (InputStream inputStream = file.getInputStream()) {
            GridFSUploadOptions options = new GridFSUploadOptions()
                    .metadata(new org.bson.Document("contentType", file.getContentType()));

            ObjectId fileId = gridFSBucket.uploadFromStream(file.getOriginalFilename(), inputStream, options);
            return fileId.toString();  // คืนค่า ID ของไฟล์ที่อัปโหลด
        }
    }

    // ✅ ดึงไฟล์จาก MongoDB GridFS ตาม ID
    public byte[] getFile(String id) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        gridFSBucket.downloadToStream(new ObjectId(id), outputStream);
        return outputStream.toByteArray();
    }

    // ✅ ลบไฟล์จาก MongoDB GridFS ตาม ID
    public void deleteFile(String fileId) throws IOException {
        if (fileId != null) {
            ObjectId objectId = new ObjectId(fileId); // เปลี่ยนเป็น ObjectId
            gridFSBucket.delete(objectId); // ลบไฟล์จาก GridFS
        }
    }
}

