package dm.webchat.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import dm.webchat.models.ChatMessage;
import dm.webchat.models.dto.ChatMessageDto;
import dm.webchat.models.websocket.WebSocketGlobalEvent;
import dm.webchat.models.websocket.WebSocketGlobalEventTypeEnum;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class WebSocketService {
    @Autowired
    private SimpMessagingTemplate messageSender;

    public void sendRemoveMessageEvent(ChatMessage message) {
        WebSocketGlobalEvent event = WebSocketGlobalEvent.builder()
            .type(WebSocketGlobalEventTypeEnum.MESSAGE_DELETED)
            .data(new ChatMessageDto(message))
            .build();

        messageSender.convertAndSend("/chat/new-event", event);
    }
}
