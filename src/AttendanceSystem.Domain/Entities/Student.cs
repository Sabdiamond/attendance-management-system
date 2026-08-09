using AttendanceSystem.Domain.Common;

namespace AttendanceSystem.Domain.Entities;

public class Student : BaseEntity
{
    public string MatricNumber { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    public string? PasswordHash { get; set; }
    public bool IsPasswordSet { get; set; } = false;

    public string? PasswordSetupToken { get; set; }
    public DateTime? PasswordSetupTokenExpiry { get; set; }

    // Replaces the old "Section" grouping — students belong to a level
    // (100, 200, 300...) which determines which courses apply to them.
    public int Level { get; set; }

    public ICollection<AttendanceRecord> AttendanceRecords { get; set; } = new List<AttendanceRecord>();
}