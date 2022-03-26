package dm.webchat.models.dto;

import java.io.Serializable;

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
    private AuthorDto author;
    private String date;
    private String text;

    public ChatMessageDto(ChatMessage chatMessage) {
        this.author = new AuthorDto(chatMessage.getAuthor());
        this.date = chatMessage.getDate();
        this.text = chatMessage.getText();
    }
}
