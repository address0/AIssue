package ssafy.aissue.common.util;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.PutObjectRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import ssafy.aissue.common.exception.s3.PresignedUrlGenerationFailException;
import ssafy.aissue.common.exception.s3.S3UploadFailedException;
import ssafy.aissue.common.exception.s3.ExtensionNotAllowedException;
import ssafy.aissue.common.properties.S3Properties;

import java.io.IOException;
import java.net.URL;
import java.time.Duration;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class S3Util {

    private static final Set<String> allowedExtensions = Set.of(".jpg", ".jpeg", ".png", ".gif", ".PNG", ".JPG", ".JPEG", ".GIF");

    private final AmazonS3 amazonS3Client;
    private final S3Properties s3Properties;
    private final S3Presigner s3Presigner;

    private static @NotNull String getS3FileName(MultipartFile image, Long memberId, String location) {
        String originalFilename = image.getOriginalFilename();
        String extension = "";

        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
        }

        if (!allowedExtensions.contains(extension)) {
            throw new ExtensionNotAllowedException();
        }

        return location + memberId + extension;
    }

    public String uploadImageToS3(MultipartFile image, Long memberId, String location) {
        if (image == null || image.isEmpty()) {
            return null;
        }

        try {
            String fileName = getS3FileName(image, memberId, location);
            amazonS3Client.putObject(new PutObjectRequest(s3Properties.s3().bucket(), fileName, image.getInputStream(), null));
            return amazonS3Client.getUrl(s3Properties.s3().bucket(), fileName).toString();
        } catch (IOException e) {
            throw new S3UploadFailedException();
        }
    }

    public String getPresignedUrlFromS3(String imagePath) {
        try {
            String objectKey = imagePath.replace("https://ddada-image.s3.ap-northeast-2.amazonaws.com/", "");

            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(s3Properties.s3().bucket())
                    .key(objectKey)
                    .build();

            GetObjectPresignRequest getObjectPresignRequest = GetObjectPresignRequest.builder()
                    .getObjectRequest(getObjectRequest)
                    .signatureDuration(Duration.ofMinutes(10))
                    .build();

            PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(getObjectPresignRequest);
            URL presignedUrl = presignedRequest.url();

            log.info("{} 이미지에 대한 presigned URL 생성 성공", objectKey);
            log.info("presigned URL: {}", presignedUrl.toString());

            return presignedUrl.toString();
        } catch (Exception e) {
            log.error("Presigned URL 생성 중 오류 발생: {}", e.getMessage(), e);
            throw new PresignedUrlGenerationFailException();
        }
    }
}

