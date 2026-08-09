using AttendanceSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AttendanceSystem.Infrastructure.Data.Configurations;

public class SessionConfiguration : IEntityTypeConfiguration<Session>
{
    public void Configure(EntityTypeBuilder<Session> builder)
    {
        builder.Property(s => s.Name).IsRequired().HasMaxLength(20); // e.g. "2025/2026"
        builder.HasIndex(s => s.Name).IsUnique();

        builder.HasMany(s => s.Semesters)
            .WithOne(sem => sem.Session)
            .HasForeignKey(sem => sem.SessionId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}