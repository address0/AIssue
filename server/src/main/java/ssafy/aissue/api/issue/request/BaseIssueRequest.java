package ssafy.aissue.api.issue.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class BaseIssueRequest {

    @NotBlank
    private final String summary;

    private final String description;

    @NotBlank
    private final String issuetype;

    @NotBlank
    private final String priority;

    private final Double storyPoint;  // 선택적 필드이므로 검증 없음
}
