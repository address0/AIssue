package ssafy.aissue.api.issue.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class IssueStatusRequest {

    @NotBlank
    @JsonProperty("issue_key")
    private String issueKey;

    @NotBlank
    private String status;

}