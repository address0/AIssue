package ssafy.aissue.common.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.springframework.web.util.UriComponentsBuilder;
import ssafy.aissue.api.issue.request.JiraIssueCreateRequest;
import ssafy.aissue.api.issue.response.IssueResponse;
import ssafy.aissue.common.exception.member.InvalidJiraCredentialsException;
import ssafy.aissue.domain.member.entity.Member;

import java.net.URI;
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

        throw new InvalidJiraCredentialsException();
    }

    // JSON 파싱 메서드 (Jackson을 사용하여 첫 번째 객체에서 accountId를 추출)
    private String extractAccountIdFromBody(String responseBody) {
        try {
            // JSON 배열의 첫 번째 객체에서 "accountId" 추출
            JsonNode rootNode = objectMapper.readTree(responseBody);
            if (rootNode.isArray() && !rootNode.isEmpty()) {
                return rootNode.get(0).get("accountId").asText();
            }
        } catch (Exception e) {
            throw new InvalidJiraCredentialsException();
        }
        throw new InvalidJiraCredentialsException();
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
        } else if (response.getStatusCode() == HttpStatus.UNAUTHORIZED) {
            log.error("[JiraApiUtil] Jira 인증 실패: email={}, jiraKey={}", email, jiraKey);
            throw new InvalidJiraCredentialsException();
        }

        throw new InvalidJiraCredentialsException();
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

    public List<IssueResponse> fetchWeeklyUserIssues(String email, String jiraKey, String projectKey) {
        log.info("[JiraApiUtil] fetchUserIssues >>>> email: {}, jiraKey: {}", email, jiraKey);

        String jqlQuery = "project = \"" + projectKey + "\" AND sprint in openSprints() AND assignee = \"" + email + "\" AND issuetype = \"Story\"";
        String jiraStoryPointField = "customfield_10031";
        String jiraFields = "id,key,summary,priority,subtasks,parent,status,issuetype,assignee," + jiraStoryPointField;

        // UriComponentsBuilder를 사용하여 URL을 생성하고 인코딩
        URI jiraApiUri = UriComponentsBuilder.fromHttpUrl("https://ssafy.atlassian.net/rest/api/2/search")
                .queryParam("jql", jqlQuery)
                .queryParam("fields", jiraFields)
                .build()
                .encode()  // URI 인코딩 적용
                .toUri();  // 완전한 URI 객체로 변환

        log.info("jira 요청 주소: {}", jiraApiUri);

        String auth = email + ":" + jiraKey;
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Basic " + encodedAuth);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<String> response = restTemplate.exchange(jiraApiUri, HttpMethod.GET, entity, String.class);
        log.info("[JiraApiUtil] 유저의 이슈 목록 조회 >>>> response: {}", response);

        if (response.getStatusCode() == HttpStatus.OK) {
            log.info("[JiraApiUtil] 유저의 이슈 목록 조회 성공: {}", response.getBody());
            return parseIssuesFromResponse(response.getBody());
        } else {
            log.error("[JiraApiUtil] 유저의 이슈 목록 조회 실패. 상태 코드: {}, 응답 본문: {}", response.getStatusCode(), response.getBody());
            throw new RuntimeException("Failed to fetch user projects from Jira. Response: " + response.getBody());
        }
    }


    private List<IssueResponse> parseIssuesFromResponse(String responseBody) {
        List<IssueResponse> issues = new ArrayList<>();
        // String jiraStoryPointField = "customfield_10031";
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode issuesNode = root.path("issues");

            for (JsonNode issueNode : issuesNode) {
                Long id = issueNode.path("id").asLong();
                String key = issueNode.path("key").asText();
                String summary = issueNode.path("fields").path("summary").asText();
                String status = issueNode.path("fields").path("status").path("name").asText();
                String priority = issueNode.path("fields").path("priority").path("name").asText();
                String issuetype = issueNode.path("fields").path("issuetype").path("name").asText();
                String assignee = issueNode.path("fields").path("assignee").path("displayName").asText();
//                log.info("이슈 담당자 : " + assignee);
                IssueResponse.ParentIssue parent = null;
                if (issueNode.path("fields").has("parent")) {
                    JsonNode parentNode = issueNode.path("fields").path("parent");
                    parent = IssueResponse.ParentIssue.builder()
                            .id(parentNode.path("id").asLong())
                            .key(parentNode.path("key").asText())
                            .summary(parentNode.path("fields").path("summary").asText())
                            .status(parentNode.path("fields").path("status").path("name").asText())
                            .priority(parentNode.path("fields").path("priority").path("name").asText())
                            .issuetype(parentNode.path("fields").path("issuetype").path("name").asText())
                            .build();
                }

                List<IssueResponse.Subtask> subtasks = new ArrayList<>();
                if (issueNode.path("fields").has("subtasks")) {
                    for (JsonNode subtaskNode : issueNode.path("fields").path("subtasks")) {
                        subtasks.add(IssueResponse.Subtask.builder()
                                .id(subtaskNode.path("id").asLong())
                                .key(subtaskNode.path("key").asText())
                                .summary(subtaskNode.path("fields").path("summary").asText())
                                .status(subtaskNode.path("fields").path("status").path("name").asText())
                                .priority(subtaskNode.path("fields").path("priority").path("name").asText())
                                .issuetype(subtaskNode.path("fields").path("issuetype").path("name").asText())
                                .build());
                    }
                }

                issues.add(IssueResponse.builder()
                        .id(id)
                        .key(key)
                        .summary(summary)
                        .status(status)
                        .priority(priority)
                        .issuetype(issuetype)
                        .parent(parent)
                        .subtasks(subtasks)
                        .assignee(assignee)
                        .build());
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse issues from response", e);
        }
        return issues;
    }

    public List<IssueResponse> fetchMonthlyUserIssues(String email, String jiraKey, String projectKey) {
        log.info("[JiraApiUtil] fetchUserIssues >>>> email: {}, jiraKey: {}", email, jiraKey);

        String jqlQuery = "project = \"" + projectKey + "\" " + " AND issuetype = \"Epic\"";
        String jiraStoryPointField = "customfield_10031";
        String jiraFields = "id,key,summary,priority,subtasks,status,issuetype,assignee," + jiraStoryPointField;

        // UriComponentsBuilder를 사용하여 URL을 생성하고 인코딩
        URI jiraApiUri = UriComponentsBuilder.fromHttpUrl("https://ssafy.atlassian.net/rest/api/2/search")
                .queryParam("jql", jqlQuery)
                .queryParam("fields", jiraFields)
                .build()
                .encode()  // URI 인코딩 적용
                .toUri();  // 완전한 URI 객체로 변환

        log.info("jira 요청 주소: {}", jiraApiUri);

        String auth = email + ":" + jiraKey;
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Basic " + encodedAuth);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<String> response = restTemplate.exchange(jiraApiUri, HttpMethod.GET, entity, String.class);
        log.info("[JiraApiUtil] 유저의 이슈 목록 조회 >>>> response: {}", response);

        if (response.getStatusCode() == HttpStatus.OK) {
            log.info("[JiraApiUtil] 유저의 이슈 목록 조회 성공: {}", response.getBody());
            return parseMonthlyIssuesFromResponse((response.getBody()));
        } else {
            log.error("[JiraApiUtil] 유저의 이슈 목록 조회 실패. 상태 코드: {}, 응답 본문: {}", response.getStatusCode(), response.getBody());
            throw new RuntimeException("Failed to fetch user projects from Jira. Response: " + response.getBody());
        }
    }

    private List<IssueResponse> parseMonthlyIssuesFromResponse(String responseBody) {
        List<IssueResponse> issues = new ArrayList<>();
        // String jiraStoryPointField = "customfield_10031";
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode issuesNode = root.path("issues");

            for (JsonNode issueNode : issuesNode) {
                Long id = issueNode.path("id").asLong();
                String key = issueNode.path("key").asText();
                String summary = issueNode.path("fields").path("summary").asText();
                String status = issueNode.path("fields").path("status").path("name").asText();
                String priority = issueNode.path("fields").path("priority").path("name").asText();
                String issuetype = issueNode.path("fields").path("issuetype").path("name").asText();
                String assignee = issueNode.path("fields").path("assignee").path("displayName").asText();
//                log.info("이슈 담당자 : " + assignee);


                issues.add(IssueResponse.builder()
                        .id(id)
                        .key(key)
                        .summary(summary)
                        .status(status)
                        .priority(priority)
                        .issuetype(issuetype)
                        .assignee(assignee)
                        .build());
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse issues from response", e);
        }
        return issues;
    }

    public List<String> createBulkIssues(List<JiraIssueCreateRequest.IssueUpdate> issueFieldsList, String email, String jiraKey) throws JsonProcessingException {
        String jiraApiUrl = "https://ssafy.atlassian.net/rest/api/2/issue/bulk";

        String auth = email + ":" + jiraKey;
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Basic " + encodedAuth);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // 이미 IssueUpdate 객체가 있으므로 이를 그대로 사용
        JiraIssueCreateRequest bulkRequest = JiraIssueCreateRequest.builder()
                .issueUpdates(issueFieldsList)
                .build();

        ObjectMapper objectMapper = new ObjectMapper();
        String jsonString = objectMapper.writeValueAsString(bulkRequest);
        log.info(jsonString);


        try {
            HttpEntity<JiraIssueCreateRequest> entity = new HttpEntity<>(bulkRequest, headers);
            ResponseEntity<String> response = restTemplate.exchange(jiraApiUrl, HttpMethod.POST, entity, String.class);

            if (response.getStatusCode() == HttpStatus.CREATED) {
                // 응답이 성공적인 경우, issue keys를 추출
                JsonNode responseNode = objectMapper.readTree(response.getBody());
                return extractIssueKeys(responseNode);
            } else {
                // 응답 상태가 CREATED가 아닌 경우, 상세 로그 추가
                log.error("Bulk issue creation failed with status code {}. Response: {}", response.getStatusCode(), response.getBody());
                throw new RuntimeException("Failed to create issues in Jira. Status: " + response.getStatusCode());
            }
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.error("HTTP error during bulk issue creation: {}", e.getMessage());
            throw new RuntimeException("HTTP error during bulk issue creation", e);
        } catch (Exception e) {
            log.error("Exception during bulk issue creation: {}", e.getMessage());
            throw new RuntimeException("Exception during bulk issue creation", e);
        }
    }

    private List<String> extractIssueKeys(JsonNode responseNode) {
        List<String> issueKeys = new ArrayList<>();
        JsonNode issuesNode = responseNode.path("issues");
        for (JsonNode issueNode : issuesNode) {
            issueKeys.add(issueNode.get("key").asText());
        }
        return issueKeys;
    }


    public Long fetchActiveSprintId(String projectKey, String email, String jiraKey) throws JsonProcessingException {
        // 1. 보드 ID 조회
        String boardApiUrl = "https://ssafy.atlassian.net/rest/agile/1.0/board";
        String auth = email + ":" + jiraKey;
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Basic " + encodedAuth);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<String> boardResponse = restTemplate.exchange(boardApiUrl, HttpMethod.GET, entity, String.class);
        log.info("[JiraApiUtil] fetchBoardId >>>> response: {}", boardResponse);

        if (boardResponse.getStatusCode() == HttpStatus.OK) {
            JsonNode boards = objectMapper.readTree(boardResponse.getBody()).get("values");

            // 프로젝트 키와 동일한 객체의 보드 ID 찾기
            Long boardId = null;
            for (JsonNode board : boards) {
                if (board.path("location").path("projectKey").asText().equals(projectKey)) {
                    boardId = board.path("id").asLong();
                    break;
                }
            }
            if (boardId == null) {
                throw new RuntimeException("Board ID not found for project key: " + projectKey);
            }

            // 2. 보드 ID를 통해 스프린트 조회
            String sprintApiUrl = "https://ssafy.atlassian.net/rest/agile/1.0/board/" + boardId + "/sprint";
            ResponseEntity<String> sprintResponse = restTemplate.exchange(sprintApiUrl, HttpMethod.GET, entity, String.class);
            log.info("[JiraApiUtil] fetchSprintId >>>> response: {}", sprintResponse);

            if (sprintResponse.getStatusCode() == HttpStatus.OK) {
                JsonNode sprints = objectMapper.readTree(sprintResponse.getBody()).get("values");

                // 상태가 active인 스프린트 찾기
                for (JsonNode sprint : sprints) {
                    if ("active".equals(sprint.path("state").asText()) || "future".equals(sprint.path("state").asText())) {
                        return sprint.path("id").asLong();
                    }
                }
            }
        }

        throw new RuntimeException("Active sprint not found for project key: " + projectKey);
    }


}

