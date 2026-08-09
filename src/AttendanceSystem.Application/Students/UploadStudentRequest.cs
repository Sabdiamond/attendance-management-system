namespace AttendanceSystem.Application.Students;

public class UploadStudentRequest
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string MatricNumber { get; set; } = string.Empty;
    public int Level { get; set; }
}