package dm.webchat.models.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Builder
public class WebSocketGlobalEvent {
    Object data;
    WebSocketGlobalEventTypeEnum type;
}
