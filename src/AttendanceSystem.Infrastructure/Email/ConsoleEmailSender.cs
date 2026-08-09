using AttendanceSystem.Application.Common.Interfaces;

namespace AttendanceSystem.Infrastructure.Email;

public class ConsoleEmailSender : IEmailSender
{
    public Task SendPasswordSetupEmailAsync(string toEmail, string studentName, string setupLink)
    {
        Console.WriteLine($"[EMAIL] To: {toEmail}");
        Console.WriteLine($"[EMAIL] Subject: Set up your account, {studentName}");
        Console.WriteLine($"[EMAIL] Link: {setupLink}");
        return Task.CompletedTask;
    }
}