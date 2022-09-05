package dm.webchat.controller;

import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

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

    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('USER')")
    @PostMapping("/avatar")
    public ImageDto setAvatar(@RequestBody MultipartFile file) {
        return userProfileService.setUserAvatar(file);
    }

}
