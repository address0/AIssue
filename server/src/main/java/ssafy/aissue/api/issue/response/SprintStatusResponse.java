package ssafy.aissue.api.issue.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SprintStatusResponse {

    @JsonProperty("sprint_id")
    private Long sprintId;

    @JsonProperty("is_sprint")
    private Boolean isSprint;

}
