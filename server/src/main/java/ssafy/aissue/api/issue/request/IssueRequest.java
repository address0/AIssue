package ssafy.aissue.api.issue.request;

import lombok.Getter;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;

@Getter
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
public class IssueRequest extends BaseIssueRequest {

    private final String parent;

    public IssueRequest(String summary, String description, String issuetype, String priority, Double storyPoint, String parent) {
        super(summary, description, issuetype, priority, storyPoint);
        this.parent = parent;
    }

    public IssueUpdateRequest.Issue toEntity(String jiraIssueId) {
        return null;
    }
}
