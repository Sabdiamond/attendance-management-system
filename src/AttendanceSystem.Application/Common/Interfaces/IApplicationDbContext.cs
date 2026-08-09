using AttendanceSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AttendanceSystem.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Admin> Admins { get; }
    DbSet<Student> Students { get; }
    DbSet<Session> Sessions { get; }
    DbSet<Semester> Semesters { get; }
    DbSet<Course> Courses { get; }
    DbSet<CourseRegistration> CourseRegistrations { get; }
    DbSet<AttendanceRecord> AttendanceRecords { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}