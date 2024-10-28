package ssafy.aissue.api.member.response;


public record MemberSignupResponse(
        String accessToken,
        String refreshToken
) {
    public static MemberSignupResponse of(String accessToken , String refreshToken) {
        return new MemberSignupResponse(accessToken, refreshToken);
    }
}
