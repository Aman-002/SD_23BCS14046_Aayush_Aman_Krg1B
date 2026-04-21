package com.grocery.core.controller;

import com.grocery.core.dto.ApiResponse;
import com.grocery.core.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    @Autowired private FeedbackService feedbackService;

    /** POST /api/feedback — customer submits feedback */
    @PostMapping
    public ResponseEntity<ApiResponse> submit(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(feedbackService.submit(body));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    /** GET /api/feedback/all — admin views all feedback */
    @GetMapping("/all")
    public ResponseEntity<ApiResponse> getAll() {
        try {
            return ResponseEntity.ok(feedbackService.getAll());
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}
