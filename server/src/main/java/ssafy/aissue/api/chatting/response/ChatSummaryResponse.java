package ssafy.aissue.api.chatting.response;

import io.swagger.v3.oas.annotations.media.Schema;
import ssafy.aissue.domain.chatting.entity.ChatSummary;

import java.time.LocalDate;

@Schema(description = "채팅 요약본 응답 모델")
public record ChatSummaryResponse(
        @Schema(description = "프로젝트 키", example = "S11P11A703")
        String projectKey,
        @Schema(description = "요약 날짜", example = "2024-11-08")
        LocalDate date,
        @Schema(description = "요약 내용", example = "프로젝트 회의와 주요 업데이트.")
        String summary
) {
    public static ChatSummaryResponse of(ChatSummary chatSummary) {
        return new ChatSummaryResponse(
                chatSummary.getProjectKey(),
                chatSummary.getDate(),
                chatSummary.getSummary()
        );
    }
}
