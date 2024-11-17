package ssafy.aissue.api.issue.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Builder
public class JiraStatusUpdateRequest {

    private Transition transition;

    @Getter
    @Builder
    public static class Transition {
        private String id;  // transition id
    }

}
