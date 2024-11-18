package ssafy.aissue.domain.project.entity;

import jakarta.persistence.*;

import lombok.Getter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public class BaseProjectEntity {
    @CreatedDate
    @Column(updatable = false)
    LocalDateTime createdAt;

    @LastModifiedDate
    LocalDateTime updatedAt;

}
