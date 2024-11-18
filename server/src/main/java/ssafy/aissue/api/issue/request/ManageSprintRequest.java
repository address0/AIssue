package ssafy.aissue.api.issue.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ManageSprintRequest {

    @JsonProperty("project")
    private String projectKey;

    @JsonProperty("sprint_id")
    private Long sprintId;

    @Getter
    @JsonProperty("is_start")
    private boolean start;

}
