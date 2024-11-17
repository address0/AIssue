package ssafy.aissue.api.issue.request;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class IssueScheduleRequest {

    @JsonProperty("issue_id")
    private Long issueId;

    @JsonProperty("issue_key")
    private String issueKey;

    @JsonProperty("start_at")
    private LocalDateTime startAt;

    @JsonProperty("end_at")
    private LocalDateTime endAt;

    private String issuetype;

}
