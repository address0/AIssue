package ssafy.aissue.api.issue.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record IssueLinkRequest(
        @NotNull @NotEmpty List<IssueLink> issueLinks
) {
    public record IssueLink(
            @NotBlank String type,
            @JsonProperty("inward_issue") @NotBlank String inwardIssue,
            @JsonProperty("outward_issue") @NotBlank String outwardIssue
    ) {
    }
}
