package ssafy.aissue.api.issue.response;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class IssueResponse {

    @JsonProperty("issue_id")
    private Long issueID;

    private String summary;

    private String description;

    private String priority;

    private String status;

    private String assignee;

    private LocalDateTime startAt;

    private LocalDateTime endAt;
}