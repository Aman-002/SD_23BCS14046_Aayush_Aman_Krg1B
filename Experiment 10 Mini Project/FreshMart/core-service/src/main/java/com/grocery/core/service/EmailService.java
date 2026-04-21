package com.grocery.core.service;

import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Value("${sendgrid.api.key}")
    private String apiKey;

    @Value("${sendgrid.from.email}")
    private String fromEmail;

    public void sendOtpEmail(String to, String name, String otp) {
        try {
            Email from = new Email(fromEmail);
            String subject = "Your OTP Code";
            Email toEmail = new Email(to);

            Content content = new Content("text/html",
                    "<!DOCTYPE html>" +
                            "<html>" +
                            "<body style='font-family: Arial, sans-serif; background-color:#f4f6f8; padding:20px;'>" +

                            "<div style='max-width:500px; margin:auto; background:#ffffff; border-radius:10px; padding:30px; text-align:center; box-shadow:0 4px 10px rgba(0,0,0,0.1);'>" +

                            "<h2 style='color:#333;'>🔐 OTP Verification</h2>" +

                            "<p style='color:#555; font-size:16px;'>Hi <b>" + name + "</b>,</p>" +

                            "<p style='color:#555; font-size:15px;'>Use the OTP below to complete your verification:</p>" +

                            "<div style='margin:20px 0;'>" +
                            "<span style='display:inline-block; font-size:28px; letter-spacing:5px; font-weight:bold; color:#ffffff; background:#4CAF50; padding:12px 24px; border-radius:8px;'>" +
                            otp +
                            "</span>" +
                            "</div>" +

                            "<p style='color:#777; font-size:13px;'>This OTP is valid for 5 minutes.</p>" +

                            "<hr style='margin:20px 0; border:none; border-top:1px solid #eee;'/>" +

                            "<p style='color:#aaa; font-size:12px;'>If you didn’t request this, you can safely ignore this email.</p>" +

                            "</div>" +

                            "</body>" +
                            "</html>"
            );
            Mail mail = new Mail(from, subject, toEmail, content);

            SendGrid sg = new SendGrid(apiKey);
            Request request = new Request();

            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = sg.api(request);

            System.out.println(response.getStatusCode());

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}


















/*package com.grocery.core.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendOtpEmail(String toEmail, String name, String otp) {
        // Always print to console — useful for testing without SMTP
        System.out.println("\n==================================================");
        System.out.println("  OTP for: " + toEmail + " (" + name + ")");
        System.out.println("  Your OTP is: " + otp + "  (valid 5 min)");
        System.out.println("==================================================\n");

        // Skip actual email if placeholder credentials are still set
        if (fromEmail == null || fromEmail.contains("YOUR_GMAIL")
                || fromEmail.isBlank()) {
            System.out.println("  [EmailService] SMTP not configured — OTP printed above.");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("OTP Verification - Grocery App");
            String content = "<h3>Hello " + name + ",</h3>"
                    + "<p>Your OTP is: <b>" + otp + "</b></p>"
                    + "<p>This OTP is valid for 5 minutes.</p>";
            helper.setText(content, true);
            mailSender.send(message);
            System.out.println("  [EmailService] Email sent to " + toEmail);
        } catch (Exception e) {
            System.out.println("  [EmailService] Email failed (" + e.getMessage()
                + "). Use the OTP printed above.");
        }
    }
}
*/