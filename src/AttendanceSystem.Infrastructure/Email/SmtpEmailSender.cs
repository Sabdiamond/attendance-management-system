using AttendanceSystem.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;

namespace AttendanceSystem.Infrastructure.Email;

public class SmtpEmailSender : IEmailSender
{
    private readonly IConfiguration _configuration;

    public SmtpEmailSender(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendPasswordSetupEmailAsync(string toEmail, string studentName, string setupLink)
    {
        var smtpHost = _configuration["Email:SmtpHost"]
            ?? throw new InvalidOperationException("Email:SmtpHost is not configured.");
        var smtpPort = int.Parse(_configuration["Email:SmtpPort"]
            ?? throw new InvalidOperationException("Email:SmtpPort is not configured."));
        var senderEmail = _configuration["Email:SenderEmail"]
            ?? throw new InvalidOperationException("Email:SenderEmail is not configured.");
        var senderPassword = _configuration["Email:SenderPassword"]
            ?? throw new InvalidOperationException("Email:SenderPassword is not configured.");
        var senderName = _configuration["Email:SenderName"] ?? "Attendance System";

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(senderName, senderEmail));
        message.To.Add(new MailboxAddress(studentName, toEmail));
        message.Subject = $"Set up your account, {studentName}";

        message.Body = new TextPart("html")
        {
            Text = $@"
                <p>Hi {studentName},</p>
                <p>An account has been created for you on the Attendance Management System.</p>
                <p>Click the link below to set your password:</p>
                <p><a href=""{setupLink}"">{setupLink}</a></p>
                <p>If you did not expect this email, you can safely ignore it.</p>
            "
        };

        using var client = new SmtpClient();
        await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(senderEmail, senderPassword);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}