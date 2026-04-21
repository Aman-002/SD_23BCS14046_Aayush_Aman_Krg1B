package com.grocery.core.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private static final int EXPIRE_MINS = 5;
    
    // In-memory cache: email -> OtpRecord
    private final ConcurrentHashMap<String, OtpRecord> otpCache = new ConcurrentHashMap<>();

    private static class OtpRecord {
        String otp;
        LocalDateTime expiration;
        OtpRecord(String otp, LocalDateTime expiration) {
            this.otp = otp;
            this.expiration = expiration;
        }
    }

    public String generateOtp(String email) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        otpCache.put(email, new OtpRecord(otp, LocalDateTime.now().plusMinutes(EXPIRE_MINS)));
        return otp;
    }

    public boolean validateOtp(String email, String inputOtp) {
        if (!otpCache.containsKey(email)) return false;
        
        OtpRecord record = otpCache.get(email);
        
        if (record.expiration.isBefore(LocalDateTime.now())) {
            otpCache.remove(email);
            return false;
        }
        
        boolean isValid = record.otp.equals(inputOtp);
        if (isValid) {
            otpCache.remove(email); // Clear once successfully validated
        }
        return isValid;
    }
}
