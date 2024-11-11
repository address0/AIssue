package ssafy.aissue.domain.issue.service;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import ssafy.aissue.api.issue.request.*;
import ssafy.aissue.api.issue.response.IssueResponse;
import ssafy.aissue.api.issue.response.WeeklyIssueResponse;
import ssafy.aissue.common.util.JiraApiUtil;
import ssafy.aissue.domain.issue.common.BaseIssueEntity;
import ssafy.aissue.domain.issue.entity.*;
import ssafy.aissue.domain.issue.repository.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class IssueServiceImpl implements IssueService {

    private final JiraApiUtil jiraApiUtil;
    private final Map<Class<? extends BaseIssueEntity>, JpaRepository<? extends BaseIssueEntity, Long>> repositoryMap;

    public IssueServiceImpl(BugRepository bugRepository, EpicRepository epicRepository,
                            StoryRepository storyRepository, TaskRepository taskRepository,
                            SubTaskRepository subTaskRepository, JiraApiUtil jiraApiUtil) {
        this.jiraApiUtil = jiraApiUtil;
        this.repositoryMap = new HashMap<>();
        this.repositoryMap.put(Bug.class, bugRepository);
        this.repositoryMap.put(Epic.class, epicRepository);
        this.repositoryMap.put(Story.class, storyRepository);
        this.repositoryMap.put(Task.class, taskRepository);
        this.repositoryMap.put(SubTask.class, subTaskRepository);
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
    public List<WeeklyIssueResponse> getMonthIssues() {
        return List.of();
    }

    @Override
    public List<WeeklyIssueResponse> getWeeklyIssues(String email, String jiraKey) {
        List<IssueResponse> jiraIssues = jiraApiUtil.fetchWeeklyUserIssues(email, jiraKey);

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
                .build();
    }

    private BaseIssueEntity findDbIssueById(String issueType, Long id) {
        Class<? extends BaseIssueEntity> entityType = getEntityType(issueType);
        JpaRepository<? extends BaseIssueEntity, Long> repository = repositoryMap.get(entityType);

        // 각 리포지토리에서 엔티티를 조회
        if (repository != null) {
            return repository.findById(id).orElse(null);
        } else {
            throw new IllegalArgumentException("Unknown issue type: " + issueType);
        }
    }


    private Class<? extends BaseIssueEntity> getEntityType(String issueType) {
        return switch (issueType.toUpperCase()) {
            case "BUG", "버그" -> Bug.class;
            case "STORY", "스토리" -> Story.class;
            case "EPIC", "에픽" -> Epic.class;
            case "TASK", "작업" -> Task.class;
            case "SUBTASK", "하위 작업" -> SubTask.class;
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
