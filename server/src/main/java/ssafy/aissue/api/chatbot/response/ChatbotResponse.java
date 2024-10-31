package ssafy.aissue.api.chatbot.response;

public record ChatbotResponse(
        String chatbotMessage
) {
    public static ChatbotResponse of(String chatbotMessage) {
        return new ChatbotResponse(chatbotMessage);
    }
}
