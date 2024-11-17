package ssafy.aissue.api.chatbot;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ssafy.aissue.api.CommonResponse;
import ssafy.aissue.api.chatbot.request.ChatbotRequest;
import ssafy.aissue.api.chatbot.response.ChatbotResponse;
import ssafy.aissue.domain.chatbot.service.ChatbotService;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/chatbot")
@Tag(name = "Chatbot", description = "GPT 기반 챗봇 API")
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PreAuthorize("hasRole('ROLE_MEMBER')")
    @Operation(summary = "질문 처리", description = "사용자의 질문을 GPT에 전달하고 응답을 반환합니다.")
    @PostMapping()
    public CommonResponse<ChatbotResponse> askChatbot(@RequestBody ChatbotRequest request) {
        log.info("[ChatbotController] 사용자의 질문 처리 >>> {}", request.message());
        ChatbotResponse response = chatbotService.sendMessageToChatbot(request.toCommand());
        return CommonResponse.ok(response);
    }
}
