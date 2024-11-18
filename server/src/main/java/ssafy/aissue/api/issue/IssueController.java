package ssafy.aissue.api.issue;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import ssafy.aissue.api.CommonResponse;
import ssafy.aissue.api.issue.request.*;
import ssafy.aissue.api.issue.response.*;
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
    @PutMapping("/update/schedule")
    public CommonResponse<?> updateSchedule(
            @RequestBody IssueScheduleRequest issueScheduleRequest
    ) {
        log.info("[IssueController] updateSchedule");
        String message = issueService.updateIssueSchedule(issueScheduleRequest);
        return CommonResponse.ok(message, null);
    }

    @Operation(summary = "에픽 목록 불러오기", description = "스프린트 생성을 위한 에픽 정보를 불러옵니다.")
    @GetMapping("/epic")
    public CommonResponse<List<EpicIssueResponse>> getEpicIssues(
            @RequestParam(name = "project") String projectKey) {
        return CommonResponse.ok(issueService.getEpicIssues(projectKey));
    }

    @Operation(summary = "이슈 삭제하기", description = "이슈를 삭제합니다.")
    @DeleteMapping("/{issuetype}/{issueKey}")
    public CommonResponse<?> deleteIssue(
            @PathVariable String issueKey, @PathVariable String issuetype) {
        return CommonResponse.ok(issueService.deleteIssue(issueKey, issuetype));
    }

    @Operation(summary = "이슈 상세 조회하기", description = "이슈 상세 정보를 조회합니다.")
    @GetMapping("/{issueKey}")
    public CommonResponse<IssueDetailResponse> getDetailIssue(
            @PathVariable String issueKey) throws Exception {
        return CommonResponse.ok(issueService.getIssueDetail(issueKey));
    }

    @Operation(summary = "이슈 수정하기", description = "이슈를 수정합니다.")
    @PutMapping("/update")
    public CommonResponse<?> updateIssue(
            @RequestBody IssueUpdateRequest issueUpdateRequest) throws JsonProcessingException {
        return CommonResponse.ok(issueService.updateIssue(issueUpdateRequest));
    }

    @Operation(summary = "스프린트 생성용 데이터 조회하기", description = "모든 이슈 데이터를 불러옵니다.")
    @GetMapping("/sprint")
    public CommonResponse<List<SprintIssueResponse>> getSprintIssues(
            @RequestParam(name = "project") String projectKey
    ) throws JsonProcessingException {
        return CommonResponse.ok(issueService.getSprintIssues(projectKey));
    }

    @Operation(summary = "상태 변경하기", description = "이슈 상태를 변경합니다.")
    @PutMapping("/status")
    public CommonResponse<?> updateStatus(
            @RequestBody IssueStatusRequest statusRequest
    ) {
        return CommonResponse.ok(issueService.updateStatus(statusRequest));
    }

    @Operation(summary = "스프린트 상태 조회하기", description = "스프린트가 진행 중인지, 완료된 상태인지 조회합니다.")
    @GetMapping("/sprint/status")
    public CommonResponse<SprintStatusResponse> getSprintStatus(
            @RequestParam(name = "project") String projectKey
    ) {
        return CommonResponse.ok(issueService.getSprintStatus(projectKey));
    }

    @Operation(summary = "스프린트 시작/완료하기", description = "스프린트를 시작하거나 종료합니다.")
    @PostMapping("/sprint/start")
    public CommonResponse<?> startSprint(
            @RequestBody ManageSprintRequest manageSprintRequest
    ) {
        return CommonResponse.ok(issueService.updateSprint(manageSprintRequest));
    }
}