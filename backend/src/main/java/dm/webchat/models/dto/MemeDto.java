package dm.webchat.models.dto;

import dm.webchat.helper.FileHelper;
import dm.webchat.models.Meme;
import lombok.Data;

@Data
public class MemeDto {
    private String name;
    private ImageDto image;

    public MemeDto(Meme meme) {
        this.name = meme.getName();
        this.image = new ImageDto(meme.getImage(), FileHelper.decompressBytes(meme.getImage().getPicByte()));
    }
}
