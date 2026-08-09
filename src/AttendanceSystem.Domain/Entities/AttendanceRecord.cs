using AttendanceSystem.Domain.Common;

namespace AttendanceSystem.Domain.Entities;

/// <summary>
/// One row per successful QR scan — a student marked present
/// for a specific course, in a specific semester, in a specific session.
/// </summary>
public class AttendanceRecord : BaseEntity
{
    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public Guid CourseId { get; set; }
    public Course Course { get; set; } = null!;

    public Guid SessionId { get; set; }
    public Session Session { get; set; } = null!;

    public Guid SemesterId { get; set; }
    public Semester Semester { get; set; } = null!;

    public Guid MarkedByAdminId { get; set; }
    public Admin MarkedByAdmin { get; set; } = null!;

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}