namespace AttendanceSystem.Application.CourseRegistrations;

public class RegisterStudentForCourseResponse
{
    public Guid Id { get; set; }
    public Guid StudentId { get; set; }
    public string StudentFullName { get; set; } = string.Empty;
    public Guid CourseId { get; set; }
    public string CourseCode { get; set; } = string.Empty;
    public DateTime RegisteredAt { get; set; }
}