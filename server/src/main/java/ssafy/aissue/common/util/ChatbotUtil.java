package ssafy.aissue.common.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import ssafy.aissue.api.chatbot.response.ChatbotResponse;
import ssafy.aissue.common.properties.OpenAiProperties;
import ssafy.aissue.domain.chatbot.command.ChatbotCommand;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class ChatbotUtil {

    private final OpenAiProperties openAiProperties;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public ChatbotResponse sendMessage(ChatbotCommand chatbotCommand) {
        try {
            // 메시지 설정
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", openAiProperties.apiModel());
            requestBody.put("messages", List.of(
                    Map.of("role", "system", "content", openAiProperties.systemPrompt()),
                    Map.of("role", "user", "content", chatbotCommand.message())
            ));

            // 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openAiProperties.apiKey());  // API 키 설정

            // 요청 전송
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            String responseJson = restTemplate.postForObject(openAiProperties.apiUrl(), entity, String.class);


            Map<String, Object> responseMap = objectMapper.readValue(responseJson, Map.class);
            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseMap.get("choices");
            if (choices != null && !choices.isEmpty()) {
                Map<String, Object> firstChoice = choices.get(0);
                Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
                if (message != null) {
                    String chatbotMessage = (String) message.get("content");
                    log.info("ChatGPT의 응답: {}", chatbotMessage);
                    return ChatbotResponse.of(chatbotMessage);
                }
            }

            log.error("예상치 못한 응답 구조이거나 응답이 비어있습니다.");
            return ChatbotResponse.of("오류: 응답을 처리할 수 없습니다.");

        } catch (Exception e) {
            log.error("ChatGPT에 메시지 전송 실패", e);
            return ChatbotResponse.of("요청 처리 중 오류가 발생했습니다.");
        }
    }
}
