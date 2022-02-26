package dm.webchat.controller;

import java.util.Map;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static dm.webchat.helper.ResponseHelper.buildSimpleDataResponse;

@RestController
@RequestMapping(path = "/api/main")
public class MainController {
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('USER')")
    @GetMapping("/resource")
    public Map<String,String> home() {
        return buildSimpleDataResponse("Jello World!");
    }

    @GetMapping("/all")
    public Map<String,String> allAccess() {
        return buildSimpleDataResponse("This is public content");
    }
}
