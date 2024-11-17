package ssafy.aissue.api.issue.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class IssueDetailResponse {

    private Long id;
    private String key;
    private String summary;
    private String description;
    private String priority;
    private String status;
    private String assignee;
    @JsonProperty("story_points")
    private Double storyPoints;
    private String parent;
    private String issuetype;
    private IssueLink issuelink;

    public IssueDetailResponse(Long id, String key, String summary, String description, String priority, String status, String assignee, Double storyPoints, String parent, String issuetype, IssueLink issuelink) {
        this.id = id;
        this.key = key;
        this.summary = summary != null ? summary : "";
        this.description = description != null ? description : "";
        this.priority = priority != null ? priority : "";
        this.status = status != null ? status : "";
        this.assignee = assignee != null ? assignee : "";
        this.storyPoints = storyPoints != null ? storyPoints : 0.0;
        this.parent = parent != null ? parent : "";
        this.issuetype = issuetype;
        this.issuelink = issuelink;
    }

    @Getter
    @Builder
    public static class IssueLink {
        String type;
        IssueLinkIssue inwardIssue;
        IssueLinkIssue outwardIssue;

        public IssueLink(String type, IssueLinkIssue inwardIssue, IssueLinkIssue outwardIssue) {
            this.type = type;
            this.inwardIssue = inwardIssue;
            this.outwardIssue = outwardIssue;
        }

        @Getter
        @Builder
        public static class IssueLinkIssue {
            Long id;
            String key;
            String summary;
            String priority;
            String status;
            String issuetype;

            public IssueLinkIssue (Long id, String key, String summary, String priority, String status, String issuetype) {
                this.id = id;
                this.key = key;
                this.summary = summary;
                this.priority = priority;
                this.status = status;
                this.issuetype = issuetype;
            }
        }
    }
}
