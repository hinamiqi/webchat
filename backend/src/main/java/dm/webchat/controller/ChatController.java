package dm.webchat.controller;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dm.webchat.models.ChatMessage;
import dm.webchat.models.dto.ChatMessageDto;
import dm.webchat.service.ChatService;
import dm.webchat.service.PrivateMessageService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping(path = "/api/chat")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;

    private final PrivateMessageService privateMessageService;

    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('USER')")
    @PostMapping("")
    public ChatMessageDto postChatMessage(@RequestBody ChatMessageDto messageDto) {
        ChatMessage savedMessage = chatService.saveMessage(messageDto);
        return new ChatMessageDto(savedMessage);
    }

    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('USER')")
    @GetMapping("")
    public List<ChatMessageDto> getLastChatMessages(Pageable pageable) {
        Page<ChatMessage> messages = chatService.getChatMessages(pageable);
        return messages.stream()
            .map(ChatMessageDto::new)
            .collect(Collectors.toList());
    }

    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('USER')")
    @PostMapping("/to-date")
    public List<ChatMessageDto> getMessagesToDate(Pageable pageable, @RequestBody ZonedDateTime date) {
        Page<ChatMessage> messages = chatService.getChatMessagesToDate(pageable, date);
        return messages.stream()
            .map(ChatMessageDto::new)
            .collect(Collectors.toList());
    }

    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('USER')")
    @PostMapping("/to-message")
    public List<ChatMessageDto> getMessagesToMessage(Pageable pageable, @RequestBody Long messageId) {
        List<ChatMessage> messages = chatService.getChatMessagesToMessage(messageId);
        return messages.stream()
            .map(ChatMessageDto::new)
            .collect(Collectors.toList());
    }

    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('USER')")
    @PostMapping("/private/{userId}")
    public void postPrivateMessageToUser(@RequestBody ChatMessageDto messageDto, @PathVariable UUID userId) {
        privateMessageService.sendPrivateMessage(messageDto, userId);
    }

    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('USER')")
    @DeleteMapping("/{id}")
    public Boolean deleteChatMessage(@PathVariable Long id) {
        chatService.deleteMessage(id);
        return true;
    }

    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('USER')")
    @PostMapping("/{id}")
    public ChatMessageDto editChatMessage(@RequestBody ChatMessageDto messageDto) {
        ChatMessage savedMessage = chatService.editMessage(messageDto);
        return new ChatMessageDto(savedMessage);
    }
}