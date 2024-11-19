package ssafy.aissue.api.issue.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ssafy.aissue.common.util.DateConverter;

import java.time.LocalDateTime;

@Slf4j
@Getter
@RequiredArgsConstructor
public class IssueRequest {

    @NotBlank
    private final String summary;

    private final String description;

    @NotBlank
    private final String issuetype;

    private final String priority;

    @JsonProperty("story_points")
    private final Double storyPoint;

    private final String parent;

    @JsonProperty("start_at")
    private final String startAt;

    @JsonProperty("end_at")
    private final String endAt;

    public JiraIssueCreateRequest.Fields toFields(String projectKey, String assigneeAccountId, Long sprintId) {
        // 기본적으로 fields 빌더 생성
        JiraIssueCreateRequest.Fields.FieldsBuilder fieldsBuilder = JiraIssueCreateRequest.Fields.builder()
                .project(JiraIssueCreateRequest.Project.builder().key(projectKey).build())
                .summary(this.summary)
                .description(this.description)
                .priority(JiraIssueCreateRequest.Priority.builder().name(this.priority).build())
                .issuetype(JiraIssueCreateRequest.IssueType.builder().name(this.issuetype).build())
                .storyPoint(this.storyPoint);

        // issuetype이 '스토리', '버그', '작업'일 때만 sprintId 할당
        if ("Story".equals(this.issuetype) || "Bug".equals(this.issuetype) || "Task".equals(this.issuetype)) {
            fieldsBuilder.sprintId(sprintId);
        }

        // 에픽은 담당자와 부모를 할당할 수 없음
        if (!"Epic".equals(this.issuetype)) {
            fieldsBuilder.assignee(JiraIssueCreateRequest.Assignee.builder().accountId(assigneeAccountId).build());
            fieldsBuilder.parent(JiraIssueCreateRequest.Parent.builder().key(this.parent).build());
        }

        // fields 객체 반환
        return fieldsBuilder.build();
    }

    // start_at을 LocalDateTime으로 변환
    public LocalDateTime getStartAtAsLocalDateTime() {
        return DateConverter.convertStartAtToLocalDateTime(this.startAt);
    }

    // end_at을 LocalDateTime으로 변환
    public LocalDateTime getEndAtAsLocalDateTime() {
        return DateConverter.convertEndAtToLocalDateTime(this.endAt);
    }
}
