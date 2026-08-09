using AttendanceSystem.Domain.Common;

namespace AttendanceSystem.Domain.Entities;

/// <summary>
/// An academic session/year, e.g. "2025/2026". Seeded data.
/// A session contains multiple semesters (First, Second).
/// </summary>
public class Session : BaseEntity
{
    public string Name { get; set; } = string.Empty; // e.g. "2025/2026"
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }

    public ICollection<Semester> Semesters { get; set; } = new List<Semester>();
    public ICollection<AttendanceRecord> AttendanceRecords { get; set; } = new List<AttendanceRecord>();
}