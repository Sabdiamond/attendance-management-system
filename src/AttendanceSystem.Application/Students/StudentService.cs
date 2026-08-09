using AttendanceSystem.Application.Common.Interfaces;
using AttendanceSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace AttendanceSystem.Application.Students;

public class StudentService
{
    private readonly IApplicationDbContext _context;
    private readonly IEmailSender _emailSender;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;
    private readonly IConfiguration _configuration;

    public StudentService(
        IApplicationDbContext context,
        IEmailSender emailSender,
        IPasswordHasher passwordHasher,
        ITokenService tokenService,
        IConfiguration configuration)
    {
        _context = context;
        _emailSender = emailSender;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _configuration = configuration;
    }

    public async Task<UploadStudentResponse> UploadStudentAsync(UploadStudentRequest request)
    {
        var student = new Student
        {
            FullName = request.FullName,
            Email = request.Email,
            MatricNumber = request.MatricNumber,
            Level = request.Level,
            IsPasswordSet = false,
            PasswordSetupToken = Guid.NewGuid().ToString("N"),
            PasswordSetupTokenExpiry = DateTime.UtcNow.AddDays(3)
        };

        _context.Students.Add(student);
        await _context.SaveChangesAsync();

        var frontendBaseUrl = _configuration["FrontendBaseUrl"] ?? throw new InvalidOperationException("FrontendBaseUrl is not configured.");
        var setupLink = $"{frontendBaseUrl}/set-password?token={student.PasswordSetupToken}";
        await _emailSender.SendPasswordSetupEmailAsync(student.Email, student.FullName, setupLink);

        return new UploadStudentResponse
        {
            Id = student.Id,
            MatricNumber = student.MatricNumber,
            FullName = student.FullName,
            Email = student.Email
        };
    }

    public async Task<BulkUploadStudentsResponse> UploadStudentsBulkAsync(List<UploadStudentRequest> requests)
    {
        var results = new List<BulkUploadRowResult>();

        var existingMatricNumbers = await _context.Students
            .Select(s => s.MatricNumber)
            .ToListAsync();

        var existingEmails = await _context.Students
            .Select(s => s.Email)
            .ToListAsync();

        var seenMatricNumbers = new HashSet<string>(existingMatricNumbers, StringComparer.OrdinalIgnoreCase);
        var seenEmails = new HashSet<string>(existingEmails, StringComparer.OrdinalIgnoreCase);

        var studentsToAdd = new List<Student>();

        foreach (var request in requests)
        {
            if (string.IsNullOrWhiteSpace(request.MatricNumber) ||
                string.IsNullOrWhiteSpace(request.FullName) ||
                string.IsNullOrWhiteSpace(request.Email))
            {
                results.Add(new BulkUploadRowResult
                {
                    MatricNumber = request.MatricNumber,
                    Success = false,
                    Message = "Missing required field (matric number, full name, or email)."
                });
                continue;
            }

            if (seenMatricNumbers.Contains(request.MatricNumber))
            {
                results.Add(new BulkUploadRowResult
                {
                    MatricNumber = request.MatricNumber,
                    Success = false,
                    Message = "Duplicate matric number (already exists or repeated in this file)."
                });
                continue;
            }

            if (seenEmails.Contains(request.Email))
            {
                results.Add(new BulkUploadRowResult
                {
                    MatricNumber = request.MatricNumber,
                    Success = false,
                    Message = "Duplicate email (already exists or repeated in this file)."
                });
                continue;
            }

            seenMatricNumbers.Add(request.MatricNumber);
            seenEmails.Add(request.Email);

            var student = new Student
            {
                FullName = request.FullName,
                Email = request.Email,
                MatricNumber = request.MatricNumber,
                Level = request.Level,
                IsPasswordSet = false,
                PasswordSetupToken = Guid.NewGuid().ToString("N"),
                PasswordSetupTokenExpiry = DateTime.UtcNow.AddDays(3)
            };

            studentsToAdd.Add(student);
            _context.Students.Add(student);

            results.Add(new BulkUploadRowResult
            {
                MatricNumber = request.MatricNumber,
                Success = true,
                Message = "Uploaded successfully."
            });
        }

        if (studentsToAdd.Count > 0)
        {
            await _context.SaveChangesAsync();

            var frontendBaseUrl = _configuration["FrontendBaseUrl"] ?? throw new InvalidOperationException("FrontendBaseUrl is not configured.");

            foreach (var student in studentsToAdd)
            {
                var setupLink = $"{frontendBaseUrl}/set-password?token={student.PasswordSetupToken}";
                await _emailSender.SendPasswordSetupEmailAsync(student.Email, student.FullName, setupLink);
            }
        }

        return new BulkUploadStudentsResponse
        {
            TotalRows = requests.Count,
            SuccessCount = studentsToAdd.Count,
            FailureCount = requests.Count - studentsToAdd.Count,
            Results = results
        };
    }

    public async Task<SetPasswordResponse> SetPasswordAsync(SetPasswordRequest request)
    {
        var student = await _context.Students
            .FirstOrDefaultAsync(s => s.PasswordSetupToken == request.Token);

        if (student is null)
        {
            throw new InvalidOperationException("Invalid or unrecognized setup token.");
        }

        if (student.PasswordSetupTokenExpiry is null || student.PasswordSetupTokenExpiry < DateTime.UtcNow)
        {
            throw new InvalidOperationException("This setup link has expired. Please contact the admin for a new one.");
        }

        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
        {
            throw new InvalidOperationException("Password must be at least 6 characters long.");
        }

        student.PasswordHash = _passwordHasher.Hash(request.NewPassword);
        student.IsPasswordSet = true;
        student.PasswordSetupToken = null;
        student.PasswordSetupTokenExpiry = null;

        await _context.SaveChangesAsync();

        return new SetPasswordResponse
        {
            Id = student.Id,
            MatricNumber = student.MatricNumber,
            FullName = student.FullName
        };
    }

    public async Task<LoginStudentResponse> LoginAsync(LoginStudentRequest request)
    {
        var student = await _context.Students
            .FirstOrDefaultAsync(s => s.MatricNumber == request.MatricNumber);

        if (student is null)
        {
            throw new InvalidOperationException("Invalid matric number or password.");
        }

        if (!student.IsPasswordSet || string.IsNullOrEmpty(student.PasswordHash))
        {
            throw new InvalidOperationException("This account has not completed password setup yet.");
        }

        var isPasswordValid = _passwordHasher.Verify(request.Password, student.PasswordHash);

        if (!isPasswordValid)
        {
            throw new InvalidOperationException("Invalid matric number or password.");
        }

        var token = _tokenService.GenerateToken(student.Id, student.Email, "Student");

        return new LoginStudentResponse
        {
            Id = student.Id,
            MatricNumber = student.MatricNumber,
            FullName = student.FullName,
            Email = student.Email,
            Level = student.Level,
            Token = token
        };
    }
}

public class BulkUploadRowResult
{
    public string MatricNumber { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class BulkUploadStudentsResponse
{
    public int TotalRows { get; set; }
    public int SuccessCount { get; set; }
    public int FailureCount { get; set; }
    public List<BulkUploadRowResult> Results { get; set; } = new();
}