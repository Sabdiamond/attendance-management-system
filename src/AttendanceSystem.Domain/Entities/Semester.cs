using AttendanceSystem.Domain.Common;

namespace AttendanceSystem.Domain.Entities;

/// <summary>
/// First or Second semester, belonging to a Session (e.g. 2025/2026).
/// </summary>
public class Semester : BaseEntity
{
    public string Name { get; set; } = string.Empty; // e.g. "First Semester"
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }

    public Guid SessionId { get; set; }
    public Session Session { get; set; } = null!;

    public ICollection<AttendanceRecord> AttendanceRecords { get; set; } = new List<AttendanceRecord>();
}