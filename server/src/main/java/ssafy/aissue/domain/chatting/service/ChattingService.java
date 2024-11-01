package ssafy.aissue.domain.chatting.service;

import ssafy.aissue.domain.chatting.entity.ChatMessage;
import ssafy.aissue.domain.chatting.entity.Chatting;

import java.util.List;

public interface ChattingService {
    // 특정 프로젝트의 채팅 메시지 목록을 가져오기
    List<Chatting> getChatMessagesForProject(Long projectId, Long memberId);

    // 프로젝트 키로 채팅 메시지 목록 가져오기
    List<ChatMessage> getChatMessagesByProjectKey(String jiraProjectKey);

    // 채팅 메시지를 데이터베이스에 저장하기
    ChatMessage handleChatMessage(Long memberId, String jiraProjectKey, String messageContent);

}
