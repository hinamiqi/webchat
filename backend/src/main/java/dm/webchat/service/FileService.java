
package dm.webchat.service;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import dm.webchat.controller.exception.BadRequestHttpException;
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

    public ImageDto getImage(Long id) {
        ImageModel image = imageRepository.findById(id).orElseThrow(() ->
            new NotFoundException(String.format("No image with id %s found", id))
        );
        return new ImageDto(image, FileHelper.decompressBytes(image.getPicByte()));
    }

    @Transactional
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

    public MemeDto getMeme(String name) {
        Meme meme = memeRepository.findByName(name).orElseThrow(() -> new NotFoundException("No meme with name = " + name));
        return new MemeDto(meme);
    }

    public List<MemeDto> getAllMemes() {
        List<Meme> memes = memeRepository.findAll();
        return memes.stream().map(MemeDto::new).collect(Collectors.toList());
    }

    public Map<String, Long> getAllMemeNames() {
        Map<String, Long> memeMap = new HashMap<String, Long>();
        List<Meme> memes = memeRepository.findAll();
        memes.stream().forEach((meme) -> {
            memeMap.put(meme.getName(), meme.getImage().getId());
        });
        return memeMap;
    }

    @Transactional
    public MemeDto uploadMeme(MultipartFile file, String name) {
        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new InternalException("Something wrong with this file");
        }

        memeRepository.findByName(name).stream().findFirst().ifPresent(i -> {  throw new BadRequestHttpException("Meme with name " + name + " alredy present"); });

        ImageModel newImage = imageRepository.save(ImageModel.builder()
            .name(file.getOriginalFilename())
            .type(file.getContentType())
            .picByte(FileHelper.compressBytes(bytes))
            .build());

        Meme meme = memeRepository.save(Meme.builder().uuid(UUID.randomUUID()).image(newImage).name(name).build());

        return new MemeDto(meme);
    }
}
