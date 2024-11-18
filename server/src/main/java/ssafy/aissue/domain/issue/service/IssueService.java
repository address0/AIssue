package ssafy.aissue.domain.issue.service;
import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.transaction.Transactional;
import ssafy.aissue.api.issue.request.*;
import ssafy.aissue.api.issue.response.*;
import ssafy.aissue.api.member.response.MemberJiraIdResponse;

import java.util.List;

public interface IssueService {

    String createIssue(IssueRequest issueRequest);    // Issue 생성

    MemberJiraIdResponse getJiraEmail();

    String createBatchIssue(IssueBatchRequest issueBatchRequest) throws JsonProcessingException; // 여러 개의 Issue 생성

    String updateIssue(IssueUpdateRequest issueUpdateRequest) throws JsonProcessingException;

    String deleteIssue(String issueKey, String issuetype);

    String linkIssues(IssueLinkRequest issueLinkRequest);     // Issue 종속성 등록

    IssueDetailResponse getIssueDetail(String projectKey) throws Exception;

    String updateIssueSchedule(IssueScheduleRequest issueScheduleRequest);

    List<MonthlyIssueResponse> getMonthlyIssues(String projectKey);

    List<WeeklyIssueResponse> getWeeklyIssues(String projectKey);

    List<EpicIssueResponse> getEpicIssues(String projectKey);

    List<SprintIssueResponse> getSprintIssues(String projectKey) throws JsonProcessingException;

    String updateStatus(IssueStatusRequest statusRequest);
}
