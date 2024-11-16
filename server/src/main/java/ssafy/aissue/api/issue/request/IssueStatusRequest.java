package ssafy.aissue.api.issue.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class IssueStatusRequest {
    @JsonProperty("issue_id")
    private Long issueId;

    @JsonProperty("issue_key")
    private String issueKey;

    private String status;

}