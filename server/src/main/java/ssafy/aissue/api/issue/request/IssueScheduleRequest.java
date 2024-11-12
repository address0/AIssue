package ssafy.aissue.api.issue.request;


import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;


public class IssueScheduleRequest {

    @JsonProperty("issue_id")
    private Long issueId;

    @JsonProperty("start_at")
    private LocalDateTime startAt;

    @JsonProperty("end_at")
    private LocalDateTime endAt;

    private String issuetype;

}
