namespace AttendanceSystem.Application.Students;

public class LoginStudentRequest
{
    public string MatricNumber { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}