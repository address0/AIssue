package ssafy.aissue.domain.chatting.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ssafy.aissue.domain.chatting.entity.ChatMessage;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
}
