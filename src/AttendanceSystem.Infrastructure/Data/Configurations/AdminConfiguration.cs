using AttendanceSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AttendanceSystem.Infrastructure.Data.Configurations;

public class AdminConfiguration : IEntityTypeConfiguration<Admin>
{
    public void Configure(EntityTypeBuilder<Admin> builder)
    {
        builder.HasIndex(a => a.Email).IsUnique();
        builder.Property(a => a.FullName).IsRequired().HasMaxLength(150);
        builder.Property(a => a.Email).IsRequired().HasMaxLength(200);
        builder.Property(a => a.PasswordHash).IsRequired();
    }
}