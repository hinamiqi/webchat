package dm.webchat.service;

import java.util.HashMap;

import javax.annotation.PostConstruct;

import org.springframework.stereotype.Service;

import dm.webchat.constants.LoremIpsumConst;

@Service
public class MainService {
    private static final HashMap<String,String> staticPageContent = new HashMap<>();

    // FIXME: get static page text from database
    @PostConstruct
    public void init() {
        staticPageContent.put("info", LoremIpsumConst.text);
    }

    public String getStaticPageContent(String pageId) {
        return staticPageContent.get(pageId);
    }
}
