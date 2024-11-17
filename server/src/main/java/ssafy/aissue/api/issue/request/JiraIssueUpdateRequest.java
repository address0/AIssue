package ssafy.aissue.api.issue.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Builder
public class JiraIssueUpdateRequest {

    @JsonProperty("fields")
    private Fields fields;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Fields {

        private String summary;

        private String status;

        private String description;

        private Priority priority;

        @JsonProperty("customfield_10031")
        private Double storyPoint;

    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Priority {
        private String name;
    }

}
