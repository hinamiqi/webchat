package dm.webchat.controller;

import java.util.List;
import java.util.Map;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import dm.webchat.models.dto.ImageDto;
import dm.webchat.models.dto.MemeDto;
import dm.webchat.service.FileService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping(path = "/api/file")
@RequiredArgsConstructor
public class FileController {
    private final FileService fileService;

    // Not used
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('USER')")
    @GetMapping("/image")
    public ImageDto getImage(@RequestParam Long id) {
        return fileService.getImage(id);
    }

    // Not used
    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/image")
    public ImageDto uploadImage(@RequestBody MultipartFile file) {
        return fileService.uploadImage(file);
    }

    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('USER')")
    @GetMapping("/meme/get-all")
    public List<MemeDto> getAllMemes() {
        return fileService.getAllMemes();
    }

    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('USER')")
    @GetMapping("/meme/get-all-names")
    public Map<String, Long> getAllMemeNames() {
        return fileService.getAllMemeNames();
    }

    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('USER')")
    @GetMapping("/meme")
    public MemeDto getMeme(@RequestParam String name) {
        return fileService.getMeme(name);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/meme")
    public MemeDto uploadMeme(@RequestBody MultipartFile file) {
        return fileService.uploadMeme(file, file.getOriginalFilename());
    }
}
