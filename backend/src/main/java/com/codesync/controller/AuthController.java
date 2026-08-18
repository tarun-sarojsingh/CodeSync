package com.codesync.controller;

import com.codesync.model.User;
import com.codesync.repository.UserRepository;
import com.codesync.security.JwtUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;

    public AuthController(UserRepository userRepository, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody Map<String, String> loginRequest) {
        String username = loginRequest.get("username");
        if (username == null || username.isBlank()) {
            return ResponseEntity.badRequest().body("Username is required");
        }

        // Mock login: Create user if not exists
        User user = userRepository.findByUsername(username)
                .orElseGet(() -> {
                    User newUser = new User(UUID.randomUUID().toString(), username, "mock-hash", Instant.now());
                    return userRepository.save(newUser);
                });

        String jwt = jwtUtils.generateJwtToken(user.getUsername(), user.getId());

        return ResponseEntity.ok(Map.of(
                "token", jwt,
                "userId", user.getId(),
                "username", user.getUsername()
        ));
    }
}
