package ssafy.aissue.api.issue.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Getter
@RequiredArgsConstructor
public class EpicBatchRequest {

    @NotNull
    @NotEmpty
    private final List<BaseIssueRequest> issues;
}
