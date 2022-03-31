package dm.webchat.models.websocket;

import dm.webchat.models.dto.ChatMessageDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Getter
public class WebSocketMessage {
    String token;
    ChatMessageDto data;
}
