package dm.webchat.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import dm.webchat.models.dto.MemeDto;
import dm.webchat.service.FileService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping(path = "/api/file")
@RequiredArgsConstructor
public class FileController {
    private final FileService fileService;

    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('USER')")
    @GetMapping("/meme")
    public MemeDto getMeme(@RequestParam String name) {
        return fileService.getMeme(name);
    }

    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('USER')")
    @PostMapping("/meme")
    public MemeDto uploadMeme(@RequestBody MultipartFile file) {
        return fileService.uploadMeme(file);
    }
}
