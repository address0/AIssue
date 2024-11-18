package ssafy.aissue.api.chatbot.request;

import io.swagger.v3.oas.annotations.media.Schema;
import ssafy.aissue.domain.chatbot.command.ChatbotCommand;

public record ChatbotRequest(
        @Schema(description = "챗봇에게 전달할 메시지", example = "지라에서 이슈가 뭐야?")
        String message
) {
        public ChatbotCommand toCommand() {
                return new ChatbotCommand(message);
        }

}
