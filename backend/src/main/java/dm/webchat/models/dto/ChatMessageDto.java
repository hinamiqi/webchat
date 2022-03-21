package dm.webchat.models.dto;

import java.io.Serializable;

import dm.webchat.models.ChatMessage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto implements Serializable {
    private String authorName;
    private String date;
    private String text;

    public ChatMessageDto(ChatMessage chatMessage) {
        this.authorName = chatMessage.getAuthor().getUsername();
        this.date = chatMessage.getDate();
        this.text = chatMessage.getText();
    }
}
