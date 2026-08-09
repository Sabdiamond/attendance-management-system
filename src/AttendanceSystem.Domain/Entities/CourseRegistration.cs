using AttendanceSystem.Domain.Common;

namespace AttendanceSystem.Domain.Entities;

/// <summary>
/// Records that a student has registered for a course in a given
/// session/semester. A student must have a matching registration
/// before attendance can be marked for that course.
/// </summary>
public class CourseRegistration : BaseEntity
{
    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public Guid CourseId { get; set; }
    public Course Course { get; set; } = null!;

    public Guid SessionId { get; set; }
    public Session Session { get; set; } = null!;

    public Guid SemesterId { get; set; }
    public Semester Semester { get; set; } = null!;

    public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;
}