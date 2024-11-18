package ssafy.aissue.api.issue.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
public class FilterRequest {

    private String name;
    private String description;
    private String jql;
//    private SharePermissions sharePermissions;
//
//    @Getter
//    @Builder
//    public static class SharePermissions {
//        private String type;
//        private Project project;
//
//        @Getter
//        @Builder
//        public static class Project {
//            private Long id;
//        }
//    }
}
