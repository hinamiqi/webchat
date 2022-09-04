package dm.webchat.models.dto;

import dm.webchat.models.ImageModel;
import lombok.Data;

@Data
public class ImageDto {
    private Long id;

    private String name;

    private String type;

    private byte[] picByte;

    public ImageDto() {}

    public ImageDto(ImageModel image) {
        this.id = image.getId();
        this.name = image.getName();
        this.type = image.getType();
        this.picByte = image.getPicByte();
    }

    public ImageDto(ImageModel image, byte[] decompressedBytes) {
        this.id = image.getId();
        this.name = image.getName();
        this.type = image.getType();
        this.picByte = decompressedBytes;
    }
}
