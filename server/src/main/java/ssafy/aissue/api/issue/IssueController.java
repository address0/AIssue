package ssafy.aissue.api.issue;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import ssafy.aissue.api.CommonResponse;
import ssafy.aissue.api.issue.request.IssueBatchRequest;
import ssafy.aissue.api.issue.request.IssueScheduleRequest;
import ssafy.aissue.api.issue.response.MonthlyIssueResponse;
import ssafy.aissue.api.issue.response.WeeklyIssueResponse;
import ssafy.aissue.domain.issue.service.IssueService;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/issues")
@Tag(name = "Issue", description = "이슈 관리")
public class IssueController {

    private final IssueService issueService;

    @Operation(summary = "이슈 등록", description = "생성된 이슈를 JIRA에 등록합니다.")
    @PostMapping
    public CommonResponse<?> createBatchIssue(@RequestBody IssueBatchRequest issueBatchRequest) throws JsonProcessingException {
        log.info("[IssueController] createBatchIssue");
        String resultMessage = issueService.createBatchIssue(issueBatchRequest);
        return CommonResponse.ok(resultMessage);
    }

    @Operation(summary = "주간 일정 조회", description = "스프린트 일정을 제공합니다.")
    @GetMapping("/weekly")
    public CommonResponse<List<WeeklyIssueResponse>> getWeeklyIssues(
            @RequestParam(name = "project") String projectKey) {
        return CommonResponse.ok(issueService.getWeeklyIssues(projectKey));
    }

    @Operation(summary = "월간 일정 조회", description = "에픽 일정을 제공합니다.")
    @GetMapping("/monthly")
    public CommonResponse<List<MonthlyIssueResponse>> getMonthlyIssues(
            @RequestParam(name = "project") String projectKey) {
        return CommonResponse.ok(issueService.getMonthlyIssues(projectKey));
    }

    @Operation(summary = "이슈 일정 수정", description = "이슈 일정을 수정합니다.")
    @PostMapping("/update/schedule")
    public CommonResponse<?> updateSchedule(
            @RequestBody IssueScheduleRequest issueScheduleRequest
    ) {
        log.info("[IssueController] updateSchedule");
        String message = issueService.updateIssueSchedule(issueScheduleRequest);
        return CommonResponse.ok(message, null);
    }


}