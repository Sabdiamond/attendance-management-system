using AttendanceSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AttendanceSystem.Infrastructure.Data.Configurations;

public class SemesterConfiguration : IEntityTypeConfiguration<Semester>
{
    public void Configure(EntityTypeBuilder<Semester> builder)
    {
        builder.Property(s => s.Name).IsRequired().HasMaxLength(100);

        // "First Semester" only needs to be unique within its Session
        builder.HasIndex(s => new { s.SessionId, s.Name }).IsUnique();
    }
}