package dm.webchat.service;

import javax.transaction.Transactional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import dm.webchat.constants.HttpExceptionCodes;
import dm.webchat.controller.exception.CustomHttpException;
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
        User author = userRepository.findByUsername(msgDto.getAuthorName())
            .orElseThrow(() ->
                new CustomHttpException(HttpExceptionCodes.BAD_REQUEST,
                    String.format("No such user (%s) found", msgDto.getAuthorName()),
                    HttpStatus.BAD_REQUEST)
            );
        return chatMessageRepository.save(ChatMessage.builder()
            .author(author)
            .date(msgDto.getDate())
            .text(msgDto.getText())
            .build()
        );
    }
}
