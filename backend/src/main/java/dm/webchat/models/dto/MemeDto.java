package dm.webchat.models.dto;

import dm.webchat.models.ImageModel;
import lombok.Data;

@Data
public class MemeDto {
    private String name;

    private String type;

    private byte[] picByte;

    public MemeDto(ImageModel image) {
        this.name = image.getName();
        this.type = image.getType();
        this.picByte = image.getPicByte();
    }

    public MemeDto(ImageModel image, byte[] decompressedBytes) {
        this.name = image.getName();
        this.type = image.getType();
        this.picByte = decompressedBytes;
    }
}
