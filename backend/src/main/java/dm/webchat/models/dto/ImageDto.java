package dm.webchat.models.dto;

import dm.webchat.models.ImageModel;
import lombok.Data;

@Data
public class ImageDto {
    private String name;

    private String type;

    private byte[] picByte;

    public ImageDto() {}

    public ImageDto(ImageModel image) {
        this.name = image.getName();
        this.type = image.getType();
        this.picByte = image.getPicByte();
    }

    public ImageDto(ImageModel image, byte[] decompressedBytes) {
        this.name = image.getName();
        this.type = image.getType();
        this.picByte = decompressedBytes;
    }
}
