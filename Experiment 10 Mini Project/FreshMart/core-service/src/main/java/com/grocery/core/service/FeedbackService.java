package com.grocery.core.service;

import com.grocery.core.dto.ApiResponse;
import com.grocery.core.model.Feedback;
import com.grocery.core.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class FeedbackService {

    @Autowired private FeedbackRepository feedbackRepository;

    public ApiResponse submit(Map<String, Object> body) {
        String name    = (String) body.get("customerName");
        String email   = (String) body.get("customerEmail");
        String message = (String) body.get("message");
        Integer rating = (Integer) body.get("rating");

        if (message == null || message.isBlank())
            throw new RuntimeException("Feedback message cannot be empty.");
        if (rating == null || rating < 1 || rating > 5)
            throw new RuntimeException("Rating must be between 1 and 5.");

        Feedback fb = new Feedback();
        fb.setCustomerName(name);
        fb.setCustomerEmail(email);
        fb.setMessage(message);
        fb.setRating(rating);
        feedbackRepository.save(fb);

        return new ApiResponse(true, "Thank you for your feedback!", null);
    }

    public ApiResponse getAll() {
        return new ApiResponse(true, "All feedback",
                feedbackRepository.findAllByOrderByCreatedAtDesc());
    }
}
