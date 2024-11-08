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
public class ChatSummaryUtil {

    private final OpenAiProperties openAiProperties;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    /**
     * OpenAI API에 메시지 요약 요청을 전송하는 메서드
     *
     * @param chatbotCommand 요약할 메시지 목록을 포함하는 명령 객체
     * @return ChatbotResponse 요약된 응답 메시지
     */
    public ChatbotResponse requestSummary(ChatbotCommand chatbotCommand) {
        try {
            // 요약을 요청하는 프롬프트 설정
            String summaryPrompt = "다음 메시지 목록을 요약해 주세요:\n" + chatbotCommand.message();
            // 시스템 프롬프트 설정
            String systemPrompt = "당신은 요청에 따라 요약을 해주는데, 전체적인 핵심 내용과 각 사용자별 내용요약을 해주세요." +
                    "또한 여러 대화자가 있으면 이름 순서대로 요약해주세요 예를 들어 홍길동 강호동이있으면 강호동의 내용이 먼저 요약되어 나와야합니다." +
                    "요약 순서는 전체내용요약, 핵심내용, 사용자별 내용요약입니다." +
                    "그리고 무조건 님을 붙이고, 존댓말을 사용하세요.그리고 앞에 -를 붙이세요 ex) - 강호도님의 요약: ~~~"+
                    "그리고 전체 내용 요약: ~~~~ 핵심 내용 요약:~~~ 사용자별 요약: 강호도님: ~~~ 이런식으로 응답을 줘야하고"
                    + "만약에 사용자가 없다면 사용자별 요약은 생략해도 됩니다. 또한 요약을 못하는 내용이라면 왜 못하는지 적어주세요"
                    +"대답 형식 예시 : 전체 내용 요약: \n" +
                    "- 주로 간단한 단어, 감탄사, 인사말과 같은 비구조화된 텍스트들이 포함되어 있습니다. 몇몇 반복되는 구를 통해 일부 인물에 대한 장난스러운 면발이 드러나며, 아쉬움이나 불만을 표현하는 메시지도 포함되어 있습니다.\n" +
                    "\n" +
                    "핵심 내용 요약:\n" +
                    "- 대화 중 일부 사용자들에 대한 장난스러운 비난과 자신의 상황에 대한 감정 표현이 주를 이룹니다. 또한 기술적인 어려움에 대한 아쉬움과 포기, 그리고 간단한 인사나 감탄의 연속적 표현이 있습니다.\n" +
                    "\n" +
                    "사용자별 내용 요약:\n" +
                    "- 성현님: 성현님에게 '바보', '멍청이'라고 농담을 하는 메시지가 포함되어 있습니다.\n" +
                    "- 소영님: 다른 대화 참가자가 소영님에게 직접적으로 언급되지 않았지만, 주로 친근감을 표현하는 인사가 있습니다.\n" +
                    "- 태호님: 태호님은 여러 메시지에서 '바보'라고 반복해서 농담되었습니다. 하지만 '태호 바보 아니다'라는 반박 메시지도 포함되어 있습니다.\n" +
                    "- 희현님: '희현누나'라고 언급되어 있으며, 그 외의 자세한 정보는 제공되지 않습니다.\n" +
                    "- 주소영님: 주소영은 '말하는 감자'라고 묘사되며, 간단한 대화의 일부로 언급됩니다.";
            // 요청 본문 설정
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", openAiProperties.apiModel());
            requestBody.put("messages", List.of(
                    Map.of("role", "system", "content", systemPrompt),
                    Map.of("role", "user", "content", summaryPrompt)
            ));

            // 요청 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openAiProperties.apiKey());

            // API 요청 보내기
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            String responseJson = restTemplate.postForObject(openAiProperties.apiUrl(), entity, String.class);

            // 응답 파싱 및 요약 메시지 추출
            Map<String, Object> responseMap = objectMapper.readValue(responseJson, Map.class);
            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseMap.get("choices");
            if (choices != null && !choices.isEmpty()) {
                Map<String, Object> firstChoice = choices.get(0);
                Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
                if (message != null) {
                    String summaryMessage = (String) message.get("content");
                    log.info("ChatGPT 요약 응답: {}", summaryMessage);
                    return ChatbotResponse.of(summaryMessage);
                }
            }

            log.error("응답이 비어있거나 예기치 않은 구조입니다.");
            return ChatbotResponse.of("오류: 응답을 처리할 수 없습니다.");

        } catch (Exception e) {
            log.error("OpenAI API에 요약 요청 실패", e);
            return ChatbotResponse.of("요청 처리 중 오류가 발생했습니다.");
        }
    }
}
