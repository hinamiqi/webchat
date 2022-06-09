package dm.webchat.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import dm.webchat.models.ChatMessage;
import dm.webchat.models.User;
import dm.webchat.models.dto.ChatMessageDto;
import dm.webchat.models.dto.UserDto;
import dm.webchat.models.websocket.WebSocketGlobalEvent;
import dm.webchat.models.websocket.WebSocketGlobalEventTypeEnum;
import dm.webchat.models.websocket.WebSocketMessage;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class WebSocketService {
    @Autowired
    private SimpMessagingTemplate messageSender;

    public void publishChatMessage(ChatMessage message, User author) {
        sendUserActivityEvent(author);

        messageSender.convertAndSend("/chat/new-message",
            WebSocketMessage.builder().data(new ChatMessageDto(message)).build());
    }

    public void sendPrivateMessage(ChatMessageDto messageDto, User targetUser) {
        messageSender.convertAndSend("/private/" + targetUser.getUuid().toString(),
           WebSocketMessage.builder().data(messageDto).build());
    }

    public void sendRemoveMessageEvent(ChatMessage message) {
        WebSocketGlobalEvent event = WebSocketGlobalEvent.builder()
            .type(WebSocketGlobalEventTypeEnum.MESSAGE_DELETED)
            .data(new ChatMessageDto(message))
            .build();

        messageSender.convertAndSend("/chat/new-event", event);
    }

    public void sendEditMessageEvent(ChatMessage message) {
        WebSocketGlobalEvent event = WebSocketGlobalEvent.builder()
            .type(WebSocketGlobalEventTypeEnum.MESSAGE_EDITED)
            .data(new ChatMessageDto(message))
            .build();

        messageSender.convertAndSend("/chat/new-event", event);
    }


    public void sendUserActivityEvent(User user) {
        WebSocketGlobalEvent event = WebSocketGlobalEvent.builder()
            .type(WebSocketGlobalEventTypeEnum.USER_ACTIVITY)
            .data(new UserDto(user))
            .build();

        messageSender.convertAndSend("/chat/new-event", event);
    }
}
