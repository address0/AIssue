package ssafy.aissue.domain.issue.common;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import ssafy.aissue.api.issue.request.IssueUpdateRequest;

import java.time.LocalDateTime;

@Getter
@MappedSuperclass
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
public abstract class BaseIssueEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String jiraId;

    @Column(nullable = false)
    private String jiraKey;

    private LocalDateTime startAt;
    private LocalDateTime endAt;

    public void updateStartAt(LocalDateTime newStartAt) {
        if (newStartAt != null && this.endAt != null && newStartAt.isAfter(this.endAt)) {
            throw new IllegalArgumentException("시작 일자가 종료 일자 이후입니다.");
        }
        this.startAt = newStartAt;
    }

    public void updateEndAt(LocalDateTime newEndAt) {
        if (newEndAt != null && this.startAt != null && newEndAt.isBefore(this.startAt)) {
            throw new IllegalArgumentException("종료 일자가 시작 일자 이전에 올 수 없습니다.");
        }
        this.endAt = newEndAt;
    }

//    public void updateFromDto(IssueUpdateRequest.Issue issue) {
//    }
//
//    public static Object toDto(Object o) {
//    }
}
