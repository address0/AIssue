package ssafy.aissue.api.member.response;

import lombok.Getter;

import java.util.List;

@Getter
public class MemberProjectIdsResponse {

    private List<String> projectIds;

    public MemberProjectIdsResponse(List<String> projectIds) {
        this.projectIds = projectIds;
    }

    public List<String> getProjectIds() {
        return projectIds;
    }
}
