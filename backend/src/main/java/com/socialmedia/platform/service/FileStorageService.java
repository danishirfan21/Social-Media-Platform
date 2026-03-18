package com.socialmedia.platform.service;

import com.socialmedia.platform.exception.FileStorageException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileStorageService {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.s3.region}")
    private String region;

    public String uploadFile(MultipartFile file) {
        String fileName = generateFileName(file);

        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .acl(ObjectCannedACL.PUBLIC_READ)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            return String.format("https://%s.s3.%s.amazonaws.com/%s",
                    bucketName, region, fileName);
        } catch (IOException e) {
            log.error("Failed to upload file to S3", e);
            throw new FileStorageException("Could not upload file: " + file.getOriginalFilename(), e);
        }
    }

    private String generateFileName(MultipartFile file) {
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = "";

        int lastIndex = originalFileName.lastIndexOf('.');
        if (lastIndex != -1) {
            fileExtension = originalFileName.substring(lastIndex);
        }

        return UUID.randomUUID().toString() + fileExtension;
    }
}
