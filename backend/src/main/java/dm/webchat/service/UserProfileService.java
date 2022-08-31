package dm.webchat.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import dm.webchat.models.User;
import dm.webchat.models.dto.ImageDto;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserProfileService {
    private final FileService fileService;

    private final UserDetailsServiceImpl userDetailsService;

    public ImageDto getUserAvatar(UUID uuid) {
        User user = userDetailsService.loadUserByUuid(uuid);
        if (user.getAvatar() == null) {
            return new ImageDto();
        }
        ImageDto imageDto = fileService.getImage(user.getAvatar().getName());

        return imageDto;
    }
}
