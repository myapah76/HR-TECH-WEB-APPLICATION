package sba301.hrtech.chat.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sba301.hrtech.chat.entities.ChatSession;
import sba301.hrtech.identity.entities.User;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, UUID> {
    List<ChatSession> findByUserOrderByUpdatedAtDesc(User user);
}
