package ssafy.aissue.domain.chatting.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ssafy.aissue.common.exception.chatting.ProjectAccessDeniedException;
import ssafy.aissue.domain.chatting.entity.ChatMessage;
import ssafy.aissue.domain.chatting.entity.Chatting;
import ssafy.aissue.domain.chatting.repository.ChatMessageRepository;
import ssafy.aissue.domain.chatting.repository.ChattingRepository;
import ssafy.aissue.domain.member.entity.Member;
import ssafy.aissue.domain.member.repository.MemberRepository;
import ssafy.aissue.domain.project.entity.Project;
import ssafy.aissue.domain.project.repository.ProjectMemberRepository;
import ssafy.aissue.domain.project.repository.ProjectRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ChattingServiceImpl implements ChattingService {

    private final ChattingRepository chattingRepository;
    private final ProjectRepository projectRepository;
    private final MemberRepository memberRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final ChatMessageRepository chatMessageRepository;
    /**
     * 특정 프로젝트의 채팅 메시지 목록을 가져오는 메서드
     * 프로젝트 접근 권한 확인 후 메시지 반환
     */
    @Override
    @Transactional(readOnly = true)
    public List<Chatting> getChatMessagesForProject(Long projectId, Long memberId) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid project ID"));

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid member ID"));

        // 해당 프로젝트에 사용자가 접근 권한이 있는지 검증
        if (!projectMemberRepository.existsByProjectAndMember(project, member)) {
            throw new ProjectAccessDeniedException("Access denied to project: " + projectId);
        }

        // 프로젝트 ID에 해당하는 채팅 메시지 목록을 반환
        return chattingRepository.findByProjectIdOrderByCreatedAtAsc(projectId);
    }
    // 프로젝트 키로 채팅 메시지 목록 가져오기
    @Override
    @Transactional(readOnly = true)
    public List<ChatMessage> getChatMessagesByProjectKey(String jiraProjectKey) {
        Project project = projectRepository.findByJiraProjectKey(jiraProjectKey)
                .orElseThrow(() -> new IllegalArgumentException("Invalid project key"));

        Chatting chatting = chattingRepository.findByProject(project)
                .orElseThrow(() -> new IllegalArgumentException("Chat instance not found"));

        return chatting.getMessages();
    }

    /**
     * 채팅 메시지를 데이터베이스에 저장하는 메서드
     */
    @Override
    @Transactional
    public ChatMessage handleChatMessage(Long memberId, String jiraProjectKey, String messageContent) {
        Project project = projectRepository.findByJiraProjectKey(jiraProjectKey)
                .orElseThrow(() -> new IllegalArgumentException("Invalid project key"));


        Chatting chatting = chattingRepository.findByProject(project)
                .orElseThrow(() -> new IllegalArgumentException("Chat instance not found"));

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));
        ChatMessage newMessage = new ChatMessage();
        newMessage.setChatting(chatting);
        newMessage.setMemberId(memberId);
        newMessage.setMemberName(member.getName());
        newMessage.setMessage(messageContent);
        return chatMessageRepository.save(newMessage);
    }
}
