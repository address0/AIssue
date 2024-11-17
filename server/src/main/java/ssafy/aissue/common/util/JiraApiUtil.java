package ssafy.aissue.common.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.springframework.web.util.UriComponentsBuilder;
import ssafy.aissue.api.issue.request.*;
import ssafy.aissue.api.issue.response.IssueDetailResponse;
import ssafy.aissue.api.issue.response.IssueResponse;
import ssafy.aissue.api.issue.response.SprintIssueResponse;
import ssafy.aissue.common.exception.member.InvalidJiraCredentialsException;
import ssafy.aissue.domain.member.entity.Member;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

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
        String jiraFields = "id,key,summary,description,priority,subtasks,parent,status,issuetype,assignee," + jiraStoryPointField;

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
                String description = issueNode.path("fields").path("description").asText("");
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
                            .description(parentNode.path("fields").path("description").asText(""))
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
                                .description(subtaskNode.path("fields").path("description").asText(""))
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
                        .description(description)
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
        String jiraFields = "id,key,summary,description,priority,subtasks,status,issuetype,assignee," + jiraStoryPointField;

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
                String description = issueNode.path("fields").path("description").asText("");
                String status = issueNode.path("fields").path("status").path("name").asText();
                String priority = issueNode.path("fields").path("priority").path("name").asText();
                String issuetype = issueNode.path("fields").path("issuetype").path("name").asText();
                String assignee = issueNode.path("fields").path("assignee").path("displayName").asText();
//                log.info("이슈 담당자 : " + assignee);

                issues.add(IssueResponse.builder()
                        .id(id)
                        .key(key)
                        .summary(summary)
                        .description(description)
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

    public List<IssueResponse> fetchEpicIssues(String email, String jiraKey, String projectKey) {
        log.info("[JiraApiUtil] fetchUserIssues >>>> email: {}, jiraKey: {}", email, jiraKey);

        String jqlQuery = "project = \"" + projectKey + "\" " + " AND issuetype = \"Epic\"";
        String jiraFields = "id,key,summary,description,priority,subtasks,status,issuetype,assignee,";

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
            return parseEpicIssuesFromResponse((response.getBody()));
        } else {
            log.error("[JiraApiUtil] 유저의 이슈 목록 조회 실패. 상태 코드: {}, 응답 본문: {}", response.getStatusCode(), response.getBody());
            throw new RuntimeException("Failed to fetch user projects from Jira. Response: " + response.getBody());
        }
    }

    private List<IssueResponse> parseEpicIssuesFromResponse(String responseBody) {
        List<IssueResponse> issues = new ArrayList<>();
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode issuesNode = root.path("issues");

            for (JsonNode issueNode : issuesNode) {
                Long id = issueNode.path("id").asLong();
                String key = issueNode.path("key").asText();
                String summary = issueNode.path("fields").path("summary").asText();
                String description = issueNode.path("fields").path("description").asText("");
                String status = issueNode.path("fields").path("status").path("name").asText();
                String priority = issueNode.path("fields").path("priority").path("name").asText();

                issues.add(IssueResponse.builder()
                        .id(id)
                        .key(key)
                        .summary(summary)
                        .description(description)
                        .status(status)
                        .priority(priority)
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

        List<String> allIssueKeys = new ArrayList<>();
        int batchSize = 50;  // 한 번에 처리할 최대 이슈 개수
        int totalSize = issueFieldsList.size();
        int batchCount = (totalSize + batchSize - 1) / batchSize;  // 배치 수 계산

        for (int i = 0; i < batchCount; i++) {
            int start = i * batchSize;
            int end = Math.min(start + batchSize, totalSize);
            List<JiraIssueCreateRequest.IssueUpdate> batchIssueUpdates = issueFieldsList.subList(start, end);

            // 벌크 요청을 보내는 부분
            JiraIssueCreateRequest bulkRequest = JiraIssueCreateRequest.builder()
                    .issueUpdates(batchIssueUpdates)
                    .build();

            ObjectMapper objectMapper = new ObjectMapper();
            String jsonString = objectMapper.writeValueAsString(bulkRequest);
            log.info("Sending bulk request: {}", jsonString);

            try {
                HttpEntity<JiraIssueCreateRequest> entity = new HttpEntity<>(bulkRequest, headers);
                ResponseEntity<String> response = restTemplate.exchange(jiraApiUrl, HttpMethod.POST, entity, String.class);

                if (response.getStatusCode() == HttpStatus.CREATED) {
                    // 응답이 성공적이면, issue keys를 추출
                    JsonNode responseNode = objectMapper.readTree(response.getBody());
                    List<String> issueKeys = extractIssueKeys(responseNode);
                    allIssueKeys.addAll(issueKeys);  // 모든 이슈 키를 수집
                } else {
                    log.error("Bulk issue creation failed with status code {}. Response: {}", response.getStatusCode(), response.getBody());
                    throw new RuntimeException("Failed to create issues in Jira. Status: " + response.getStatusCode());
                }
            } catch (Exception e) {
                log.error("Exception during bulk issue creation: {}", e.getMessage());
                throw new RuntimeException("Exception during bulk issue creation", e);
            }
        }

        return allIssueKeys;  // 모든 배치에서 생성된 이슈 키를 반환
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

    public List<IssueResponse> fetchIssuesByKeys(List<String> issueKeys, String email, String jiraKey) {

        // JQL로 다수의 이슈를 조회하는 쿼리
        String jqlQuery = String.format("key in (%s)", String.join(",", issueKeys));

        String jiraFields = "id,key,summary,issuetype";
        URI jiraApiUri = UriComponentsBuilder.fromHttpUrl("https://ssafy.atlassian.net/rest/api/2/search")
                .queryParam("jql", jqlQuery)
                .queryParam("fields", jiraFields)
                .build()
                .encode()
                .toUri();

        String auth = email + ":" + jiraKey;
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Basic " + encodedAuth);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<String> response = restTemplate.exchange(jiraApiUri, HttpMethod.GET, entity, String.class);

        if (response.getStatusCode() == HttpStatus.OK) {
            return parseIssuesFromResponse(response.getBody());
        } else {
            throw new RuntimeException("Failed to fetch issues from Jira. Response: " + response.getBody());
        }
    }

    public void updateIssue(JiraIssueUpdateRequest jiraIssueUpdateRequest, String email, String jiraKey, String issueKey) throws JsonProcessingException {

        String url = "https://ssafy.atlassian.net/rest/api/2/issue/" + issueKey;

        String auth = email + ":" + jiraKey;
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Basic " + encodedAuth);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Jira API에 보내기 위한 HTTP 엔티티 생성
        HttpEntity<JiraIssueUpdateRequest> entity = new HttpEntity<>(jiraIssueUpdateRequest, headers);

        // PUT 요청을 보내어 이슈를 업데이트
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.PUT, entity, String.class);

        // 응답 코드 확인
        if (response.getStatusCode() == HttpStatus.NO_CONTENT) {
            log.info("이슈가 성공적으로 수정되었습니다.");
        } else {
            log.error("이슈 수정 실패. 상태 코드: {}, 응답 본문: {}", response.getStatusCode(), response.getBody());
            throw new RuntimeException("Failed to update issue in Jira. Status: " + response.getStatusCode());
        }
    }

    public void deleteIssue(String issueKey, String email, String jiraKey) {
        String url = "https://ssafy.atlassian.net/rest/api/2/issue/" + issueKey +"?deleteSubtasks=true";
        String auth = email + ":" + jiraKey;
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Basic " + encodedAuth);

        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.DELETE, entity, String.class);

        if (response.getStatusCode() == HttpStatus.NO_CONTENT) {
            log.info("Issue deleted successfully: " + issueKey);
        } else {
            log.error("Failed to delete issue: " + issueKey);
            throw new RuntimeException("Failed to delete issue in Jira.");
        }
    }

    public List<SprintIssueResponse> fetchSprintIssues(String projectKey, String email, String jiraKey) throws JsonProcessingException {
        log.info("[JiraApiUtil] fetchSprintIssues >>>> projectKey: {}, email: {}", projectKey, email);

        // JQL 쿼리 생성 (에픽, 스토리, 버그, 작업, 하위 작업)
        String jqlQuery = "project = \"" + projectKey + "\" AND issuetype in (Epic, Story, Bug, Task, Sub-task)";

        // 가져올 필드 설정
        String fields = "id,key,summary,description,priority,subtasks,parent,status,issuetype,assignee";

        // 수동으로 URL 인코딩하여 URL을 생성
        String url = "https://ssafy.atlassian.net/rest/api/2/search?" +
                "jql=" + URLEncoder.encode(jqlQuery, StandardCharsets.UTF_8) + "&" +
                "fields=" + URLEncoder.encode(fields, StandardCharsets.UTF_8);

        URI jiraApiUri = URI.create(url);

        String auth = email + ":" + jiraKey;
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Basic " + encodedAuth);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        // 페이지네이션 처리: 첫 번째 페이지부터 시작
        int startAt = 0;
        int maxResults = 50;  // 한 페이지당 50개의 이슈
        List<JsonNode> allIssues = new ArrayList<>();

        while (true) {
            // 요청에 startAt과 maxResults 추가
            String paginatedUrl = url + "&startAt=" + startAt + "&maxResults=" + maxResults;
            URI paginatedUri = URI.create(paginatedUrl);
            log.info(paginatedUri.toString());

            ResponseEntity<String> response = restTemplate.exchange(paginatedUri, HttpMethod.GET, entity, String.class);
            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode rootNode = objectMapper.readTree(response.getBody());
                int total = rootNode.path("total").asInt();  // 전체 이슈 수
                JsonNode issuesNode = rootNode.path("issues");

                // addAll()로 모든 이슈를 allIssues 리스트에 추가
                issuesNode.forEach(allIssues::add);

                // 로그 추가: 현재 페이지에서 반환된 이슈 개수
                log.info("Issues returned on this page: {}", issuesNode.size());

                // 반환된 이슈 수가 maxResults보다 적으면 마지막 페이지로 간주
                if (issuesNode.size() < maxResults || allIssues.size() >= total) {
                    break; // 더 이상 불러올 이슈가 없으면 종료
                } else {
                    // 다음 페이지로 이동
                    startAt += maxResults;
                }
            } else {
                throw new RuntimeException("Failed to fetch sprint issues from Jira. Response: " + response.getBody());
            }
        }

        // 모든 이슈 데이터를 받은 후, 그 데이터로 매칭 작업 시작
        return parseSprintIssuesFromResponse(allIssues);
    }


    // 이슈 파싱 및 매칭을 처리하는 메서드
    private List<SprintIssueResponse> parseSprintIssuesFromResponse(List<JsonNode> allIssues) throws JsonProcessingException {
        List<SprintIssueResponse> sprintIssues = new ArrayList<>();
        Map<Long, SprintIssueResponse> epicMap = new HashMap<>();
        Map<Long, SprintIssueResponse.MediumIssueResponse> mediumIssueMap = new HashMap<>();

        // 에픽과 부모가 없는 스토리, 버그, 작업을 먼저 처리
        for (JsonNode issueNode : allIssues) {
            Long id = issueNode.path("id").asLong();
            String key = issueNode.path("key").asText();
            String summary = issueNode.path("fields").path("summary").asText();
            String description = issueNode.path("fields").path("description").asText();
            String status = issueNode.path("fields").path("status").path("name").asText();
            String priority = issueNode.path("fields").path("priority").path("name").asText();
            String issuetype = issueNode.path("fields").path("issuetype").path("name").asText();

            log.info("Issue Type for issue {}: {}", key, issuetype);

            // 에픽 처리
            if ("EPIC".equalsIgnoreCase(issuetype) || "에픽".equalsIgnoreCase(issuetype)) {
                SprintIssueResponse epic = SprintIssueResponse.builder()
                        .id(id)
                        .key(key)
                        .summary(summary)
                        .description(description)
                        .status(status)
                        .priority(priority)
                        .issuetype(issuetype)
                        .subIssues(new ArrayList<>())  // 에픽은 하위 이슈 목록이 있음
                        .build();
                epicMap.put(id, epic);
                sprintIssues.add(epic);
                log.info("Epic added: {}", key);
            }

            // 부모가 없는 STORY, BUG, TASK는 MediumIssueResponse 객체로 생성
            if (("STORY".equalsIgnoreCase(issuetype) || "스토리".equalsIgnoreCase(issuetype) ||
                    "BUG".equalsIgnoreCase(issuetype) || "버그".equalsIgnoreCase(issuetype) ||
                    "TASK".equalsIgnoreCase(issuetype) || "작업".equalsIgnoreCase(issuetype)) &&
                    issueNode.path("fields").path("parent").isMissingNode()) {

                // 부모가 없는 STORY, BUG, TASK는 MediumIssueResponse로 생성
                SprintIssueResponse mediumIssue = SprintIssueResponse.builder()
                        .id(id)
                        .key(key)
                        .summary(summary)
                        .description(description)
                        .status(status)
                        .priority(priority)
                        .issuetype(issuetype)
                        .subtasks(new ArrayList<>())  // 하위 작업이 들어갈 리스트
                        .build();

                // mediumIssueMap에 추가
                epicMap.put(id, mediumIssue);

                // sprintIssues 리스트에 SprintIssueResponse 추가
                sprintIssues.add(mediumIssue);
                log.info("Story/Bug/Task added (without parent): {}", key);
            }
        }

        // 부모가 있는 스토리, 버그, 작업 처리
        for (JsonNode issueNode : allIssues) {
            Long id = issueNode.path("id").asLong();
            String key = issueNode.path("key").asText();
            String issuetype = issueNode.path("fields").path("issuetype").path("name").asText();
            String summary = issueNode.path("fields").path("summary").asText();
            String description = issueNode.path("fields").path("description").asText();
            String status = issueNode.path("fields").path("status").path("name").asText();
            String priority = issueNode.path("fields").path("priority").path("name").asText();

            JsonNode parentNode = issueNode.path("fields").path("parent");
            if (!parentNode.isMissingNode()) {
                Long parentId = parentNode.path("id").asLong();

                if ("STORY".equalsIgnoreCase(issuetype) || "스토리".equalsIgnoreCase(issuetype) ||
                        "BUG".equalsIgnoreCase(issuetype) || "버그".equalsIgnoreCase(issuetype) ||
                        "TASK".equalsIgnoreCase(issuetype) || "작업".equalsIgnoreCase(issuetype)) {

                    SprintIssueResponse.MediumIssueResponse mediumIssue = SprintIssueResponse.MediumIssueResponse.builder()
                            .id(id)
                            .key(key)
                            .summary(summary)
                            .description(description)
                            .status(status)
                            .priority(priority)
                            .issuetype(issuetype)
                            .subtasks(new ArrayList<>())  // 하위 작업이 들어갈 리스트
                            .build();

                    mediumIssueMap.put(id, mediumIssue);
                    // 부모가 에픽이면 그 하위 이슈로 추가
                    SprintIssueResponse epic = epicMap.get(parentId);
                    if (epic != null) {
                        epic.getSubIssues().add(mediumIssue);  // SprintIssueResponse의 subIssues에 MediumIssueResponse 추가
                        log.info("Story/Bug/Task added to Epic: {}", key);
                    } else {
                        log.warn("Epic not found for story/bug/task with parent: {}", key);
                    }
                }
            }
        }

        log.info(epicMap.toString());
        log.info(mediumIssueMap.toString());
        // 하위 작업 처리
        for (JsonNode issueNode : allIssues) {
            Long id = issueNode.path("id").asLong();
            String key = issueNode.path("key").asText();
            String issuetype = issueNode.path("fields").path("issuetype").path("name").asText();

            if ("SUB-TASK".equalsIgnoreCase(issuetype) || "하위 작업".equalsIgnoreCase(issuetype)) {
                String subtaskSummary = issueNode.path("fields").path("summary").asText();
                String subtaskDescription = issueNode.path("fields").path("description").asText();
                String subtaskStatus = issueNode.path("fields").path("status").path("name").asText();

                JsonNode parentNode = issueNode.path("fields").path("parent");
                if (!parentNode.isMissingNode()) {
                    Long parentId = parentNode.path("id").asLong();
                    // 부모가 되는 스토리, 버그, 작업을 찾고 하위 작업 추가
                    SprintIssueResponse.MediumIssueResponse parentIssue = mediumIssueMap.get(parentId);
                    if (parentIssue != null) {
                        SprintIssueResponse.Subtask subtask = new SprintIssueResponse.Subtask(subtaskSummary, subtaskDescription, subtaskStatus, issuetype);
                        parentIssue.getSubtasks().add(subtask);  // 하위 작업 추가
                        log.info("Subtask added: {}", subtaskSummary);
                    }

                    SprintIssueResponse epicIssue = epicMap.get(parentId);
                    if (epicIssue != null) {
                        SprintIssueResponse.Subtask subtask = new SprintIssueResponse.Subtask(subtaskSummary, subtaskDescription, subtaskStatus, issuetype);
                        epicIssue.getSubtasks().add(subtask);  // 하위 작업 추가
                        log.info("Subtask added: {}", subtaskSummary);
                    }
                }
            }
        }

        log.info("Total Epic Issues: {}", sprintIssues.size());
        return sprintIssues;
    }

    public IssueDetailResponse fetchIssueDetails(String issueKey, String email, String jiraKey) throws Exception {
        // JIRA API URL 생성
        String jiraApiUrl = "https://ssafy.atlassian.net/rest/api/2/issue/" + issueKey;

        // Jira 인증을 위한 Base64 인코딩
        String auth = email + ":" + jiraKey;
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());

        // HTTP 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Basic " + encodedAuth);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // 요청 엔티티 생성
        HttpEntity<String> entity = new HttpEntity<>(headers);

        // REST 요청 보내기
        ResponseEntity<String> response = restTemplate.exchange(jiraApiUrl, HttpMethod.GET, entity, String.class);

        // 응답 상태 확인
        if (response.getStatusCode() == HttpStatus.OK) {
            return parseIssueDetailFromResponse(response.getBody());
        } else {
            // 실패하면 예외를 던짐
            throw new RuntimeException("Failed to fetch issue details from Jira. Response: " + response.getBody());
        }
    }

    private IssueDetailResponse parseIssueDetailFromResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode fields = root.path("fields");

            // 기본 정보들
            Long id = root.path("id").asLong(); // id는 fields 밖에 존재할 수 있습니다.
            String key = root.path("key").asText();
            String summary = fields.path("summary").asText();
            String description = !Objects.equals(fields.path("description").asText(), "null") ? fields.path("description").asText() : "";

            // status와 priority는 객체이므로, 해당 객체의 값을 가져와야 함
            String status = fields.path("status").path("name").asText(); // status.name
            String priority = fields.path("priority").path("name").asText(); // priority.name

            // assignee와 storyPoints도 가져오기
            String assignee = fields.path("assignee").path("displayName").asText();
            Double storyPoints = fields.path("customfield_10031").asDouble(); // 스토리 포인트 필드 ID는 프로젝트에 따라 다를 수 있음

            // parent 정보 (있을 경우)
            String parent = fields.path("parent").path("key").asText();

            // issuetype 정보
            String issuetype = fields.path("issuetype").path("name").asText();

            // issueLink 처리 (Blocks type만 필터링하여 처리)
            IssueDetailResponse.IssueLink issuelink = parseIssueLinks(fields.path("issuelinks"));

            // 로그 출력
            log.info("Issue details - ID: {}, Key: {}, Summary: {}, Description: {}, Status: {}, Priority: {}, Assignee: {}",
                    id, key, summary, description, status, priority, assignee);

            // IssueDetailResponse 객체 반환
            return IssueDetailResponse.builder()
                    .id(id)
                    .key(key)
                    .summary(summary)
                    .description(description)
                    .priority(priority)
                    .status(status)
                    .assignee(assignee)
                    .storyPoints(storyPoints)
                    .parent(parent)
                    .issuetype(issuetype) // 이슈 타입
                    .issuelink(issuelink)
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse issue details from response", e);
        }
    }

    private IssueDetailResponse.IssueLink parseIssueLinks(JsonNode issueLinks) {
        List<IssueDetailResponse.IssueLink> links = new ArrayList<>();

        if (issueLinks.isArray()) {
            // InwardIssue와 OutwardIssue 처리
            IssueDetailResponse.IssueLink.IssueLinkIssue inwardIssue = null;
            IssueDetailResponse.IssueLink.IssueLinkIssue outwardIssue = null;
            String linkType = "";
            for (JsonNode linkNode : issueLinks) {
                // 링크 타입이 "Blocks"일 경우에만 처리
                linkType = linkNode.path("type").path("name").asText();
                if ("Blocks".equalsIgnoreCase(linkType)) {


                    // inwardIssue가 존재하면 해당 데이터 가져오기
                    JsonNode inwardIssueNode = linkNode.path("inwardIssue");
                    if (!inwardIssueNode.isMissingNode()) {
                        inwardIssue = parseIssue(inwardIssueNode);
                    }

                    // outwardIssue가 존재하면 해당 데이터 가져오기
                    JsonNode outwardIssueNode = linkNode.path("outwardIssue");
                    if (!outwardIssueNode.isMissingNode()) {
                        outwardIssue = parseIssue(outwardIssueNode);
                    }

                }
            }
            // inwardIssue와 outwardIssue 둘 중 하나만 있을 수 있음
            if (inwardIssue != null || outwardIssue != null) {
                IssueDetailResponse.IssueLink issueLink = IssueDetailResponse.IssueLink.builder()
                        .type(linkType)
                        .inwardIssue(inwardIssue)
                        .outwardIssue(outwardIssue)
                        .build();
                links.add(issueLink);
            }
        }

        // "Blocks" 링크가 없다면 null 반환, 하나라도 있다면 첫 번째 링크 반환
        return links.isEmpty() ? null : links.get(0);
    }

    private IssueDetailResponse.IssueLink.IssueLinkIssue parseIssue(JsonNode issueNode) {
        if (issueNode.isMissingNode()) {
            return null;
        }
        return IssueDetailResponse.IssueLink.IssueLinkIssue.builder()
                .id(issueNode.path("id").asLong())
                .key(issueNode.path("key").asText())
                .summary(issueNode.path("fields").path("summary").asText())
                .priority(issueNode.path("fields").path("priority").path("name").asText())
                .status(issueNode.path("fields").path("status").path("name").asText())
                .issuetype(issueNode.path("fields").path("issuetype").path("name").asText())
                .build();
    }


    public String fetchUpdateStatus(IssueStatusRequest statusRequest, String email, String jiraKey) {
        String issueKey = statusRequest.getIssueKey();
        String newStatus = statusRequest.getStatus();  // 변경할 상태 이름

        // Jira API URL 생성 (이슈 상태 업데이트를 위한 전환 요청)
        String url = "https://ssafy.atlassian.net/rest/api/2/issue/" + issueKey + "/transitions";

        // Jira 인증을 위한 Base64 인코딩
        String auth = email + ":" + jiraKey;
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());

        // HTTP 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Basic " + encodedAuth);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // 이슈 상태 전환을 위한 transitionId를 조회 (새로운 상태에 해당하는 transitionId 필요)
        String transitionId = getTransitionIdForStatus(newStatus, issueKey, email, jiraKey);

        // Jira API에 보내기 위한 데이터 형식으로 전환
        JiraStatusUpdateRequest jiraTransitionRequest = JiraStatusUpdateRequest.builder()
                .transition(JiraStatusUpdateRequest.Transition.builder()
                        .id(transitionId)
                        .build())
                .build();

        // HTTP 엔티티 생성
        HttpEntity<JiraStatusUpdateRequest> entity = new HttpEntity<>(jiraTransitionRequest, headers);

        try {
            // PUT 요청을 보내어 이슈 상태를 전환
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            // 응답 코드 확인
            if (response.getStatusCode() == HttpStatus.NO_CONTENT) {
                return "이슈 상태가 성공적으로 변경되었습니다.";
            } else {
                log.error("이슈 상태 변경 실패. 상태 코드: {}, 응답 본문: {}", response.getStatusCode(), response.getBody());
                throw new RuntimeException("Failed to transition issue in Jira. Status: " + response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("이슈 상태 전환 중 오류 발생", e);
            throw new RuntimeException("이슈 상태 전환 중 오류 발생", e);
        }
    }

    private String getTransitionIdForStatus(String status, String issueKey, String email, String jiraKey) {
        // Jira에서 해당 상태에 대한 transitionId를 조회하는 로직을 구현해야 함.
        // 기본적으로 상태에 맞는 transitionId를 찾아서 반환하는 메서드
        String transitionsUrl = "https://ssafy.atlassian.net/rest/api/2/issue/" + issueKey + "/transitions";

        String auth = email + ":" + jiraKey;
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Basic " + encodedAuth);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(transitionsUrl, HttpMethod.GET, entity, String.class);

        if (response.getStatusCode() == HttpStatus.OK) {
            try {
                JsonNode rootNode = objectMapper.readTree(response.getBody());
                for (JsonNode transitionNode : rootNode.path("transitions")) {
                    if (transitionNode.path("name").asText().equalsIgnoreCase(status)) {
                        return transitionNode.path("id").asText(); // status에 해당하는 transition id 반환
                    }
                }
                throw new RuntimeException("Transition ID for status " + status + " not found.");
            } catch (Exception e) {
                throw new RuntimeException("Failed to fetch transitions for issue: " + issueKey, e);
            }
        } else {
            throw new RuntimeException("Failed to fetch transitions for issue: " + issueKey + " Response: " + response.getBody());
        }
    }



}



