package ssafy.aissue.common.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.Base64;

@Component
@Slf4j
public class JiraApiUtil {
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public JiraApiUtil(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public String fetchJiraAccountId(String email, String jiraKey) {
        // 요청 URL에 email 값을 쿼리 파라미터로 포함
        String jiraApiUrl = "https://ssafy.atlassian.net/rest/api/3/user/search?query=" + email;

        // 이메일(username)과 jiraKey(password)를 이용하여 Basic Auth 설정
        String auth = email + ":" + jiraKey;
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Basic " + encodedAuth);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        // API 요청
        ResponseEntity<String> response = restTemplate.exchange(jiraApiUrl, HttpMethod.GET, entity, String.class);

        // 로그로 응답 내용 확인
        log.info("[JiraApiUtil] fetchJiraAccountId >>>> response: {}", response);
        // 응답 처리 및 accountId 추출
        if (response.getStatusCode() == HttpStatus.OK) {
            String body = response.getBody();


            // accountId를 JSON에서 추출하는 로직
            return extractAccountIdFromBody(body);
        }

        throw new RuntimeException("Failed to fetch Jira account_id");
    }

    // JSON 파싱 메서드 (Jackson을 사용하여 첫 번째 객체에서 accountId를 추출)
    private String extractAccountIdFromBody(String responseBody) {
        try {
            // JSON 배열의 첫 번째 객체에서 "accountId" 추출
            JsonNode rootNode = objectMapper.readTree(responseBody);
            if (rootNode.isArray() && rootNode.size() > 0) {
                return rootNode.get(0).get("accountId").asText();
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse accountId from response", e);
        }
        throw new RuntimeException("No accountId found in response");
    }
}
