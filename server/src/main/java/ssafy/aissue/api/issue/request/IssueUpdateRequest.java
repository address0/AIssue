package ssafy.aissue.api.issue.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;

import java.util.Optional;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class IssueUpdateRequest {

    @NotBlank
    @JsonProperty("issue_id")
    private Long issueId;

    @NotBlank
    @JsonProperty("issue_key")
    private String issueKey;

    private String summary;

    private String status;

    private String description;

    private final String priority;

    @JsonProperty("story_points")
    private final Double storyPoint;


}