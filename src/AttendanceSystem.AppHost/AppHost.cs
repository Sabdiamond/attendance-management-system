var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("postgres")
    .WithDataVolume() // persists data between restarts
    .WithPgAdmin()
    .AddDatabase("attendancedb");

builder.AddProject<Projects.AttendanceSystem_Api>("api")
    .WithReference(postgres)
    .WaitFor(postgres)
    .WithHttpsEndpoint(port: 7297, name: "https", isProxied: false)
    .WithHttpEndpoint(port: 7298, name: "http", isProxied: false);

builder.Build().Run();