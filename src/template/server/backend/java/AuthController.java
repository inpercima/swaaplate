package {{PROJECT.PACKAGEPATH}}.web;

import java.io.IOException;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author {{PROJECT.AUTHOR}}
 */
@RestController
public class AuthController {

    @PostMapping(value = "/auth")
    public String auth(@RequestBody final String body) throws IOException {
        return "";
    }

}
