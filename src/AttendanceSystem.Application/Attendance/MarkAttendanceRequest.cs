namespace AttendanceSystem.Application.Attendance;

public class MarkAttendanceRequest
{
    public Guid StudentId { get; set; }
    public Guid CourseId { get; set; }
    public Guid SessionId { get; set; }
    public Guid SemesterId { get; set; }
    public Guid MarkedByAdminId { get; set; }
}