package ssafy.aissue.common.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import ssafy.aissue.domain.member.entity.Member;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

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

    // 사용자에게 속한 프로젝트 목록 가져오기
    public List<String> fetchUserProjects(String email, String jiraKey) {
        log.info("[JiraApiUtil] fetchUserProjects >>>> email: {}, jiraKey: {}", email, jiraKey);
        String jiraApiUrl = "https://ssafy.atlassian.net/rest/api/3/project/search";
        String auth = email + ":" + jiraKey;
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Basic " + encodedAuth);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<String> response = restTemplate.exchange(jiraApiUrl, HttpMethod.GET, entity, String.class);
        log.info("[JiraApiUtil] 유저의 프로젝트 목록 조회 >>>> response: {}", response);

        if (response.getStatusCode() == HttpStatus.OK) {
            log.info("[JiraApiUtil] 유저의 프로젝트 목록 조회 성공: {}", response.getBody());
            return extractProjectKeysFromBody(response.getBody());
        } else {
            log.error("[JiraApiUtil] 유저의 프로젝트 목록 조회 실패. 상태 코드: {}, 응답 본문: {}", response.getStatusCode(), response.getBody());
            throw new RuntimeException("Failed to fetch user projects from Jira. Response: " + response.getBody());
        }
    }

    // JSON 응답에서 프로젝트 ID 목록 추출
    private List<String> extractProjectKeysFromBody(String responseBody) {
        List<String> projectKeys = new ArrayList<>();
        try {
            log.info("[JiraApiUtil] extractProjectKeysFromBody >>>> responseBody: {}", responseBody);
            JsonNode rootNode = objectMapper.readTree(responseBody);
            log.info("[JiraApiUtil] extractProjectKeysFromBody >>>> rootNode: {}", rootNode);
            JsonNode valuesNode = rootNode.get("values");
            log.info("[JiraApiUtil] extractProjectKeysFromBody >>>> valuesNode: {}", valuesNode);
            if (valuesNode.isArray()) {
                for (JsonNode project : valuesNode) {
                    String projectKey = project.get("key").asText();
                    projectKeys.add(projectKey);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse project keys from response", e);
        }
        return projectKeys;
    }

    // 특정 프로젝트의 멤버 목록 가져오기
    public List<Member> fetchProjectMembers(String jiraProjectKey, String email, String jiraKey) {
        String jiraApiUrl = "https://ssafy.atlassian.net/rest/api/3/user/assignable/search?project=" + jiraProjectKey;
        String auth = email + ":" + jiraKey;
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Basic " + encodedAuth);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(jiraApiUrl, HttpMethod.GET, entity, String.class);
        log.info("[JiraApiUtil] fetchProjectMembers >>>> response: {}", response);

        if (response.getStatusCode() == HttpStatus.OK) {
            return extractMembersFromBody(response.getBody());
        }

        throw new RuntimeException("Failed to fetch project members from Jira");
    }

    // JSON 응답에서 팀원 정보 추출
    private List<Member> extractMembersFromBody(String responseBody) {
        List<Member> members = new ArrayList<>();
        try {
            JsonNode rootNode = objectMapper.readTree(responseBody);
            if (rootNode.isArray()) {
                for (JsonNode actor : rootNode) {
                    String email = actor.has("emailAddress") ? actor.get("emailAddress").asText() : "";
                    String displayName = actor.get("displayName").asText();
                    String jiraId = actor.get("accountId").asText();

                    Member member = Member.builder()
                            .email(email)
                            .name(displayName)
                            .jiraId(jiraId)
                            .build();
                    members.add(member);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse members from response", e);
        }
        return members;
    }

}
