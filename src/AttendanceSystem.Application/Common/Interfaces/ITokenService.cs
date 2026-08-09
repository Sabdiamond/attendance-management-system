namespace AttendanceSystem.Application.Common.Interfaces;

public interface ITokenService
{
    string GenerateToken(Guid userId, string email, string role);
}