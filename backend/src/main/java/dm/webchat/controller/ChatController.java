package dm.webchat.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dm.webchat.models.ChatMessage;
import dm.webchat.models.dto.ChatMessageDto;
import dm.webchat.service.ChatService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping(path = "/api/chat")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;

    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('USER')")
    @PostMapping("")
    public ChatMessageDto postChatMessage(@RequestBody ChatMessageDto messageDto) {
        ChatMessage savedMessage = chatService.saveMessage(messageDto);
        return ChatMessageDto.builder()
            .authorName(savedMessage.getAuthor().getUsername())
            .date(savedMessage.getDate())
            .text(savedMessage.getText())
            .build();
    }
}