using AttendanceSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AttendanceSystem.Infrastructure.Data.Configurations;

public class CourseConfiguration : IEntityTypeConfiguration<Course>
{
    public void Configure(EntityTypeBuilder<Course> builder)
    {
        builder.Property(c => c.Code).IsRequired().HasMaxLength(20);
        builder.Property(c => c.Title).IsRequired().HasMaxLength(200);
        builder.HasIndex(c => new { c.Code, c.Level }).IsUnique();
    }
}