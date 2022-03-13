package dm.webchat.controller;

import java.util.Map;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dm.webchat.service.MainService;
import lombok.RequiredArgsConstructor;

import static dm.webchat.helper.ResponseHelper.buildSimpleDataResponse;

@RestController
@RequestMapping(path = "/api/main")
@RequiredArgsConstructor
public class MainController {
    private final MainService mainService;

    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('USER')")
    @GetMapping("/{pageId}-page")
    public Map<String,String> home(@PathVariable String pageId) {
        return buildSimpleDataResponse(mainService.getStaticPageContent(pageId));
    }

    @GetMapping("/all")
    public Map<String,String> allAccess() {
        return buildSimpleDataResponse("This is public content");
    }
}
