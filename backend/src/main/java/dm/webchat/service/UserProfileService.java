package dm.webchat.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import dm.webchat.models.ImageModel;
import dm.webchat.models.User;
import dm.webchat.models.dto.ImageDto;
import dm.webchat.repositories.ImageRepository;
import dm.webchat.repositories.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserProfileService {
    private final FileService fileService;

    private final UserDetailsServiceImpl userDetailsService;

    private final UserAuthService userAuthService;

    private final ImageRepository imageRepository;

    private final UserRepository userRepository;

    public ImageDto getUserAvatar(UUID uuid) {
        User user = userDetailsService.loadUserByUuid(uuid);
        if (user.getAvatar() == null) {
            return new ImageDto();
        }

        return ImageDto.builder().id(user.getAvatar().getId()).build();
    }

    @Transactional
    public ImageDto setUserAvatar(MultipartFile file) {
        User user = userAuthService.getCurrentUser();
        ImageDto avatar = fileService.uploadImage(file);
        ImageModel imageModel = imageRepository.getById(avatar.getId());
        user.setAvatar(imageModel);
        userRepository.save(user);
        return avatar;
    }
}
