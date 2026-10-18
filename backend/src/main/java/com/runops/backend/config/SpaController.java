package com.runops.backend.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping({"/login", "/register", "/dashboard"})
    public String forwardToAngular() {
        return "forward:/index.html";
    }
}
