package ssafy.aissue.api.issue.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SprintRequest {


    private String name;

    private String goal;

    private String startDate;

    private String endDate;

    private Long originBoardId;


}