package ssafy.aissue.domain.issue.service;
import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.transaction.Transactional;
import ssafy.aissue.api.issue.request.*;
import ssafy.aissue.api.issue.response.*;
import ssafy.aissue.api.member.response.MemberJiraIdResponse;

import java.util.List;

public interface IssueService {

    @Transactional
    MemberJiraIdResponse getJiraEmail();

    String createIssue(IssueRequest issueRequest);    // Issue 생성

    String createBatchIssue(IssueBatchRequest issueBatchRequest) throws JsonProcessingException; // 여러 개의 Issue 생성

    String updateIssues(IssueUpdateRequest issueUpdateRequest);   // Issue 수정

    String deleteIssue(IssueDeleteRequest issueDeleteRequest);    // Issue 삭제

    String linkIssues(IssueLinkRequest issueLinkRequest);     // Issue 종속성 등록

    String getIssueDetail();

    String updateIssueSchedule(IssueScheduleRequest issueScheduleRequest);

    List<MonthlyIssueResponse> getMonthlyIssues(String projectKey);

    List<WeeklyIssueResponse> getWeeklyIssues(String projectKey);

}
