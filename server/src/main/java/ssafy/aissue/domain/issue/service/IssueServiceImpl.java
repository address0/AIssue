package ssafy.aissue.domain.issue.service;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import ssafy.aissue.api.issue.request.*;
import ssafy.aissue.api.issue.response.IssueResponse;
import ssafy.aissue.api.issue.response.WeeklyIssueResponse;
import ssafy.aissue.api.member.response.MemberJiraIdResponse;
import ssafy.aissue.common.exception.member.MemberNotFoundException;
import ssafy.aissue.common.exception.security.NotAuthenticatedException;
import ssafy.aissue.common.util.JiraApiUtil;
import ssafy.aissue.common.util.SecurityUtil;
import ssafy.aissue.domain.issue.common.BaseIssueEntity;
import ssafy.aissue.domain.issue.entity.*;
import ssafy.aissue.domain.issue.repository.*;
import ssafy.aissue.domain.member.entity.Member;
import ssafy.aissue.domain.member.repository.MemberRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class IssueServiceImpl implements IssueService {

    private final MemberRepository memberRepository;
    private final JiraApiUtil jiraApiUtil;
    private final BugRepository bugRepository;
    private final EpicRepository epicRepository;
    private final StoryRepository storyRepository;
    private final TaskRepository taskRepository;
    private final SubTaskRepository subTaskRepository;

    public IssueServiceImpl(BugRepository bugRepository, EpicRepository epicRepository,
                            StoryRepository storyRepository, TaskRepository taskRepository,
                            SubTaskRepository subTaskRepository, MemberRepository memberRepository, JiraApiUtil jiraApiUtil) {
        this.memberRepository = memberRepository;
        this.jiraApiUtil = jiraApiUtil;
        this.bugRepository = bugRepository;
        this.epicRepository = epicRepository;
        this.storyRepository = storyRepository;
        this.taskRepository = taskRepository;
        this.subTaskRepository = subTaskRepository;
    }

    private Member getCurrentLoggedInMember() {
        Long userId = SecurityUtil.getLoginMemberId().orElseThrow(NotAuthenticatedException::new);
        Member member = memberRepository.findById(userId).orElseThrow(MemberNotFoundException::new);

        if (member.getIsDeleted()) {
            throw new NotAuthenticatedException();
        }
        return member;
    }

    @Transactional
    @Override
    public MemberJiraIdResponse getJiraEmail() {
        Member currentMember = getCurrentLoggedInMember();
        return MemberJiraIdResponse.of(currentMember.getEmail());
    }

    @Override
    public void createIssue(IssueRequest issueRequest) {
        // 구현 내용 추가
    }

    @Override
    public void createBatchIssue(IssueBatchRequest issueBatchRequest) {
        // 구현 내용 추가
    }

    @Override
    public void updateIssues(IssueUpdateRequest issueUpdateRequest) {
        // 구현 내용 추가
    }

    @Override
    public void deleteIssue(IssueDeleteRequest issueDeleteRequest) {
        // 구현 내용 추가
    }

    @Override
    public void linkIssues(IssueLinkRequest issueLinkRequest) {
        // 구현 내용 추가
    }

    @Override
    public List<WeeklyIssueResponse> getMonthlyIssues() {
        Member currentMember = getCurrentLoggedInMember();
        String email = currentMember.getEmail();
        String jiraKey = currentMember.getJiraKey();
        List<IssueResponse> jiraIssues = jiraApiUtil.fetchMonthlyUserIssues(email, jiraKey);

        return List.of();
    }

    @Override
    public List<WeeklyIssueResponse> getWeeklyIssues(String projectKey) {
        Member currentMember = getCurrentLoggedInMember();
        String email = currentMember.getEmail();
        String jiraKey = currentMember.getJiraKey();
        List<IssueResponse> jiraIssues = jiraApiUtil.fetchWeeklyUserIssues(email, jiraKey, projectKey);

        return jiraIssues.stream()
                .map(this::mapToWeeklyIssueResponse)
                .collect(Collectors.toList());
    }

    private WeeklyIssueResponse mapToWeeklyIssueResponse(IssueResponse issueResponse) {
        BaseIssueEntity dbIssue = findDbIssueById(issueResponse.getIssuetype(), issueResponse.getId());
        return WeeklyIssueResponse.builder()
                .id(issueResponse.getId())
                .key(issueResponse.getKey())
                .summary(issueResponse.getSummary())
                .priority(issueResponse.getPriority())
                .status(issueResponse.getStatus())
                .issuetype(issueResponse.getIssuetype())
                .startAt(dbIssue != null ? dbIssue.getStartAt() : null)
                .endAt(dbIssue != null ? dbIssue.getEndAt() : null)
                .parent(mapParent(issueResponse.getParent()))
                .subtasks(mapSubtasks(issueResponse.getSubtasks()))
                .assignee((issueResponse.getAssignee()) != null ? issueResponse.getAssignee() : null)
                .build();
    }

    private BaseIssueEntity findDbIssueById(String issueType, Long jiraId) {
        log.info(issueType);
        return switch (issueType.toUpperCase()) {
            case "BUG", "버그" -> bugRepository.findByJiraId(jiraId).orElse(null);
            case "STORY", "스토리" -> storyRepository.findByJiraId(jiraId).orElse(null);
            case "EPIC", "에픽" -> epicRepository.findByJiraId(jiraId).orElse(null);
            case "TASK", "작업" -> taskRepository.findByJiraId(jiraId).orElse(null);
            case "SUB-TASK", "하위 작업" -> subTaskRepository.findByJiraId(jiraId).orElse(null);
            default -> throw new IllegalArgumentException("Unknown issue type: " + issueType);
        };
    }

    private Class<? extends BaseIssueEntity> getEntityType(String issueType) {
        if (issueType == null || issueType.trim().isEmpty()) {
            throw new IllegalArgumentException("Issue type cannot be null or empty");
        }

        return switch (issueType.toUpperCase()) {
            case "Bug", "버그" -> Bug.class;
            case "Story", "스토리" -> Story.class;
            case "Epic", "에픽" -> Epic.class;
            case "Task", "작업" -> Task.class;
            case "Sub-Task", "하위 작업" -> SubTask.class;
            default -> throw new IllegalArgumentException("Unknown issue type: " + issueType);
        };
    }


    private WeeklyIssueResponse.ParentIssue mapParent(IssueResponse.ParentIssue parent) {
        if (parent == null) return null;
        BaseIssueEntity dbParent = findDbIssueById(parent.getIssuetype(), parent.getId());

        return WeeklyIssueResponse.ParentIssue.builder()
                .id(parent.getId())
                .key(parent.getKey())
                .summary(parent.getSummary())
                .priority(parent.getPriority())
                .status(parent.getStatus())
                .issuetype(parent.getIssuetype())
                .startAt(dbParent != null ? dbParent.getStartAt() : null)
                .endAt(dbParent != null ? dbParent.getEndAt() : null)
                .build();
    }

    private List<WeeklyIssueResponse.Subtask> mapSubtasks(List<IssueResponse.Subtask> subtasks) {
        return subtasks.stream()
                .map(subtask -> {
                    BaseIssueEntity dbSubtask = findDbIssueById(subtask.getIssuetype(), subtask.getId());
                    return WeeklyIssueResponse.Subtask.builder()
                            .id(subtask.getId())
                            .key(subtask.getKey())
                            .summary(subtask.getSummary())
                            .priority(subtask.getPriority())
                            .status(subtask.getStatus())
                            .issuetype(subtask.getIssuetype())
                            .startAt(dbSubtask != null ? dbSubtask.getStartAt() : null)
                            .endAt(dbSubtask != null ? dbSubtask.getEndAt() : null)
                            .build();
                })
                .collect(Collectors.toList());
    }
}
