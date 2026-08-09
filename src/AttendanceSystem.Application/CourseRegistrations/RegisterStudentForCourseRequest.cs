namespace AttendanceSystem.Application.CourseRegistrations;

public class RegisterStudentForCourseRequest
{
    public Guid StudentId { get; set; }
    public Guid CourseId { get; set; }
    public Guid SessionId { get; set; }
    public Guid SemesterId { get; set; }
}