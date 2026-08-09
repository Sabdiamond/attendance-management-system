namespace AttendanceSystem.Application.Students;

public class SetPasswordResponse
{
    public Guid Id { get; set; }
    public string MatricNumber { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
}