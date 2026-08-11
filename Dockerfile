# ---- Build stage ----
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy only the .csproj files first, so Docker can cache the restore layer
# and skip re-downloading NuGet packages when only source code changes.
COPY src/AttendanceSystem.Api/AttendanceSystem.Api.csproj src/AttendanceSystem.Api/
COPY src/AttendanceSystem.Domain/AttendanceSystem.Domain.csproj src/AttendanceSystem.Domain/
COPY src/AttendanceSystem.Application/AttendanceSystem.Application.csproj src/AttendanceSystem.Application/
COPY src/AttendanceSystem.Infrastructure/AttendanceSystem.Infrastructure.csproj src/AttendanceSystem.Infrastructure/
COPY src/AttendanceSystem.ServiceDefaults/AttendanceSystem.ServiceDefaults.csproj src/AttendanceSystem.ServiceDefaults/

RUN dotnet restore src/AttendanceSystem.Api/AttendanceSystem.Api.csproj

# Now copy everything else and publish
COPY src/AttendanceSystem.Api/ src/AttendanceSystem.Api/
COPY src/AttendanceSystem.Domain/ src/AttendanceSystem.Domain/
COPY src/AttendanceSystem.Application/ src/AttendanceSystem.Application/
COPY src/AttendanceSystem.Infrastructure/ src/AttendanceSystem.Infrastructure/
COPY src/AttendanceSystem.ServiceDefaults/ src/AttendanceSystem.ServiceDefaults/

RUN dotnet publish src/AttendanceSystem.Api/AttendanceSystem.Api.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

# ---- Runtime stage ----
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Npgsql needs this native library for connection negotiation, even when
# using plain password auth rather than Kerberos/GSSAPI. The slim base
# image doesn't include it, which produces a "Cannot load library
# libgssapi_krb5.so.2" warning (and can cause unreliable connection
# behavior) if left out.
RUN apt-get update && apt-get install -y --no-install-recommends libgssapi-krb5-2 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .

# Render injects a PORT environment variable at runtime and expects the
# app to listen on it. Shell form (not exec form) is required here so
# $PORT is substituted by the shell at container start, not at build time.
CMD ASPNETCORE_URLS=http://0.0.0.0:$PORT dotnet AttendanceSystem.Api.dll