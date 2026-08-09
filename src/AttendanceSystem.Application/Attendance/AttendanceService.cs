using AttendanceSystem.Application.Common.Interfaces;
using AttendanceSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AttendanceSystem.Application.Attendance;

public class AttendanceService
{
    private readonly IApplicationDbContext _context;

    public AttendanceService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<MarkAttendanceResponse> MarkAttendanceAsync(MarkAttendanceRequest request)
    {
        var student = await _context.Students
            .FirstOrDefaultAsync(s => s.Id == request.StudentId);

        if (student is null)
            throw new InvalidOperationException("Student not found.");

        var course = await _context.Courses
            .FirstOrDefaultAsync(c => c.Id == request.CourseId);

        if (course is null)
            throw new InvalidOperationException("Course not found.");

        var registrationExists = await _context.CourseRegistrations
            .AnyAsync(cr =>
                cr.StudentId == request.StudentId &&
                cr.CourseId == request.CourseId &&
                cr.SemesterId == request.SemesterId);

        if (!registrationExists)
            throw new InvalidOperationException(
                $"{student.FullName} is not registered for this course in the selected semester.");

        var today = DateTime.UtcNow.Date;

        var alreadyMarkedToday = await _context.AttendanceRecords
            .AnyAsync(a =>
                a.StudentId == request.StudentId &&
                a.CourseId == request.CourseId &&
                a.Timestamp.Date == today);

        if (alreadyMarkedToday)
            throw new InvalidOperationException(
                $"{student.FullName} has already been marked present for this course today.");

        var attendanceRecord = new AttendanceRecord
        {
            StudentId = request.StudentId,
            CourseId = request.CourseId,
            SessionId = request.SessionId,
            SemesterId = request.SemesterId,
            MarkedByAdminId = request.MarkedByAdminId,
            Timestamp = DateTime.UtcNow
        };

        _context.AttendanceRecords.Add(attendanceRecord);
        await _context.SaveChangesAsync();

        return new MarkAttendanceResponse
        {
            AttendanceRecordId = attendanceRecord.Id,
            StudentId = student.Id,
            MatricNumber = student.MatricNumber,
            FullName = student.FullName,
            CourseCode = course.Code,
            Timestamp = attendanceRecord.Timestamp
        };
    }

    public async Task<List<GetStudentAttendanceResponse>> GetStudentAttendanceAsync(Guid studentId)
    {
        var studentExists = await _context.Students.AnyAsync(s => s.Id == studentId);

        if (!studentExists)
            throw new InvalidOperationException("Student not found.");

        return await _context.AttendanceRecords
            .Where(a => a.StudentId == studentId)
            .OrderByDescending(a => a.Timestamp)
            .Select(a => new GetStudentAttendanceResponse
            {
                AttendanceRecordId = a.Id,
                CourseCode = a.Course.Code,
                CourseTitle = a.Course.Title,
                SessionName = a.Session.Name,
                SemesterName = a.Semester.Name,
                Timestamp = a.Timestamp
            })
            .ToListAsync();
    }

    public async Task<List<GetCourseAttendanceResponse>> GetCourseAttendanceAsync(
        Guid courseId, Guid sessionId, Guid semesterId)
    {
        var courseExists = await _context.Courses.AnyAsync(c => c.Id == courseId);

        if (!courseExists)
            throw new InvalidOperationException("Course not found.");

        var registeredStudents = await _context.CourseRegistrations
            .Where(cr =>
                cr.CourseId == courseId &&
                cr.SessionId == sessionId &&
                cr.SemesterId == semesterId)
            .Select(cr => new
            {
                cr.Student.Id,
                cr.Student.MatricNumber,
                cr.Student.FullName
            })
            .ToListAsync();

        var attendanceRecords = await _context.AttendanceRecords
            .Where(a =>
                a.CourseId == courseId &&
                a.SessionId == sessionId &&
                a.SemesterId == semesterId)
            .ToListAsync();

        return registeredStudents
            .Select(s =>
            {
                var record = attendanceRecords.FirstOrDefault(a => a.StudentId == s.Id);

                return new GetCourseAttendanceResponse
                {
                    StudentId = s.Id,
                    MatricNumber = s.MatricNumber,
                    FullName = s.FullName,
                    IsPresent = record is not null,
                    Timestamp = record?.Timestamp
                };
            })
            .OrderBy(r => r.FullName)
            .ToList();
    }
}