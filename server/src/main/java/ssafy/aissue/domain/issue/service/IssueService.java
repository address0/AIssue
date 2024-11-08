package ssafy.aissue.domain.issue.service;
import ssafy.aissue.api.issue.request.*;
import ssafy.aissue.api.issue.response.*;

import java.util.List;

public interface IssueService {

    void createIssue(IssueRequest issueRequest);    // Issue 생성

    void createBatchIssue(IssueBatchRequest issueBatchRequest); // 여러 개의 Issue 생성

    void updateIssues(IssueUpdateRequest issueUpdateRequest);   // Issue 수정

    void deleteIssue(IssueDeleteRequest issueDeleteRequest);    // Issue 삭제

    void linkIssues(IssueLinkRequest issueLinkRequest);     // Issue 종속성 등록

    List<IssueResponse> getMonthIssues();  // 이슈 목록

    List<IssueResponse> getWeekIssues();

}
