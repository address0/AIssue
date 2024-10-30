package ssafy.aissue.api.chatting.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import ssafy.aissue.domain.chatting.entity.ChatMessage;

import java.time.LocalDateTime;

@Schema(description = "채팅 메시지 응답 모델")
public record ChatMessageResponse(
        @Schema(description = "메시지 ID", example = "1")
        Long id,
        @Schema(description = "메시지 전송자의 ID", example = "123")
        Long memberId,
        @Schema(description = "메시지 전송자의 이름", example = "홍길동")
        String memberName,
        @Schema(description = "메시지 내용", example = "안녕하세요!")
        String message,
        @Schema(description = "메시지 생성 시간", example = "2023-10-30T12:34:56", nullable = true)
        @JsonInclude(JsonInclude.Include.NON_NULL) LocalDateTime createdAt
) {
    public static ChatMessageResponse of(ChatMessage chatMessage) {
        return new ChatMessageResponse(
                chatMessage.getId(),
                chatMessage.getMemberId(),
                chatMessage.getMemberName(),
                chatMessage.getMessage(),
                chatMessage.getCreatedAt()
        );
    }
}