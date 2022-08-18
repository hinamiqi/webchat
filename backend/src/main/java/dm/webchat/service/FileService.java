
package dm.webchat.service;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import dm.webchat.controller.exception.InternalException;
import dm.webchat.controller.exception.NotFoundException;
import dm.webchat.models.ImageModel;
import dm.webchat.models.Meme;
import dm.webchat.models.dto.ImageDto;
import dm.webchat.models.dto.MemeDto;
import dm.webchat.repositories.ImageRepository;
import dm.webchat.repositories.MemeRepository;
import lombok.RequiredArgsConstructor;

import dm.webchat.helper.FileHelper;

@Service
@RequiredArgsConstructor
public class FileService {
    private final ImageRepository imageRepository;

    private final MemeRepository memeRepository;

    public ImageDto getImage(String name) {
        ImageModel image = imageRepository.findByName(name).orElseThrow(() -> new NotFoundException("No image with name = " + name));
        return new ImageDto(image, FileHelper.decompressBytes(image.getPicByte()));
    }

    public List<ImageDto> getAllImages() {
        List<ImageModel> images = imageRepository.findAll();
        return images.stream().map(image -> new ImageDto(image, FileHelper.decompressBytes(image.getPicByte()))).collect(Collectors.toList());
    }

    public ImageDto uploadImage(MultipartFile file) {
        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new InternalException("Something wrong with this file");
        }
        
        ImageModel newImage = imageRepository.save(ImageModel.builder()
            .name(file.getOriginalFilename())
            .type(file.getContentType())
            .picByte(FileHelper.compressBytes(bytes))
            .build());
        return new ImageDto(newImage);
    }

    public List<MemeDto> getAllMemes() {
        List<Meme> memes = memeRepository.findAll();
        return memes.stream().map(MemeDto::new).collect(Collectors.toList());
    }

    public MemeDto getMeme(String name) {
        Meme meme = memeRepository.findByName(name).orElseThrow(() -> new NotFoundException("No meme with name = " + name));
        return new MemeDto(meme);
    }
}
