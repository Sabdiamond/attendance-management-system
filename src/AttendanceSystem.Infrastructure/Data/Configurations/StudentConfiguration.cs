using AttendanceSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AttendanceSystem.Infrastructure.Data.Configurations;

public class StudentConfiguration : IEntityTypeConfiguration<Student>
{
    public void Configure(EntityTypeBuilder<Student> builder)
    {
        builder.HasIndex(s => s.MatricNumber).IsUnique();
        builder.HasIndex(s => s.Email).IsUnique();

        builder.Property(s => s.MatricNumber).IsRequired().HasMaxLength(50);
        builder.Property(s => s.FullName).IsRequired().HasMaxLength(150);
        builder.Property(s => s.Email).IsRequired().HasMaxLength(200);
    }
}