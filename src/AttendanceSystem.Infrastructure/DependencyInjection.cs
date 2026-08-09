using AttendanceSystem.Application.Common.Interfaces;
using AttendanceSystem.Application.Students;
using AttendanceSystem.Infrastructure.Auth;
using AttendanceSystem.Infrastructure.Data;
using AttendanceSystem.Infrastructure.Email;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AttendanceSystem.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<IApplicationDbContext>(provider =>
            provider.GetRequiredService<AttendanceDbContext>());

        services.AddScoped<IEmailSender, SmtpEmailSender>();
        services.AddScoped<IPasswordHasher, BCryptPasswordHasher>();
        services.AddScoped<ITokenService, JwtTokenService>();
        services.AddScoped<StudentService>();

        return services;
    }
}