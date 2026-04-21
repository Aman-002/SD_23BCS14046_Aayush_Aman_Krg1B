package com.grocery.order.service;

import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class OrderEmailService {

    @Value("${sendgrid.api.key}")
    private String apiKey;

    @Value("${sendgrid.from.email}")
    private String fromEmail;

    public void sendOrderConfirmation(String to, String name, String orderId, double totalAmount) {
        try {
            Email from = new Email(fromEmail);
            String subject = "Order Placed Successfully - " + orderId;
            Email toEmail = new Email(to);

            String html = "<!DOCTYPE html>" +
                    "<html>" +
                    "<body style='font-family: Arial, sans-serif; background-color:#f4f6f8; padding:20px;'>" +
                    "<div style='max-width:500px; margin:auto; background:#ffffff; border-radius:10px; padding:30px; text-align:center; box-shadow:0 4px 10px rgba(0,0,0,0.1);'>" +
                    "<h2 style='color:#333;'>🛒 Order Confirmed!</h2>" +
                    "<p style='color:#555; font-size:16px;'>Hi <b>" + name + "</b>,</p>" +
                    "<p style='color:#555; font-size:15px;'>Your order has been successfully placed.</p>" +
                    "<div style='margin:20px 0;'>" +
                    "<span style='display:block; font-size:18px; color:#333;'>Order ID: <b>" + orderId + "</b></span>" +
                    "<span style='display:block; font-size:18px; color:#4CAF50; margin-top:10px;'>Total: <b>₹" + String.format("%.2f", totalAmount) + "</b></span>" +
                    "</div>" +
                    "<p style='color:#777; font-size:14px;'>Thank you for shopping with us!</p>" +
                    "<hr style='margin:20px 0; border:none; border-top:1px solid #eee;'/>" +
                    "</div>" +
                    "</body>" +
                    "</html>";

            Content content = new Content("text/html", html);
            Mail mail = new Mail(from, subject, toEmail, content);

            SendGrid sg = new SendGrid(apiKey);
            Request request = new Request();

            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = sg.api(request);
            System.out.println("SendGrid Response (Order): " + response.getStatusCode());

        } catch (Exception e) {
            System.err.println("Failed to send order email: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
