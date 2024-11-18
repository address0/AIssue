package ssafy.aissue.api.issue.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Builder
public class BoardRequest {
    // getters and setters
    private String name;
    private String type;
    private Long filterId;
    private Location location;

    // 생성자
    public BoardRequest(String name, String type, Long filterId, Location location) {
        this.name = name;
        this.type = type;
        this.filterId = filterId;
        this.location = location;
    }

    // Location 클래스 정의 (내부 클래스)
    @Getter
    @Setter
    @Builder
    public static class Location {
        @JsonProperty("projectKeyOrId")  // JSON 필드명 지정
        private String projectKey;
        private String type;
    }
}
