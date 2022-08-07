
package dm.webchat.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;
import java.util.zip.DataFormatException;
import java.util.zip.Deflater;
import java.util.zip.Inflater;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import dm.webchat.controller.exception.InternalException;
import dm.webchat.controller.exception.NotFoundException;
import dm.webchat.models.ImageModel;
import dm.webchat.models.dto.MemeDto;
import dm.webchat.repositories.ImageRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FileService {
    private final ImageRepository imageRepository;

    public MemeDto getMeme(String name) {
        ImageModel image = imageRepository.findByName(name).orElseThrow(() -> new NotFoundException("No image with name = " + name));
        return new MemeDto(image, decompressBytes(image.getPicByte()));
    }

    public List<MemeDto> getAllMemes() {
        List<ImageModel> images = imageRepository.findAll();
        return images.stream().map(image -> new MemeDto(image, decompressBytes(image.getPicByte()))).collect(Collectors.toList());
    }

    public MemeDto uploadMeme(MultipartFile file) {
        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new InternalException("Something wrong with this file");
        }
        
        ImageModel newImage = imageRepository.save(ImageModel.builder()
            .name(file.getOriginalFilename())
            .type(file.getContentType())
            .picByte(compressBytes(bytes))
            .build());
        return new MemeDto(newImage);
    }

    private byte[] compressBytes(byte[] data) {
        Deflater deflater = new Deflater();
        deflater.setInput(data);
        deflater.finish();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream(data.length);
        byte[] buffer = new byte[1024];
        
        while (!deflater.finished()) {
            int count = deflater.deflate(buffer);
            outputStream.write(buffer, 0, count);
        }

        try {
            outputStream.close();
        } catch (IOException e) {
                }
        System.out.println("Compressed Image Byte Size - " + outputStream.toByteArray().length);
        return outputStream.toByteArray();
    }

    private byte[] decompressBytes(byte[] data) {
        Inflater inflater = new Inflater();
        inflater.setInput(data);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream(data.length);
        byte[] buffer = new byte[1024];

        try {
            while (!inflater.finished()) {
                int count = inflater.inflate(buffer);
                outputStream.write(buffer, 0, count);
            }
            outputStream.close();

        } catch (IOException ioe) {

        } catch (DataFormatException e) {

        }

        return outputStream.toByteArray();
    }
}
