package ssafy.aissue.api.member.response;


public record MemberSignupResponse(
        String accessToken,
        String refreshToken,
        Long memberId
) {
    public static MemberSignupResponse of(String accessToken , String refreshToken, Long memberId) {
        return new MemberSignupResponse(accessToken, refreshToken, memberId);
    }
}
