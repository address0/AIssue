package ssafy.aissue.domain.issue.service;
import jakarta.transaction.Transactional;
import ssafy.aissue.api.issue.request.*;
import ssafy.aissue.api.issue.response.*;
import ssafy.aissue.api.member.response.MemberJiraIdResponse;

import java.util.List;

public interface IssueService {

    @Transactional
    MemberJiraIdResponse getJiraEmail();

    void createIssue(IssueRequest issueRequest);    // Issue 생성

    void createBatchIssue(IssueBatchRequest issueBatchRequest); // 여러 개의 Issue 생성

    void updateIssues(IssueUpdateRequest issueUpdateRequest);   // Issue 수정

    void deleteIssue(IssueDeleteRequest issueDeleteRequest);    // Issue 삭제

    void linkIssues(IssueLinkRequest issueLinkRequest);     // Issue 종속성 등록

    List<WeeklyIssueResponse> getMonthlyIssues();

    List<WeeklyIssueResponse> getWeeklyIssues(String projectKey);

}
