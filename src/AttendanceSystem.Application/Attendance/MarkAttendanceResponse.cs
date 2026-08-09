namespace AttendanceSystem.Application.Attendance;

public class MarkAttendanceResponse
{
    public Guid AttendanceRecordId { get; set; }
    public Guid StudentId { get; set; }
    public string MatricNumber { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string CourseCode { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}