package ssafy.aissue.api.issue.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class IssueDeleteRequest {

        @NotNull
        private final Long issueId;
}
