namespace AttendanceSystem.Application.Students;

public class SetPasswordRequest
{
    public string Token { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}