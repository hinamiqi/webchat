package dm.webchat.controller;

import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import dm.webchat.models.dto.ImageDto;
import dm.webchat.service.UserProfileService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping(path = "/api/user-profile")
@RequiredArgsConstructor
public class UserProfileController {
    private final UserProfileService userProfileService;
    
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('USER')")
    @GetMapping("/avatar")
    public ImageDto getAvatar(@RequestParam UUID uuid) {
        return userProfileService.getUserAvatar(uuid);
    }

}
