using AttendanceSystem.Application.Common.Interfaces;
using AttendanceSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AttendanceSystem.Application.CourseRegistrations;

public class CourseRegistrationService
{
    private readonly IApplicationDbContext _context;

    public CourseRegistrationService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<RegisterStudentForCourseResponse> RegisterAsync(RegisterStudentForCourseRequest request)
    {
        var student = await _context.Students
            .FirstOrDefaultAsync(s => s.Id == request.StudentId);

        if (student is null)
        {
            throw new InvalidOperationException("Student not found.");
        }

        var course = await _context.Courses
            .FirstOrDefaultAsync(c => c.Id == request.CourseId);

        if (course is null)
        {
            throw new InvalidOperationException("Course not found.");
        }

        var session = await _context.Sessions
            .FirstOrDefaultAsync(s => s.Id == request.SessionId);

        if (session is null)
        {
            throw new InvalidOperationException("Session not found.");
        }

        var semester = await _context.Semesters
            .FirstOrDefaultAsync(s => s.Id == request.SemesterId);

        if (semester is null)
        {
            throw new InvalidOperationException("Semester not found.");
        }

        var alreadyRegistered = await _context.CourseRegistrations
            .AnyAsync(cr =>
                cr.StudentId == request.StudentId &&
                cr.CourseId == request.CourseId &&
                cr.SemesterId == request.SemesterId);

        if (alreadyRegistered)
        {
            throw new InvalidOperationException("This student is already registered for this course in this semester.");
        }

        var registration = new CourseRegistration
        {
            StudentId = request.StudentId,
            CourseId = request.CourseId,
            SessionId = request.SessionId,
            SemesterId = request.SemesterId,
            RegisteredAt = DateTime.UtcNow
        };

        _context.CourseRegistrations.Add(registration);
        await _context.SaveChangesAsync();

        return new RegisterStudentForCourseResponse
        {
            Id = registration.Id,
            StudentId = student.Id,
            StudentFullName = student.FullName,
            CourseId = course.Id,
            CourseCode = course.Code,
            RegisteredAt = registration.RegisteredAt
        };
    }

    public async Task<List<StudentListItem>> GetStudentsAsync()
    {
        return await _context.Students
            .OrderBy(s => s.FullName)
            .Select(s => new StudentListItem
            {
                Id = s.Id,
                FullName = s.FullName,
                MatricNumber = s.MatricNumber,
                Level = s.Level
            })
            .ToListAsync();
    }

    public async Task<List<CourseListItem>> GetCoursesAsync()
    {
        return await _context.Courses
            .OrderBy(c => c.Code)
            .Select(c => new CourseListItem
            {
                Id = c.Id,
                Code = c.Code,
                Title = c.Title,
                Level = c.Level
            })
            .ToListAsync();
    }

    public async Task<List<SessionListItem>> GetSessionsAsync()
    {
        return await _context.Sessions
            .OrderByDescending(s => s.StartDate)
            .Select(s => new SessionListItem
            {
                Id = s.Id,
                Name = s.Name
            })
            .ToListAsync();
    }

    public async Task<List<SemesterListItem>> GetSemestersAsync(Guid sessionId)
    {
        return await _context.Semesters
            .Where(sm => sm.SessionId == sessionId)
            .OrderBy(sm => sm.StartDate)
            .Select(sm => new SemesterListItem
            {
                Id = sm.Id,
                Name = sm.Name
            })
            .ToListAsync();
    }

    public async Task<List<StudentCourseRegistrationItem>> GetStudentRegistrationsAsync(Guid studentId)
    {
        var studentExists = await _context.Students.AnyAsync(s => s.Id == studentId);

        if (!studentExists)
        {
            throw new InvalidOperationException("Student not found.");
        }

        var registrations = await (
            from cr in _context.CourseRegistrations
            join c in _context.Courses on cr.CourseId equals c.Id
            join se in _context.Sessions on cr.SessionId equals se.Id
            join sm in _context.Semesters on cr.SemesterId equals sm.Id
            where cr.StudentId == studentId
            orderby cr.RegisteredAt descending
            select new StudentCourseRegistrationItem
            {
                CourseId = c.Id,
                CourseCode = c.Code,
                CourseTitle = c.Title,
                Level = c.Level,
                SessionName = se.Name,
                SemesterName = sm.Name,
                RegisteredAt = cr.RegisteredAt
            }
        ).ToListAsync();

        return registrations;
    }
}

public class StudentListItem
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string MatricNumber { get; set; } = string.Empty;
    public int Level { get; set; }
}

public class CourseListItem
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public int Level { get; set; }
}

public class SessionListItem
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class SemesterListItem
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class StudentCourseRegistrationItem
{
    public Guid CourseId { get; set; }
    public string CourseCode { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;
    public int Level { get; set; }
    public string SessionName { get; set; } = string.Empty;
    public string SemesterName { get; set; } = string.Empty;
    public DateTime RegisteredAt { get; set; }
}