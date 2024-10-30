package ssafy.aissue.api.chatting.request;


import io.swagger.v3.oas.annotations.media.Schema;
import ssafy.aissue.domain.chatting.entity.ChatMessage;
import ssafy.aissue.domain.chatting.entity.Chatting;


public record ChatMessageRequest(
        @Schema(description = "메시지 전송자의 ID", example = "1")
        Long memberId,

        @Schema(description = "메시지 내용", example = "안녕하세요!")
        String message,

        @Schema(description = "지라 프로젝트 키", example = "S11P11A703")
        String jiraProjectKey
) {
    public ChatMessage toCommand(Chatting chatting) {
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setMemberId(memberId);
        chatMessage.setMessage(message);
        chatMessage.setChatting(chatting);
        return chatMessage;
    }
}
