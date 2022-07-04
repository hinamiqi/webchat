package dm.webchat.models.dto;

import java.io.Serializable;
import java.time.ZonedDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

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
    @JsonProperty("author")
    private UserDto author;
    private ZonedDateTime date;
    private String text;
    private String oldText;
    private Long id;

    public ChatMessageDto(ChatMessage chatMessage) {
        this.author = new UserDto(chatMessage.getAuthor());
        this.date = chatMessage.getDate();
        this.text = chatMessage.getText();
        this.oldText = chatMessage.getOldText();
        this.id = chatMessage.getId();
    }
}
