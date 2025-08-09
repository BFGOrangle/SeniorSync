package orangle.seniorsync.crm.vendorapplication.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import orangle.seniorsync.crm.vendorapplication.dto.VendorApplicationRequest;
import orangle.seniorsync.crm.reminder.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class VendorApplicationService implements IVendorApplicationService {

    private final EmailService emailService;

    @Value("${seniorsync.vendor.application.recipient}")
    private String adminRecipient;

    public void process(VendorApplicationRequest req) {
        String adminSubject = "New Vendor Application: " + req.getBusinessName() + " - " + req.getServiceType();
        String vendorSubject = "Application Received - SeniorSync Vendor Network";

        String adminHtml = buildAdminHtml(req);
        String vendorHtml = buildVendorHtml(req);

        emailService.sendHtmlEmail(adminRecipient, adminSubject, adminHtml);
        emailService.sendHtmlEmail(req.getEmail(), vendorSubject, vendorHtml);
        log.info("Processed vendor application for {} ({})", req.getBusinessName(), req.getEmail());
    }

    private String buildAdminHtml(VendorApplicationRequest r) {
        return "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">" +
                "<h2 style=\"color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;\">New Vendor Application - SeniorSync</h2>" +
                section("#f8fafc", "Business Information", new String[][]{{"Business Name", escape(r.getBusinessName())}, {"Service Type", escape(r.getServiceType())}, {"Business Address", escape(r.getAddress())}}) +
                section("#f0f9ff", "Contact Information", new String[][]{{"Contact Name", escape(r.getContactName())}, {"Email", "<a href=\"mailto:" + escape(r.getEmail()) + "\">" + escape(r.getEmail()) + "</a>"}, {"Phone", "<a href=\"tel:" + escape(r.getPhone()) + "\">" + escape(r.getPhone()) + "</a>"}}) +
                buildServiceDetails(r) +
                "<div style=\"background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;\"><p style=\"margin: 0; font-size: 14px; color: #92400e;\"><strong>Next Steps:</strong> Please review this application and contact the vendor if additional information is needed.</p></div>" +
                "<hr style=\"border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;\">" +
                footer() +
                "</div>";
    }

    private String buildServiceDetails(VendorApplicationRequest r) {
        return "<div style=\"background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;\">" +
                "<h3 style=\"color: #1f2937; margin-top: 0;\">Service Details</h3>" +
                para("<strong>Years of Experience:</strong> " + escape(r.getExperience())) +
                paraBlock("<strong>Service Description:</strong>") +
                codeBlock(r.getDescription(), "#10b981") +
                paraBlock("<strong>Availability:</strong>") +
                codeBlock(r.getAvailability(), "#10b981") +
                "</div>";
    }

    private String buildVendorHtml(VendorApplicationRequest r) {
        return "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">" +
                "<h2 style=\"color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;\">Application Received - SeniorSync</h2>" +
                para("Dear " + escape(r.getContactName()) + ",") +
                para("Thank you for your interest in joining the SeniorSync vendor network! We have successfully received your application for <strong>" + escape(r.getBusinessName()) + "</strong>.") +
                "<div style=\"background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;\"><h3 style=\"color: #1f2937; margin-top: 0;\">What happens next?</h3><ul style=\"color: #374151;\"><li>Our team will review your application within 1-2 business days</li><li>We may contact you for additional information or clarification</li><li>Upon approval, you'll receive onboarding instructions via email</li><li>You'll get access to your vendor dashboard to manage requests</li></ul></div>" +
                "<div style=\"background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;\"><h3 style=\"color: #1f2937; margin-top: 0;\">Application Summary</h3>" +
                para("<strong>Business:</strong> " + escape(r.getBusinessName())) +
                para("<strong>Service Type:</strong> " + escape(r.getServiceType())) +
                para("<strong>Contact Email:</strong> " + escape(r.getEmail())) +
                para("<strong>Phone:</strong> " + escape(r.getPhone())) +
                "</div>" +
                para("If you have any questions about your application, please don't hesitate to contact us at <a href=\"mailto:contactus@seniorsync.sg\">contactus@seniorsync.sg</a>.") +
                para("Best regards,<br><strong>The SeniorSync Team</strong>") +
                "<hr style=\"border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;\">" +
                footer() +
                "</div>";
    }

    private String section(String bg, String title, String[][] kv) {
        StringBuilder sb = new StringBuilder();
        sb.append("<div style=\"background-color: ").append(bg).append("; padding: 20px; border-radius: 8px; margin: 20px 0;\">");
        sb.append("<h3 style=\"color: #1f2937; margin-top: 0;\">").append(title).append("</h3>");
        for (String[] pair : kv) {
            sb.append("<p><strong>").append(escape(pair[0])).append(":</strong> ").append(pair[1]).append("</p>");
        }
        sb.append("</div>");
        return sb.toString();
    }

    private String para(String html) { return "<p>" + html + "</p>"; }
    private String paraBlock(String html) { return "<p style=\"margin-top:12px;\">" + html + "</p>"; }
    private String codeBlock(String text, String color) { return "<p style=\"background-color: white; padding: 15px; border-radius: 4px; border-left: 4px solid " + color + ";\">" + escape(text) + "</p>"; }
    private String footer() { return "<p style=\"font-size: 12px; color: #6b7280; text-align: center;\">SeniorSync - Connecting seniors with trusted care service providers<br>This is an automated confirmation email.</p>"; }
    private String escape(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
