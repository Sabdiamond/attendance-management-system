namespace AttendanceSystem.Application.Attendance;

public class GetStudentAttendanceResponse
{
    public Guid AttendanceRecordId { get; set; }
    public string CourseCode { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;
    public string SessionName { get; set; } = string.Empty;
    public string SemesterName { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}