package ssafy.aissue.api.issue;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ssafy.aissue.api.CommonResponse;
import ssafy.aissue.api.issue.request.IssueBatchRequest;
import ssafy.aissue.domain.issue.service.IssueService;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/issues")
@Tag(name = "Issue", description = "이슈 관리")
public class IssueController {

    private final IssueService issueService;

    @Operation(summary = "이슈 등록", description = "생성된 이슈를 JIRA에 등록합니다.")
    @PostMapping
    public CommonResponse<?> createBatchIssue(@RequestParam(name="issue")IssueBatchRequest issueBatchRequest) {
        log.info("[IssueController] createBatchIssue");
        return CommonResponse.ok();
    }

}