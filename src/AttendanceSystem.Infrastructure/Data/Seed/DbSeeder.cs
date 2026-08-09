using AttendanceSystem.Application.Common.Interfaces;
using AttendanceSystem.Domain.Entities;

namespace AttendanceSystem.Infrastructure.Data.Seed;

public static class DbSeeder
{
    public static async Task SeedAsync(AttendanceDbContext context, IPasswordHasher passwordHasher)
    {
        if (!context.Admins.Any())
        {
            context.Admins.Add(new Admin
            {
                FullName = "System Admin",
                Email = "admin@school.edu",
                PasswordHash = passwordHasher.Hash("Admin@123")
            });
        }

        if (!context.Sessions.Any())
        {
            var session = new Session
            {
                Name = "2025/2026",
                StartDate = new DateTime(2025, 9, 1, 0, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(2026, 7, 31, 0, 0, 0, DateTimeKind.Utc),
                IsActive = true
            };

            context.Sessions.Add(session);

            context.Semesters.AddRange(
                new Semester
                {
                    Name = "First Semester",
                    StartDate = new DateTime(2025, 9, 1, 0, 0, 0, DateTimeKind.Utc),
                    EndDate = new DateTime(2026, 1, 31, 0, 0, 0, DateTimeKind.Utc),
                    IsActive = true,
                    Session = session
                },
                new Semester
                {
                    Name = "Second Semester",
                    StartDate = new DateTime(2026, 2, 1, 0, 0, 0, DateTimeKind.Utc),
                    EndDate = new DateTime(2026, 7, 31, 0, 0, 0, DateTimeKind.Utc),
                    IsActive = false,
                    Session = session
                }
            );
        }

        // Seeded individually (not gated by Courses.Any()) so new courses can be
        // added here later and will still get inserted even though the table
        // already has rows from previous runs.
        var coursesToSeed = new[]
        {
            // 100 Level
            new Course { Code = "CSC101", Title = "Introduction to Computing", Level = 100 },
            new Course { Code = "CSC102", Title = "Introduction to Programming", Level = 100 },
            new Course { Code = "MTH101", Title = "General Mathematics I", Level = 100 },
            new Course { Code = "MTH102", Title = "General Mathematics II", Level = 100 },
            new Course { Code = "PHY101", Title = "General Physics I", Level = 100 },
            new Course { Code = "GST101", Title = "Use of English", Level = 100 },

            // 200 Level
            new Course { Code = "CSC201", Title = "Data Structures", Level = 200 },
            new Course { Code = "CSC202", Title = "Computer Architecture", Level = 200 },
            new Course { Code = "CSC203", Title = "Object-Oriented Programming", Level = 200 },
            new Course { Code = "MTH201", Title = "Discrete Mathematics", Level = 200 },
            new Course { Code = "STA201", Title = "Probability and Statistics", Level = 200 },
            new Course { Code = "GST201", Title = "Philosophy and Logic", Level = 200 },

            // 300 Level
            new Course { Code = "CSC301", Title = "Software Engineering", Level = 300 },
            new Course { Code = "CSC302", Title = "Database Systems", Level = 300 },
            new Course { Code = "CSC303", Title = "Operating Systems", Level = 300 },
            new Course { Code = "CSC304", Title = "Computer Networks I", Level = 300 },
            new Course { Code = "CSC305", Title = "Theory of Computation", Level = 300 },
            new Course { Code = "CSC306", Title = "Human-Computer Interaction", Level = 300 },

            // 400 Level
            new Course { Code = "CSC401", Title = "Computer Networks II", Level = 400 },
            new Course { Code = "CSC402", Title = "Artificial Intelligence", Level = 400 },
            new Course { Code = "CSC403", Title = "Web Technologies", Level = 400 },
            new Course { Code = "CSC404", Title = "Compiler Construction", Level = 400 },
            new Course { Code = "CSC405", Title = "Mobile Application Development", Level = 400 },
            new Course { Code = "CSC406", Title = "Machine Learning Fundamentals", Level = 400 },

            // 500 Level
            new Course { Code = "CSC501", Title = "Final Year Project I", Level = 500 },
            new Course { Code = "CSC502", Title = "Distributed Systems", Level = 500 },
            new Course { Code = "CSC503", Title = "Cybersecurity Fundamentals", Level = 500 },
            new Course { Code = "CSC504", Title = "Cloud Computing", Level = 500 },
            new Course { Code = "CSC505", Title = "Advanced Database Systems", Level = 500 },
            new Course { Code = "CSC506", Title = "Final Year Project II", Level = 500 },
        };

        var existingCourseCodes = context.Courses
            .Select(c => c.Code)
            .ToHashSet();

        foreach (var course in coursesToSeed)
        {
            if (!existingCourseCodes.Contains(course.Code))
            {
                context.Courses.Add(course);
            }
        }

        await context.SaveChangesAsync();
    }
}