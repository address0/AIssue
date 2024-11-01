package ssafy.aissue.api.chatting;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import ssafy.aissue.api.chatting.request.ChatMessageRequest;
import ssafy.aissue.api.chatting.response.ChatMessageResponse;
import ssafy.aissue.domain.chatting.entity.ChatMessage;
import ssafy.aissue.domain.chatting.entity.Chatting;
import ssafy.aissue.domain.chatting.repository.ChattingRepository;
import ssafy.aissue.domain.chatting.service.ChattingService;
import ssafy.aissue.domain.project.entity.Project;
import ssafy.aissue.domain.project.service.ProjectService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@Tag(name = "Chatting", description = "채팅창")
public class ChattingController {

    private final SimpMessageSendingOperations template;
    private final ChattingRepository chattingRepository;
    private final ProjectService projectService;
    private final ChattingService chattingService;

    // 채팅 메시지 목록 반환
    @PreAuthorize("hasRole('ROLE_MEMBER')")
    @Operation(summary = "프로젝트의 채팅 메시지 목록 조회", description = "지정된 프로젝트 키를 사용하여 채팅 메시지 목록을 반환합니다.")
    @GetMapping("/chat/{jiraProjectKey}")
    public ResponseEntity<List<ChatMessageResponse>> getChatMessages(@PathVariable String jiraProjectKey) {
        Project project = projectService.findByJiraProjectKey(jiraProjectKey);
        if (project == null) {
            return ResponseEntity.status(404).build();
        }

        Chatting chatting = chattingRepository.findByProject(project)
                .orElseThrow(() -> new IllegalArgumentException("채팅 인스턴스를 찾을 수 없습니다."));

        List<ChatMessageResponse> messages = chatting.getMessages().stream()
                .map(ChatMessageResponse::of)
                .collect(Collectors.toList());

        return ResponseEntity.ok(messages);
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
