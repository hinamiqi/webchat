package dm.webchat.service;

import java.security.Principal;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;

import javax.transaction.Transactional;

import org.springframework.data.domain.Pageable;
import org.springframework.beans.factory.annotation.Value;
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

import static dm.webchat.helper.EmptinessHelper.*;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatMessageRepository chatMessageRepository;

    private final UserRepository userRepository;

    private final WebSocketService webSocketService;

    @Value("${app.messageAlterTimeMinutes:1}")
    private int messageAlterTimeMinutes;

    public ChatMessage saveMessage(ChatMessageDto msgDto) throws NotFoundException {
        String currentUserLogin = SecurityUtils
            .getCurrentUserLogin()
            .orElseThrow(() -> new NotFoundException("No current user authorization"));
        User author = userRepository.findByUsername(currentUserLogin)
            .orElseThrow(() ->
                new NotFoundException(
                    String.format("No user with login (%s) found", msgDto.getAuthor().getUsername()))
            );

        if (!author.getUuid().equals(msgDto.getAuthor().getUuid())) {
            throw new BadRequestHttpException("Message author is not the user, who sent the message. Message rejected.");
        }

        ChatMessage savedMessage = addMessageToDb(author, msgDto);
        webSocketService.publishChatMessage(savedMessage, author);
        return savedMessage;
    }

    public ChatMessage saveMessage(ChatMessageDto msgDto, Principal authorPrincipal) throws NotFoundException {
        User author = userRepository.findByUsername(authorPrincipal.getName())
            .orElseThrow(() ->
                new NotFoundException(
                    String.format("No user with login (%s) found", msgDto.getAuthor().getUsername()))
            );
        return addMessageToDb(author, msgDto);
    }

    public ChatMessage editMessage(ChatMessageDto msgDto) throws NotFoundException {
        String currentUserLogin = SecurityUtils
            .getCurrentUserLogin()
            .orElseThrow(() -> new NotFoundException("No current user authorization"));
        User author = userRepository.findByUsername(currentUserLogin)
            .orElseThrow(() ->
                new NotFoundException(
                    String.format("No user with login (%s) found", msgDto.getAuthor().getUsername()))
            );
        ChatMessage savedMessage = editMessageInDb(author, msgDto);
        webSocketService.sendEditMessageEvent(savedMessage);

        return savedMessage;
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
        validateMessageDate(message);
        if (!message.getAuthor().getUuid().equals(author.getUuid())) {
            throw new BadRequestHttpException(String.format("Current user (%s) is not an author of message with id = %s", author.getUsername(), id));
        }

        chatMessageRepository.delete(message);

        webSocketService.sendRemoveMessageEvent(message);
        return message;
    }

    @Transactional
    private ChatMessage addMessageToDb(User author, ChatMessageDto msgDto) {
        validateMessageText(msgDto);

        return chatMessageRepository.save(ChatMessage.builder()
            .author(author)
            .date(msgDto.getDate())
            .text(msgDto.getText())
            .build()
        );
    }

    @Transactional
    private ChatMessage editMessageInDb(User author, ChatMessageDto msgDto) {
        ChatMessage message = chatMessageRepository.findById(msgDto.getId()).orElseThrow(() -> 
            new BadRequestHttpException(String.format("No message with id = %s exists", msgDto))
        );
        validateMessageDate(message);
        validateMessageText(msgDto);
        if (!author.getUuid().equals(message.getAuthor().getUuid())) {
            throw new BadRequestHttpException(String.format(
                "It seems, that You (%s) are not author of that message (%s). You sneaky bustard!",
                author.getUsername(), message.getAuthor().getUsername()));
        }

        message.setOldText(message.getText());
        message.setText(msgDto.getText());
        return chatMessageRepository.save(message);
    }

    private void validateMessageDate(ChatMessage message) {
        ZonedDateTime msgDate = ZonedDateTime.parse(message.getDate());
        ZonedDateTime calcDate = ZonedDateTime.now().minus(messageAlterTimeMinutes, ChronoUnit.MINUTES);
        if (!msgDate.isAfter(calcDate)) {
            throw new BadRequestHttpException(String.format("Message with id = %s is too old and can't be altered", message.getId()));
        }
    }

    private void validateMessageText(ChatMessageDto msgDto) {
        if (isEmpty(msgDto.getText())) {
            throw new BadRequestHttpException("Message text can't be empty");
        }
    }
}
