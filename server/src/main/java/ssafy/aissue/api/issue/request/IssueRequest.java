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
                .priority(JiraIssueCreateRequest.Priority.builder().name(this.priority).build())
                .issuetype(JiraIssueCreateRequest.IssueType.builder().name(this.issuetype).build())
                .assignee(JiraIssueCreateRequest.Assignee.builder().accountId(assigneeAccountId).build())
                .storyPoint(this.storyPoint)
                .parent(JiraIssueCreateRequest.Parent.builder().key(this.parent).build());

        // issuetype이 '스토리'일 때만 sprintId 할당
        if ("Story".equals(this.issuetype)) {
            fieldsBuilder.sprintId(sprintId);
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
