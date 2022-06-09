package dm.webchat.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import dm.webchat.controller.exception.BadRequestHttpException;
import dm.webchat.controller.exception.NotFoundException;
import dm.webchat.helper.SecurityUtils;
import dm.webchat.models.User;
import dm.webchat.models.dto.ChatMessageDto;
import dm.webchat.repositories.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PrivateMessageService {
    private final UserRepository userRepository;

    private final WebSocketService webSocketService;

    public void sendPrivateMessage(ChatMessageDto msgDto, UUID userId) throws NotFoundException {
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

        User targetUser = userRepository.findByUuid(userId)
            .orElseThrow(() -> new NotFoundException("No user with uuid " + userId));


        webSocketService.sendPrivateMessage(msgDto, targetUser);
    }
}
