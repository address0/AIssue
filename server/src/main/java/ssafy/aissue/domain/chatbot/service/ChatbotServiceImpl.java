package ssafy.aissue.domain.chatbot.service;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ssafy.aissue.api.chatbot.response.ChatbotResponse;
import ssafy.aissue.common.util.ChatbotUtil;
import ssafy.aissue.domain.chatbot.command.ChatbotCommand;

@Service
@RequiredArgsConstructor
public class ChatbotServiceImpl implements ChatbotService {

    private final ChatbotUtil chatbotUtil;

    @Override
    public ChatbotResponse sendMessageToChatbot(ChatbotCommand chatbotCommand) {
        return chatbotUtil.sendMessage(chatbotCommand);
    }
}
