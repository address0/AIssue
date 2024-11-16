package ssafy.aissue.api.issue.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Builder
public class SprintIssueResponse {

    private Long id;
    private String key;
    private String summary;
    private String description;
    private String priority;
    private String status;
    private String issuetype;

    @JsonProperty("sub_issues")
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<MediumIssueResponse> subIssues;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<Subtask> subtasks;

    public SprintIssueResponse(Long id, String key, String summary, String description, String priority, String status,
                               String issuetype, List<MediumIssueResponse> subIssues, List<Subtask> subtasks) {
        this.id = id;
        this.key = key;
        this.summary = summary;
        this.description = description != null ? description : "";
        this.priority = priority;
        this.status = status;
        this.issuetype = issuetype;
        this.subIssues = subIssues != null ? subIssues : new ArrayList<>();  // 기본값으로 빈 리스트 설정
        this.subtasks = subtasks != null ? subtasks : new ArrayList<>();  // 기본값으로 빈 리스트 설정
    }

    @Getter
    @Builder
    public static class MediumIssueResponse {
        private Long id;
        private String key;
        private String summary;
        private String description;
        private String status;
        private String priority;
        private String issuetype;

        @JsonProperty("subtasks")
        private List<Subtask> subtasks;

        public MediumIssueResponse(Long id, String key, String summary, String description, String priority, String status,
                                   String issuetype, List<Subtask> subtasks) {
            this.id = id;
            this.key = key;
            this.summary = summary;
            this.description = description != null ? description : "";
            this.status = status;
            this.priority = priority;
            this.issuetype = issuetype;
            this.subtasks = subtasks != null ? subtasks : new ArrayList<>();  // 기본값으로 빈 리스트 설정
        }
    }

    @Getter
    @Builder
    public static class Subtask {
        private String summary;
        private String description;
        private String status;
        private String issuetype;

        public Subtask(String summary, String description, String status, String issuetype) {
            this.summary = summary;
            this.description = description != null ? description : "";
            this.status = status;
            this.issuetype = issuetype;
        }
    }
}
