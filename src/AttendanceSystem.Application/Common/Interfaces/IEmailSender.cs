namespace AttendanceSystem.Application.Common.Interfaces;

public interface IEmailSender
{
    Task SendPasswordSetupEmailAsync(string toEmail, string studentName, string setupLink);
}