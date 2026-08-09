using AttendanceSystem.Domain.Common;

namespace AttendanceSystem.Domain.Entities;

public class Admin : BaseEntity
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;

    public ICollection<AttendanceRecord> MarkedAttendanceRecords { get; set; } = new List<AttendanceRecord>();
}