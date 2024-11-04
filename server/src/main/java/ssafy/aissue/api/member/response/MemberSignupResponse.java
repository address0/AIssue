package ssafy.aissue.api.member.response;


public record MemberSignupResponse(
        String accessToken,
        String refreshToken,
        Long memberId,
        String memberName
) {
    public static MemberSignupResponse of(String accessToken , String refreshToken, Long memberId, String memberName) {
        return new MemberSignupResponse(accessToken, refreshToken, memberId, memberName);
    }
}
