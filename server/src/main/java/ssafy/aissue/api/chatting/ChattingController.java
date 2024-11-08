package ssafy.aissue.api.chatting;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import ssafy.aissue.api.chatting.request.ChatMessageRequest;
import ssafy.aissue.api.chatting.response.ChatMessageResponse;
import ssafy.aissue.api.chatting.response.ChatSummaryResponse;
import ssafy.aissue.domain.chatting.entity.ChatMessage;
import ssafy.aissue.domain.chatting.entity.Chatting;
import ssafy.aissue.domain.chatting.repository.ChattingRepository;
import ssafy.aissue.domain.chatting.service.ChattingService;
import ssafy.aissue.domain.project.entity.Project;
import ssafy.aissue.domain.project.service.ProjectService;
import ssafy.aissue.domain.scheduler.ChatSummaryScheduler;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@Tag(name = "Chatting", description = "채팅  및 요약본 API")
public class ChattingController {

    private final SimpMessageSendingOperations template;
    private final ChattingService chattingService;
    private final ChatSummaryScheduler chatSummaryScheduler;

    // 수동으로 지정된 기간의 채팅 메시지 요약 생성
    @Operation(summary = "수동으로 지정된 기간의 채팅 메시지 요약 생성",
            description = "지정된 날짜 범위의 채팅 메시지를 요약하고 저장합니다.")
    @GetMapping("/chat/summaries/manual")
    public ResponseEntity<String> generateManualSummaries(
            @Parameter(description = "요약을 시작할 날짜 (예: 2024-11-05)", example = "2024-11-05")
            @RequestParam("startDate")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,

            @Parameter(description = "요약을 종료할 날짜 (예: 2024-11-07)", example = "2024-11-07")
            @RequestParam("endDate")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.plusDays(1).atStartOfDay();

        chatSummaryScheduler.summarizeChatMessagesForPeriod(start, end);

        return ResponseEntity.ok("요약이 성공적으로 생성되었습니다.");
    }

    // 특정 프로젝트의 모든 채팅 요약본 목록 반환
    @PreAuthorize("hasRole('ROLE_MEMBER')")
    @Operation(summary = "프로젝트의 모든 채팅 요약본 조회", description = "지정된 프로젝트 키를 사용하여 모든 채팅 요약본을 반환합니다.")
    @GetMapping("/chat/{jiraProjectKey}/summaries")
    public ResponseEntity<List<ChatSummaryResponse>> getAllChatSummaries(@PathVariable String jiraProjectKey) {
        List<ChatSummaryResponse> summaries = chattingService.getAllSummariesForProject(jiraProjectKey);
        return ResponseEntity.ok(summaries);
    }

    // 채팅 메시지 목록 반환
    @PreAuthorize("hasRole('ROLE_MEMBER')")
    @Operation(summary = "프로젝트의 채팅 메시지 목록 조회", description = "지정된 프로젝트 키를 사용하여 채팅 메시지 목록을 반환합니다.")
    @Transactional
    @GetMapping("/chat/{jiraProjectKey}")
    public ResponseEntity<List<ChatMessageResponse>> getChatMessages(@PathVariable String jiraProjectKey) {
        List<ChatMessage> messages = chattingService.getChatMessagesByProjectKey(jiraProjectKey);
        List<ChatMessageResponse> responseMessages = messages.stream()
                .map(ChatMessageResponse::of)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responseMessages);
    }

    // 메시지 송신 및 수신
    @MessageMapping("/message")
    public ResponseEntity<Void> receiveMessage(@RequestBody ChatMessageRequest chatMessageRequest) {
        Long memberId = chatMessageRequest.memberId();
        String jiraProjectKey = chatMessageRequest.jiraProjectKey();
        String messageContent = chatMessageRequest.message();

        ChatMessage newMessage = chattingService.handleChatMessage(memberId, jiraProjectKey, messageContent);

        ChatMessageResponse responseMessage = ChatMessageResponse.of(newMessage);
        template.convertAndSend("/sub/chatroom/" + jiraProjectKey, responseMessage);

        return ResponseEntity.ok().build();
    }
}
