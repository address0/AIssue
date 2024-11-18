package ssafy.aissue.domain.scheduler;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import ssafy.aissue.common.util.ChatSummaryUtil;
import ssafy.aissue.domain.chatting.entity.ChatMessage;
import ssafy.aissue.domain.chatting.entity.ChatSummary;
import ssafy.aissue.domain.chatting.repository.ChatMessageRepository;
import ssafy.aissue.domain.chatting.repository.ChatSummaryRepository;
import ssafy.aissue.domain.chatbot.command.ChatbotCommand;
import ssafy.aissue.api.chatbot.response.ChatbotResponse;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ChatSummaryScheduler {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatSummaryRepository chatSummaryRepository;
    private final ChatSummaryUtil chatSummaryUtil;

    /**
     * 매일 자정에 실행되어 어제 날짜의 채팅 메시지를 요약하고 저장
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void summarizeYesterdayChatMessages() {
        LocalDateTime start = LocalDate.now().minusDays(1).atStartOfDay();
        LocalDateTime end = start.plusDays(1);
        summarizeChatMessagesForPeriod(start, end);
    }

    /**
     * 주어진 기간의 채팅 메시지를 요약하고 저장하는 메서드
     */
    public void summarizeChatMessagesForPeriod(LocalDateTime start, LocalDateTime end) {
        List<ChatMessage> messages = chatMessageRepository.findByCreatedAtBetween(start, end);

        Map<String, List<ChatMessage>> messagesByProjectKey = messages.stream()
                .collect(Collectors.groupingBy(msg -> msg.getChatting().getProject().getJiraProjectKey()));

        messagesByProjectKey.forEach((projectKey, projectMessages) -> {
            String combinedMessages = projectMessages.stream()
                    .map(msg -> msg.getMemberName() + ": " + msg.getMessage())
                    .collect(Collectors.joining("\n"));
            ChatbotCommand command = new ChatbotCommand(combinedMessages);

            ChatbotResponse response = chatSummaryUtil.requestSummary(command);

            ChatSummary chatSummary = new ChatSummary();
            chatSummary.setProjectKey(projectKey);
            chatSummary.setDate(start.toLocalDate());
            chatSummary.setSummary(response.chatbotMessage());
            chatSummaryRepository.save(chatSummary);
        });
    }


}
