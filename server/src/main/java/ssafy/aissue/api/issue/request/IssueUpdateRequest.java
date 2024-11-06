package ssafy.aissue.api.issue.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class IssueUpdateRequest {

    @NotNull
    private final List<Issue> issues;

    @Getter
    @Builder
    public static class Issue {

        @NotNull
        @JsonProperty("issue_id")
        private final Long issueId;

        @NotBlank
        private final String summary;

        private final String description;

        @NotBlank
        private final String status;

        @NotBlank
        private final String priority;

        @JsonProperty("story_points")
        private final Double storyPoints;

        @JsonProperty("parent_issue_id")
        private final Long parentIssueId;
    }
}
