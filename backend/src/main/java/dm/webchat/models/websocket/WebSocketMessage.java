package dm.webchat.models.websocket;

import dm.webchat.models.dto.ChatMessageDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Builder
public class WebSocketMessage {
    ChatMessageDto data;
}
