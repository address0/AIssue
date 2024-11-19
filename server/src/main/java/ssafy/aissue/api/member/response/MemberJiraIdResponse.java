package ssafy.aissue.api.member.response;

public record MemberJiraIdResponse(
        String jiraId
) {
    public static MemberJiraIdResponse of(String jiraId) {
        return new MemberJiraIdResponse(jiraId);
    }

}
