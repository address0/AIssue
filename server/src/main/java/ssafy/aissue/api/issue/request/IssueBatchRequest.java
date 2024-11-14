package ssafy.aissue.api.issue.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Getter
@RequiredArgsConstructor
public class IssueBatchRequest {

    @NotNull
    @JsonProperty("project")
    private final String projectKey;

    @NotNull
    @NotEmpty
    private final List<IssueRequest> issues;

    public List<JiraIssueCreateRequest.IssueUpdate> toIssueUpdates(String assigneeAccountId, Long sprintId) {
        return issues.stream()
                .map(issue -> {
                    // IssueRequest의 toFields 메서드 호출
                    JiraIssueCreateRequest.Fields fields = issue.toFields(projectKey, assigneeAccountId, sprintId);

                    // IssueUpdate 객체 생성
                    return new JiraIssueCreateRequest.IssueUpdate(fields);
                })
                .toList();
    }
}
