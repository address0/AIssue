package ssafy.aissue.api.issue.response;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class WeeklyIssueResponse {

    private Long id;
    private String key;
    private String summary;
    private String description;
    private String priority;
    private String status;
    private String assignee;
    private String issuetype;
    private LocalDateTime startAt;
    private LocalDateTime endAt;

    private ParentIssue parent;
    private List<Subtask> subtasks;

    public WeeklyIssueResponse(Long id, String key, String summary, String description, String priority, String status,
                               String assignee, String issuetype, LocalDateTime startAt, LocalDateTime endAt,
                               ParentIssue parent, List<Subtask> subtasks) {
        this.id = id;
        this.key = key;
        this.summary = summary;
        this.description = description;
        this.priority = priority;
        this.status = status;
        this.assignee = assignee;
        this.issuetype = issuetype;
        this.startAt = startAt;
        this.endAt = endAt;
        this.parent = parent;
        this.subtasks = subtasks;
    }

    @Getter
    @Builder
    public static class ParentIssue {
        private Long id;
        private String key;
        private String summary;
        private String priority;
        private String status;
        private String issuetype;
        private LocalDateTime startAt;
        private LocalDateTime endAt;

        public ParentIssue(Long id, String key, String summary, String priority, String status, String issuetype,
                           LocalDateTime startAt, LocalDateTime endAt) {
            this.id = id;
            this.key = key;
            this.summary = summary;
            this.priority = priority;
            this.status = status;
            this.issuetype = issuetype;
            this.startAt = startAt;
            this.endAt = endAt;
        }
    }

    @Getter
    @Builder
    public static class Subtask {
        private Long id;
        private String key;
        private String summary;
        private String priority;
        private String status;
        private String issuetype;
        private LocalDateTime startAt;
        private LocalDateTime endAt;

        public Subtask(Long id, String key, String summary, String priority, String status, String issuetype,
                       LocalDateTime startAt, LocalDateTime endAt) {
            this.id = id;
            this.key = key;
            this.summary = summary;
            this.priority = priority;
            this.status = status;
            this.issuetype = issuetype;
            this.startAt = startAt;
            this.endAt = endAt;
        }
    }
}
