using AttendanceSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AttendanceSystem.Infrastructure.Data.Configurations;

public class AttendanceRecordConfiguration : IEntityTypeConfiguration<AttendanceRecord>
{
    public void Configure(EntityTypeBuilder<AttendanceRecord> builder)
    {
        builder.HasOne(a => a.Student)
            .WithMany(s => s.AttendanceRecords)
            .HasForeignKey(a => a.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Course)
            .WithMany(c => c.AttendanceRecords)
            .HasForeignKey(a => a.CourseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Session)
            .WithMany(s => s.AttendanceRecords)
            .HasForeignKey(a => a.SessionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Semester)
            .WithMany(s => s.AttendanceRecords)
            .HasForeignKey(a => a.SemesterId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.MarkedByAdmin)
            .WithMany(ad => ad.MarkedAttendanceRecords)
            .HasForeignKey(a => a.MarkedByAdminId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(a => new { a.StudentId, a.CourseId, a.SemesterId, a.Timestamp });
    }
}