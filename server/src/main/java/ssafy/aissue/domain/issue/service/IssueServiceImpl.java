package ssafy.aissue.domain.issue.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ssafy.aissue.api.issue.request.*;
import ssafy.aissue.api.issue.response.IssueResponse;
import ssafy.aissue.api.issue.response.MonthlyIssueResponse;
import ssafy.aissue.api.issue.response.WeeklyIssueResponse;
import ssafy.aissue.api.member.response.MemberJiraIdResponse;
import ssafy.aissue.common.exception.member.MemberNotFoundException;
import ssafy.aissue.common.exception.security.NotAuthenticatedException;
import ssafy.aissue.common.util.DateConverter;
import ssafy.aissue.common.util.JiraApiUtil;
import ssafy.aissue.common.util.SecurityUtil;
import ssafy.aissue.domain.issue.common.BaseIssueEntity;
import ssafy.aissue.domain.issue.entity.*;
import ssafy.aissue.domain.issue.repository.*;
import ssafy.aissue.domain.member.entity.Member;
import ssafy.aissue.domain.member.repository.MemberRepository;

import java.time.LocalDateTime;
import java.util.List;
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

    @Override
    public MemberJiraIdResponse getJiraEmail() {
        Member currentMember = getCurrentLoggedInMember();
        return MemberJiraIdResponse.of(currentMember.getEmail());
    }

    @Override
    public String createBatchIssue(IssueBatchRequest issueBatchRequest) throws JsonProcessingException {
        Member currentMember = getCurrentLoggedInMember();
        String jiraEmail = currentMember.getEmail();
        String jiraKey = currentMember.getJiraKey();
        String jiraId = currentMember.getJiraId();
        String projectKey = issueBatchRequest.getProjectKey();  // 요청 본문에서 projectKey 가져오기
        Long sprintId = jiraApiUtil.fetchActiveSprintId(projectKey, jiraEmail, jiraKey);

        // 각 이슈 요청을 JIRA 형식의 Fields 객체로 변환
        List<JiraIssueCreateRequest.IssueUpdate> issueUpdates = issueBatchRequest.toIssueUpdates(jiraId, sprintId);

        // Jira에 벌크 이슈 생성 요청
        List<String> issueKeys = jiraApiUtil.createBulkIssues(issueUpdates, jiraEmail, jiraKey);

        log.info("이슈 생성 성공");

        // Jira에서 이슈 조회 후 일정 등록
        List<IssueResponse> issuesFromJira = jiraApiUtil.fetchIssuesByKeys(issueKeys, jiraEmail, jiraKey);

        log.info("생성 이슈 불러오기 성공");

        // 받은 이슈 데이터와 사용자가 보낸 데이터를 매칭하여 일정을 DB에 저장
        handleIssueBatchRequest(issueBatchRequest, issuesFromJira);
        return issueUpdates.size() + "개 중 " + issueKeys.size() + "개의 이슈가 성공적으로 생성되었습니다.";
    }

    public void handleIssueBatchRequest(IssueBatchRequest batchRequest, List<IssueResponse> issuesFromJira) {
        // 요청 데이터에서 start_at, end_at을 LocalDateTime으로 변환하고
        // 일정을 DB에 저장할 데이터와 Jira API 요청용 데이터를 분리합니다.
        batchRequest.getIssues().forEach(issueRequest -> {
            // Jira 이슈와 매칭하여 일정 등록
            issuesFromJira.stream()
                    .filter(issueFromJira -> issueFromJira.getSummary().equals(issueRequest.getSummary()))
                    .findFirst()
                    .ifPresent(matchingIssue -> {
                        log.info(matchingIssue.getIssuetype());
                        // 변환된 start_at, end_at을 일정 DB용으로 저장
                        LocalDateTime startAt = DateConverter.convertStartAtToLocalDateTime(issueRequest.getStartAt());
                        LocalDateTime endAt = DateConverter.convertEndAtToLocalDateTime(issueRequest.getEndAt());
                        scheduleIssueInDb(matchingIssue.getKey(), matchingIssue.getId(), matchingIssue.getIssuetype(), startAt, endAt);
                    });
        });
    }


    private void scheduleIssueInDb(String issueKey, Long issueId, String issueType, LocalDateTime startAt, LocalDateTime endAt) {
        // DB에 일정 정보를 저장하는 로직
        IssueScheduleRequest issueSchedule = IssueScheduleRequest.builder()
                .issueId(issueId)
                .issueKey(issueKey)
                .issuetype(issueType)
                .startAt(startAt)
                .endAt(endAt)
                .build();

        // DB에 저장
        updateIssueSchedule(issueSchedule);
    }

    @Override
    public String createIssue(IssueRequest issueRequest) {
        // 구현 내용 추가
        return null;
    }

    @Override
    public String updateIssues(IssueUpdateRequest issueUpdateRequest) {
        // 구현 내용 추가
        return null;
    }

    @Override
    public String deleteIssue(IssueDeleteRequest issueDeleteRequest) {
        // 구현 내용 추가
        return null;
    }

    @Override
    public String linkIssues(IssueLinkRequest issueLinkRequest) {
        // 구현 내용 추가
        return null;
    }

    @Override
    public String getIssueDetail() {
        return null;
    }

    @Override
    public String updateIssueSchedule(IssueScheduleRequest issueScheduleRequest) {
        Long jiraId = issueScheduleRequest.getIssueId();
        String issueType = issueScheduleRequest.getIssuetype();
        LocalDateTime newStartAt = issueScheduleRequest.getStartAt();
        LocalDateTime newEndAt = issueScheduleRequest.getEndAt();

        // 이슈 조회 및 없으면 생성
        BaseIssueEntity issueEntity = findOrCreateDbIssue(issueType, jiraId, issueScheduleRequest.getIssueKey());

        // 시작 날짜와 종료 날짜 업데이트
        try {
            issueEntity.updateStartAt(newStartAt);
            issueEntity.updateEndAt(newEndAt);
        } catch (IllegalArgumentException e) {
            log.error("유효하지 않은 날짜 업데이트 요청: {}", e.getMessage());
            return "유효하지 않은 날짜 업데이트 요청: " + e.getMessage();
        }

        // 업데이트된 엔티티를 저장
        saveIssue(issueEntity);
        return "이슈 일정이 성공적으로 업데이트되었습니다.";
    }

    private void saveIssue(BaseIssueEntity issue) {
        if (issue instanceof Bug) {
            bugRepository.save((Bug) issue);
        } else if (issue instanceof Epic) {
            epicRepository.save((Epic) issue);
        } else if (issue instanceof Story) {
            storyRepository.save((Story) issue);
        } else if (issue instanceof Task) {
            taskRepository.save((Task) issue);
        } else if (issue instanceof SubTask) {
            subTaskRepository.save((SubTask) issue);
        } else {
            throw new IllegalArgumentException("Unknown issue type: " + issue.getClass().getSimpleName());
        }
    }


    @Override
    public List<MonthlyIssueResponse> getMonthlyIssues(String projectKey) {
        Member currentMember = getCurrentLoggedInMember();
        String email = currentMember.getEmail();
        String jiraKey = currentMember.getJiraKey();
        List<IssueResponse> jiraIssues = jiraApiUtil.fetchMonthlyUserIssues(email, jiraKey, projectKey);

        return jiraIssues.stream()
                .map(this::mapToMonthlyIssueResponse)
                .collect(Collectors.toList());
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
        BaseIssueEntity dbIssue = findOrCreateDbIssue(issueResponse);
        return WeeklyIssueResponse.builder()
                .id(issueResponse.getId())
                .key(issueResponse.getKey())
                .summary(issueResponse.getSummary())
                .description(issueResponse.getDescription())
                .priority(issueResponse.getPriority())
                .status(issueResponse.getStatus())
                .issuetype(issueResponse.getIssuetype())
                .startAt(dbIssue.getStartAt())
                .endAt(dbIssue.getEndAt())
                .parent(mapParent(issueResponse.getParent()))
                .subtasks(mapSubtasks(issueResponse.getSubtasks()))
                .assignee(issueResponse.getAssignee() != null ? issueResponse.getAssignee() : null)
                .build();
    }

    private MonthlyIssueResponse mapToMonthlyIssueResponse(IssueResponse issueResponse) {
        BaseIssueEntity dbIssue = findOrCreateDbIssue(issueResponse);
        return MonthlyIssueResponse.builder()
                .id(issueResponse.getId())
                .key(issueResponse.getKey())
                .summary(issueResponse.getSummary())
                .description(issueResponse.getDescription())
                .priority(issueResponse.getPriority())
                .status(issueResponse.getStatus())
                .issuetype(issueResponse.getIssuetype())
                .startAt(dbIssue.getStartAt())
                .endAt(dbIssue.getEndAt())
                .assignee(issueResponse.getAssignee() != null ? issueResponse.getAssignee() : null)
                .build();
    }

    private BaseIssueEntity findOrCreateDbIssue(IssueResponse issueResponse) {
        return findOrCreateDbIssue(issueResponse.getIssuetype(), issueResponse.getId(), issueResponse.getKey());
    }

    private BaseIssueEntity findOrCreateDbIssue(IssueResponse.ParentIssue parent) {
        return findOrCreateDbIssue(parent.getIssuetype(), parent.getId(), parent.getKey());
    }

    private BaseIssueEntity findOrCreateDbIssue(IssueResponse.Subtask subtask) {
        return findOrCreateDbIssue(subtask.getIssuetype(), subtask.getId(), subtask.getKey());
    }

    private BaseIssueEntity findOrCreateDbIssue(String issueType, Long jiraId, String jiraKey) {
        BaseIssueEntity dbIssue = findDbIssueById(issueType, jiraId);
        if (dbIssue == null) {
            dbIssue = createNewDbIssue(issueType, jiraId, jiraKey);
        }
        return dbIssue;
    }

    private BaseIssueEntity createNewDbIssue(String issueType, Long jiraId, String jiraKey) {
        switch (issueType.toUpperCase()) {
            case "BUG", "버그" -> {
                return bugRepository.save(Bug.builder().jiraId(jiraId).jiraKey(jiraKey).startAt(null).endAt(null).build());
            }
            case "STORY", "스토리" -> {
                return storyRepository.save(Story.builder().jiraId(jiraId).jiraKey(jiraKey).startAt(null).endAt(null).build());
            }
            case "EPIC", "에픽" -> {
                return epicRepository.save(Epic.builder().jiraId(jiraId).jiraKey(jiraKey).startAt(null).endAt(null).build());
            }
            case "TASK", "작업" -> {
                return taskRepository.save(Task.builder().jiraId(jiraId).jiraKey(jiraKey).startAt(null).endAt(null).build());
            }
            case "SUB-TASK", "하위 작업" -> {
                return subTaskRepository.save(SubTask.builder().jiraId(jiraId).jiraKey(jiraKey).startAt(null).endAt(null).build());
            }
            default -> throw new IllegalArgumentException("Unknown issue type: " + issueType);
        }
    }

    private BaseIssueEntity findDbIssueById(String issueType, Long jiraId) {
        return switch (issueType.toUpperCase()) {
            case "BUG", "버그" -> bugRepository.findByJiraId(jiraId).orElse(null);
            case "STORY", "스토리" -> storyRepository.findByJiraId(jiraId).orElse(null);
            case "EPIC", "에픽" -> epicRepository.findByJiraId(jiraId).orElse(null);
            case "TASK", "작업" -> taskRepository.findByJiraId(jiraId).orElse(null);
            case "SUB-TASK", "하위 작업" -> subTaskRepository.findByJiraId(jiraId).orElse(null);
            default -> throw new IllegalArgumentException("Unknown issue type: " + issueType);
        };
    }

    private WeeklyIssueResponse.ParentIssue mapParent(IssueResponse.ParentIssue parent) {
        if (parent == null) return null;
        BaseIssueEntity dbParent = findOrCreateDbIssue(parent);
        return WeeklyIssueResponse.ParentIssue.builder()
                .id(parent.getId())
                .key(parent.getKey())
                .summary(parent.getSummary())
                .priority(parent.getPriority())
                .status(parent.getStatus())
                .issuetype(parent.getIssuetype())
                .startAt(dbParent.getStartAt())
                .endAt(dbParent.getEndAt())
                .build();
    }

    private List<WeeklyIssueResponse.Subtask> mapSubtasks(List<IssueResponse.Subtask> subtasks) {
        return subtasks.stream()
                .map(subtask -> {
                    BaseIssueEntity dbSubtask = findOrCreateDbIssue(subtask);
                    return WeeklyIssueResponse.Subtask.builder()
                            .id(subtask.getId())
                            .key(subtask.getKey())
                            .summary(subtask.getSummary())
                            .priority(subtask.getPriority())
                            .status(subtask.getStatus())
                            .issuetype(subtask.getIssuetype())
                            .startAt(dbSubtask.getStartAt())
                            .endAt(dbSubtask.getEndAt())
                            .build();
                })
                .collect(Collectors.toList());
    }
}
