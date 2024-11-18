package ssafy.aissue.api.issue.request;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class JiraSprintUpdateRequest {

    private String state;
}
