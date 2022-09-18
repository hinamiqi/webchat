package dm.webchat.models;

import java.time.ZonedDateTime;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "chat_message")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {
    @Id
    @Column(name = "id")
    @SequenceGenerator(name="chat_message_sequence",sequenceName="chat_message_sequence", allocationSize=1)
    @GeneratedValue(strategy=GenerationType.SEQUENCE,generator="chat_message_sequence")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "author_id")
    private User author;

    @ManyToOne
    @JoinColumn(name = "receiver_id")
    private User receiver;

    @Column
    private ZonedDateTime date;

    @Column
    private String text;

    @Column(name = "old_text")
    private String oldText;

    @OneToMany
    @JoinTable(name = "message_reply_link",
               joinColumns = @JoinColumn(name = "message_id"),
               inverseJoinColumns = @JoinColumn(name = "reply_message_id"))
    private List<ChatMessage> repliedMessages;

    @OneToOne
    @JoinTable(name = "message_meme_link",
               joinColumns = @JoinColumn(name = "message_id"),
               inverseJoinColumns = @JoinColumn(name = "meme_uuid"))
    private Meme meme;
}
