package ssafy.aissue.api.issue.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class EpicIssueResponse {

    private Long id;
    private String key;
    private String summary;
    private String description;
    private String status;
    private String priority;

}
