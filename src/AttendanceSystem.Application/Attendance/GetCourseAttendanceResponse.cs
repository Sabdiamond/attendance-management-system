namespace AttendanceSystem.Application.Attendance;

public class GetCourseAttendanceResponse
{
    public Guid StudentId { get; set; }
    public string MatricNumber { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public bool IsPresent { get; set; }
    public DateTime? Timestamp { get; set; }
}