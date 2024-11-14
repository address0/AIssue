package ssafy.aissue.api.issue.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JiraIssueCreateRequest {

    @JsonProperty("issueUpdates")
    private List<IssueUpdate> issueUpdates;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IssueUpdate {
        @JsonProperty("fields")
        private Fields fields;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Fields {
        private Project project;
        private String summary;
        private String description;
        private Priority priority;
        private IssueType issuetype;
        private Assignee assignee;
        @JsonProperty("customfield_10031")
        private Double storyPoint;
        private Parent parent;

        @JsonInclude(JsonInclude.Include.NON_NULL)  // null일 경우 제외
        @JsonProperty("customfield_10020")
        private Long sprintId;  // SprintId 필드

        public static FieldsBuilder builder() {
            return new FieldsBuilder();
        }

        public static class FieldsBuilder {
            private Project project;
            private String summary;
            private String description;
            private Priority priority;
            private IssueType issuetype;
            private Assignee assignee;
            private Double storyPoint;
            private Parent parent;
            private Long sprintId;

            public FieldsBuilder sprintId(Long sprintId) {
                // SprintId 필드는 "Story"일 때만 추가
                if ("Story".equalsIgnoreCase(issuetype != null ? issuetype.getName() : "")) {
                    this.sprintId = sprintId;
                }
                return this;
            }

            public Fields build() {
                return new Fields(project, summary, description, priority, issuetype, assignee, storyPoint, parent, sprintId);
            }
        }
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Project {
        private String key;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Priority {
        private String name;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IssueType {
        private String name;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Assignee {
        @JsonProperty("accountId")
        private String accountId;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Parent {
        private String key;
    }
}
