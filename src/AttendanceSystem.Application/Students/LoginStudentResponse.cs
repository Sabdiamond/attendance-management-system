namespace AttendanceSystem.Application.Students;

public class LoginStudentResponse
{
    public Guid Id { get; set; }
    public string MatricNumber { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int Level { get; set; }
    public string Token { get; set; } = string.Empty;
}