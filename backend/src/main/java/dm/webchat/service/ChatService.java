package dm.webchat.service;

import javax.transaction.Transactional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import dm.webchat.controller.exception.NotFoundException;
import dm.webchat.helper.SecurityUtils;
import dm.webchat.models.ChatMessage;
import dm.webchat.models.User;
import dm.webchat.models.dto.ChatMessageDto;
import dm.webchat.repositories.ChatMessageRepository;
import dm.webchat.repositories.UserRepository;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ChatService {
    private final ChatMessageRepository chatMessageRepository;

    private final UserRepository userRepository;

    @Transactional
    public ChatMessage saveMessage(ChatMessageDto msgDto) {
        String currentUserLogin = SecurityUtils.getCurrentUserLogin();
        User author = userRepository.findByUsername(currentUserLogin)
            .orElseThrow(() ->
                new NotFoundException(String.format("No user with login (%s) found", msgDto.getAuthor().getUsername()))
            );
        return chatMessageRepository.save(ChatMessage.builder()
            .author(author)
            .date(msgDto.getDate())
            .text(msgDto.getText())
            .build()
        );
    }

    public Page<ChatMessage> getChatMessages(Pageable page) {
        return chatMessageRepository.findAll(page);
    }
}
