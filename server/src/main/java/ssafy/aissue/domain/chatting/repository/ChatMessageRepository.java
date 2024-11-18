package ssafy.aissue.domain.chatting.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ssafy.aissue.domain.chatting.entity.ChatMessage;

import java.time.LocalDateTime;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
