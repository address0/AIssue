package ssafy.aissue.domain.chatbot.service;

import ssafy.aissue.api.chatbot.response.ChatbotResponse;
import ssafy.aissue.domain.chatbot.command.ChatbotCommand;

public interface ChatbotService {
    ChatbotResponse sendMessageToChatbot(ChatbotCommand chatbotCommand);
}
