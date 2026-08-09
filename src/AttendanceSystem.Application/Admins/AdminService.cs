using AttendanceSystem.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AttendanceSystem.Application.Admins;

public class AdminService
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;

    public AdminService(IApplicationDbContext context, IPasswordHasher passwordHasher, ITokenService tokenService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
    }

    public async Task<LoginAdminResponse> LoginAsync(LoginAdminRequest request)
    {
        var admin = await _context.Admins
            .FirstOrDefaultAsync(a => a.Email == request.Email);

        if (admin is null)
        {
            throw new InvalidOperationException("Invalid email or password.");
        }

        var isPasswordValid = _passwordHasher.Verify(request.Password, admin.PasswordHash);

        if (!isPasswordValid)
        {
            throw new InvalidOperationException("Invalid email or password.");
        }

        var token = _tokenService.GenerateToken(admin.Id, admin.Email, "Admin");

        return new LoginAdminResponse
        {
            Id = admin.Id,
            FullName = admin.FullName,
            Email = admin.Email,
            Token = token
        };
    }
}