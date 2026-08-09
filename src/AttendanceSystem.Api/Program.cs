using System.Security.Claims;
using System.Text;
using AttendanceSystem.Application.Admins;
using AttendanceSystem.Application.Attendance;
using AttendanceSystem.Application.CourseRegistrations;
using AttendanceSystem.Application.Students;
using AttendanceSystem.Infrastructure;
using AttendanceSystem.Infrastructure.Data;
using AttendanceSystem.Infrastructure.Data.Seed;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();
builder.AddNpgsqlDbContext<AttendanceDbContext>("attendancedb");

builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddScoped<AdminService>();
builder.Services.AddScoped<CourseRegistrationService>();
builder.Services.AddScoped<AttendanceService>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var jwtSecret = builder.Configuration["Jwt:Secret"] ?? throw new InvalidOperationException("Jwt:Secret is not configured.");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("Jwt:Issuer is not configured.");
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? throw new InvalidOperationException("Jwt:Audience is not configured.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("AuthenticatedUser", policy => policy.RequireAuthenticatedUser());
});

var app = builder.Build();

app.MapDefaultEndpoints();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AttendanceDbContext>();
    var passwordHasher = scope.ServiceProvider.GetRequiredService<AttendanceSystem.Application.Common.Interfaces.IPasswordHasher>();
    await db.Database.MigrateAsync();
    await DbSeeder.SeedAsync(db, passwordHasher);
}

app.MapGet("/", () => "Attendance Management System API is running");

app.MapPost("/api/students", async (UploadStudentRequest request, StudentService studentService) =>
{
    var result = await studentService.UploadStudentAsync(request);
    return Results.Ok(result);
}).RequireAuthorization("AdminOnly");

app.MapPost("/api/students/bulk", async (List<UploadStudentRequest> requests, StudentService studentService) =>
{
    var result = await studentService.UploadStudentsBulkAsync(requests);
    return Results.Ok(result);
}).RequireAuthorization("AdminOnly");

app.MapPost("/api/students/set-password", async (SetPasswordRequest request, StudentService studentService) =>
{
    try { var result = await studentService.SetPasswordAsync(request); return Results.Ok(result); }
    catch (InvalidOperationException ex) { return Results.BadRequest(ex.Message); }
});

app.MapPost("/api/students/login", async (LoginStudentRequest request, StudentService studentService) =>
{
    try { var result = await studentService.LoginAsync(request); return Results.Ok(result); }
    catch (InvalidOperationException ex) { return Results.BadRequest(ex.Message); }
});

app.MapPost("/api/admins/login", async (LoginAdminRequest request, AdminService adminService) =>
{
    try { var result = await adminService.LoginAsync(request); return Results.Ok(result); }
    catch (InvalidOperationException ex) { return Results.BadRequest(ex.Message); }
});

app.MapPost("/api/course-registrations", async (RegisterStudentForCourseRequest request, CourseRegistrationService courseRegistrationService) =>
{
    try { var result = await courseRegistrationService.RegisterAsync(request); return Results.Ok(result); }
    catch (InvalidOperationException ex) { return Results.BadRequest(ex.Message); }
}).RequireAuthorization("AdminOnly");

app.MapGet("/api/course-registrations/student/{studentId}", async (Guid studentId, ClaimsPrincipal user, CourseRegistrationService courseRegistrationService) =>
{
    var role = user.FindFirstValue(ClaimTypes.Role);
    var callerId = user.FindFirstValue("id");

    if (role == "Student" && callerId != studentId.ToString())
    {
        return Results.Forbid();
    }

    try { var result = await courseRegistrationService.GetStudentRegistrationsAsync(studentId); return Results.Ok(result); }
    catch (InvalidOperationException ex) { return Results.BadRequest(ex.Message); }
}).RequireAuthorization("AuthenticatedUser");

app.MapGet("/api/students/list", async (CourseRegistrationService courseRegistrationService) =>
{
    var result = await courseRegistrationService.GetStudentsAsync();
    return Results.Ok(result);
}).RequireAuthorization("AdminOnly");

app.MapGet("/api/courses/list", async (CourseRegistrationService courseRegistrationService) =>
{
    var result = await courseRegistrationService.GetCoursesAsync();
    return Results.Ok(result);
}).RequireAuthorization("AdminOnly");

app.MapGet("/api/sessions/list", async (CourseRegistrationService courseRegistrationService) =>
{
    var result = await courseRegistrationService.GetSessionsAsync();
    return Results.Ok(result);
}).RequireAuthorization("AdminOnly");

app.MapGet("/api/semesters/list", async (Guid sessionId, CourseRegistrationService courseRegistrationService) =>
{
    var result = await courseRegistrationService.GetSemestersAsync(sessionId);
    return Results.Ok(result);
}).RequireAuthorization("AdminOnly");

app.MapPost("/api/attendance/mark", async (MarkAttendanceRequest request, AttendanceService attendanceService) =>
{
    try { var result = await attendanceService.MarkAttendanceAsync(request); return Results.Ok(result); }
    catch (InvalidOperationException ex) { return Results.BadRequest(ex.Message); }
}).RequireAuthorization("AdminOnly");

app.MapGet("/api/attendance/student/{studentId}", async (Guid studentId, ClaimsPrincipal user, AttendanceService attendanceService) =>
{
    var role = user.FindFirstValue(ClaimTypes.Role);
    var callerId = user.FindFirstValue("id");

    if (role == "Student" && callerId != studentId.ToString())
    {
        return Results.Forbid();
    }

    try { var result = await attendanceService.GetStudentAttendanceAsync(studentId); return Results.Ok(result); }
    catch (InvalidOperationException ex) { return Results.BadRequest(ex.Message); }
}).RequireAuthorization("AuthenticatedUser");

app.MapGet("/api/attendance/course", async (Guid courseId, Guid sessionId, Guid semesterId, AttendanceService attendanceService) =>
{
    try { var result = await attendanceService.GetCourseAttendanceAsync(courseId, sessionId, semesterId); return Results.Ok(result); }
    catch (InvalidOperationException ex) { return Results.BadRequest(ex.Message); }
}).RequireAuthorization("AdminOnly");

app.Run();