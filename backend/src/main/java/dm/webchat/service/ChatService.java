package dm.webchat.service;

import java.security.Principal;

import javax.transaction.Transactional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import dm.webchat.controller.exception.BadRequestHttpException;
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

    private final WebSocketService webSocketService;

    public ChatMessage saveMessage(ChatMessageDto msgDto) throws NotFoundException {
        String currentUserLogin = SecurityUtils
            .getCurrentUserLogin()
            .orElseThrow(() -> new NotFoundException("No current user authorization"));
        User author = userRepository.findByUsername(currentUserLogin)
            .orElseThrow(() ->
                new NotFoundException(
                    String.format("No user with login (%s) found", msgDto.getAuthor().getUsername()))
            );
        return saveMessageToDb(author, msgDto);
    }

    public ChatMessage saveMessage(ChatMessageDto msgDto, Principal user) throws NotFoundException {
        User author = userRepository.findByUsername(user.getName())
            .orElseThrow(() ->
                new NotFoundException(
                    String.format("No user with login (%s) found", msgDto.getAuthor().getUsername()))
            );
        return saveMessageToDb(author, msgDto);
    }

    public Page<ChatMessage> getChatMessages(Pageable page) {
        return chatMessageRepository.findAll(page);
    }

    public ChatMessage deleteMessage(Long id) {
        String currentUserLogin = SecurityUtils
            .getCurrentUserLogin()
            .orElseThrow(() -> new NotFoundException("No current user authorization"));
        User author = userRepository.findByUsername(currentUserLogin)
            .orElseThrow(() ->
                new NotFoundException(
                    String.format("No user with login (%s) found", currentUserLogin))
            );

        ChatMessage message = chatMessageRepository.getById(id);
        if (!message.getAuthor().getUuid().equals(author.getUuid())) {
            throw new BadRequestHttpException(String.format("Current user (%s) is not an author of message with id = %s", author.getUsername(), id));
        }

        chatMessageRepository.delete(message);

        webSocketService.sendRemoveMessageEvent(message);
        return message;
    }

    @Transactional
    private ChatMessage saveMessageToDb(User author, ChatMessageDto msgDto) {
        return chatMessageRepository.save(ChatMessage.builder()
            .author(author)
            .date(msgDto.getDate())
            .text(msgDto.getText())
            .build()
        );
    }
}
