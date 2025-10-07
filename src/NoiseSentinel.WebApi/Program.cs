using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using NoiseSentinel.BLL.Configuration;
using NoiseSentinel.BLL.Services;
using NoiseSentinel.BLL.Services.Interfaces;
using NoiseSentinel.DAL.Contexts;
using NoiseSentinel.DAL.Models;
using NoiseSentinel.DAL.Repositories;
using NoiseSentinel.DAL.Repositories.Interfaces;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// ============================================================================
// DATABASE CONFIGURATION
// ============================================================================

builder.Services.AddDbContext<NoiseSentinelDbContext>(options =>
{
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions => sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(5),
            errorNumbersToAdd: null
        )
    );
});

// ============================================================================
// IDENTITY CONFIGURATION
// ============================================================================

builder.Services.AddIdentity<User, ApplicationRole>(options =>
{
    // Password Policy - Enforces strong password requirements
    options.Password.RequireDigit = true;                    // At least one number
    options.Password.RequireLowercase = true;                // At least one lowercase letter
    options.Password.RequireUppercase = true;                // At least one uppercase letter
    options.Password.RequireNonAlphanumeric = true;          // At least one special character
    options.Password.RequiredLength = 8;                     // Minimum 8 characters
    options.Password.RequiredUniqueChars = 1;                // At least 1 unique character

    // User Settings
    options.User.RequireUniqueEmail = true;                  // Email must be unique
    options.User.AllowedUserNameCharacters =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";

    // Sign-in Settings
    options.SignIn.RequireConfirmedEmail = false;            // Email confirmation not required
    options.SignIn.RequireConfirmedAccount = false;

    // Lockout Settings (Security feature)
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;
})
.AddEntityFrameworkStores<NoiseSentinelDbContext>()
.AddDefaultTokenProviders();

// ============================================================================
// JWT AUTHENTICATION CONFIGURATION
// ============================================================================

var jwtSettings = builder.Configuration.GetSection("JwtSettings");
builder.Services.Configure<JwtSettings>(jwtSettings);

var jwtConfig = jwtSettings.Get<JwtSettings>();
if (jwtConfig == null || string.IsNullOrEmpty(jwtConfig.SecretKey))
{
    throw new InvalidOperationException("JWT configuration is missing or invalid in appsettings.json");
}

var secretKeyBytes = Encoding.UTF8.GetBytes(jwtConfig.SecretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false; // Set to TRUE in production for HTTPS
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtConfig.Issuer,
        ValidAudience = jwtConfig.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(secretKeyBytes),
        ClockSkew = TimeSpan.Zero // No delay when token expires
    };

    // Event handlers for debugging (optional)
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
            {
                // ✅ FIXED: Use indexer instead of Add
                context.Response.Headers["Token-Expired"] = "true";
            }
            return Task.CompletedTask;
        },
        OnChallenge = context =>
        {
            context.HandleResponse();
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "application/json";
            var result = System.Text.Json.JsonSerializer.Serialize(new
            {
                message = "You are not authorized to access this resource."
            });
            return context.Response.WriteAsync(result);
        },
        OnForbidden = context =>
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            context.Response.ContentType = "application/json";
            var result = System.Text.Json.JsonSerializer.Serialize(new
            {
                message = "You do not have permission to access this resource."
            });
            return context.Response.WriteAsync(result);
        }
    };
});

// ============================================================================
// AUTHORIZATION POLICIES
// ============================================================================

builder.Services.AddAuthorization(options =>
{
    // Admin policy
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireRole("Admin"));

    // Individual role policies
    options.AddPolicy("CourtAuthorityOnly", policy =>
        policy.RequireRole("Court Authority"));

    options.AddPolicy("StationAuthorityOnly", policy =>
        policy.RequireRole("Station Authority"));

    options.AddPolicy("JudgeOnly", policy =>
        policy.RequireRole("Judge"));

    options.AddPolicy("PoliceOfficerOnly", policy =>
        policy.RequireRole("Police Officer"));

    // Combined policies
    options.AddPolicy("AuthorityRoles", policy =>
        policy.RequireRole("Admin", "Court Authority", "Station Authority"));

    options.AddPolicy("CourtRoles", policy =>
        policy.RequireRole("Admin", "Court Authority", "Judge"));

    options.AddPolicy("StationRoles", policy =>
        policy.RequireRole("Admin", "Station Authority", "Police Officer"));

    options.AddPolicy("AllRoles", policy =>
        policy.RequireRole("Admin", "Court Authority", "Station Authority", "Judge", "Police Officer"));
});

// ============================================================================
// DEPENDENCY INJECTION - REPOSITORIES
// ============================================================================

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IRoleRepository, RoleRepository>();
builder.Services.AddScoped<IJudgeRepository, JudgeRepository>();
builder.Services.AddScoped<IPoliceofficerRepository, PoliceofficerRepository>();
builder.Services.AddScoped<ICourtRepository, CourtRepository>();
builder.Services.AddScoped<ICourttypeRepository, CourttypeRepository>();
builder.Services.AddScoped<IPolicestationRepository, PolicestationRepository>();
builder.Services.AddScoped<IViolationRepository, ViolationRepository>();
builder.Services.AddScoped<IIotdeviceRepository, IotdeviceRepository>();
builder.Services.AddScoped<IEmissionreportRepository, EmissionreportRepository>();
builder.Services.AddScoped<IVehicleRepository, VehicleRepository>();

// ============================================================================
// DEPENDENCY INJECTION - SERVICES
// ============================================================================

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICourtService, CourtService>();
builder.Services.AddScoped<IPolicestationService, PolicestationService>();
builder.Services.AddScoped<IViolationService, ViolationService>();
builder.Services.AddScoped<IIotdeviceService, IotdeviceService>();
builder.Services.AddScoped<IEmissionreportService, EmissionreportService>();
builder.Services.AddScoped<IVehicleService, VehicleService>();

// ============================================================================
// CONTROLLERS CONFIGURATION
// ============================================================================

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Handle circular references
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        // Ignore null values in JSON response
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        // Use camelCase for JSON properties
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// ============================================================================
// SWAGGER/OPENAPI CONFIGURATION
// ============================================================================

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "NoiseSentinel API",
        Version = "v1",
        Description = @"
            **NoiseSentinel Authentication & User Management API**
            
            This API provides authentication and user management functionality for the NoiseSentinel system.
            
            **Roles:**
            - Court Authority: Can register and create Judge accounts
            - Station Authority: Can register and create Police Officer accounts
            - Judge: Court personnel with judicial responsibilities
            - Police Officer: Station personnel for enforcement
            
            **Authentication:**
            - All protected endpoints require a valid JWT Bearer token
            - Login to receive a token, then use it in the Authorization header
            - Format: Authorization: Bearer {your-token}
        ",
        Contact = new OpenApiContact
        {
            Name = "NoiseSentinel Support",
            Email = "support@noisesentinel.com"
        }
    });

    // JWT Authentication in Swagger
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = @"
            JWT Authorization header using the Bearer scheme.
            
            Enter 'Bearer' [space] and then your token in the text input below.
            
            Example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        "
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

    // Enable XML comments if available
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }
});

// ============================================================================
// CORS CONFIGURATION
// ============================================================================

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });

    // Production CORS policy (more restrictive)
    options.AddPolicy("ProductionPolicy", policy =>
    {
        policy.WithOrigins("https://yourdomain.com", "https://www.yourdomain.com")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// ============================================================================
// HTTP CLIENT (if needed for external services)
// ============================================================================

builder.Services.AddHttpClient();

// ============================================================================
// BUILD APPLICATION
// ============================================================================

var app = builder.Build();

// ============================================================================
// DATABASE & ROLE INITIALIZATION
// ============================================================================

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;

    try
    {
        // Initialize database
        var context = services.GetRequiredService<NoiseSentinelDbContext>();

        // Ensure database is created (for development)
        // Comment out in production
        if (app.Environment.IsDevelopment())
        {
            await context.Database.EnsureCreatedAsync();
        }

        // Initialize roles
        var authService = services.GetRequiredService<IAuthService>();
        await authService.InitializeRolesAsync();

        Console.WriteLine("✓ Database and roles initialized successfully.");
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while initializing the database.");
    }
}

// ============================================================================
// MIDDLEWARE PIPELINE CONFIGURATION
// ============================================================================

// Swagger UI (Development only or with authentication in production)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "NoiseSentinel API V1");
        options.RoutePrefix = string.Empty; // Swagger UI at root (http://localhost:5000/)
        options.DocumentTitle = "NoiseSentinel API Documentation";
        options.DisplayRequestDuration();
    });
}

// Global error handling middleware
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";

        var error = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
        if (error != null)
        {
            var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogError(error.Error, "Unhandled exception occurred");

            await context.Response.WriteAsJsonAsync(new
            {
                message = "An internal server error occurred. Please try again later.",
                details = app.Environment.IsDevelopment() ? error.Error.Message : null
            });
        }
    });
});

app.UseHttpsRedirection();

// CORS
app.UseCors(app.Environment.IsDevelopment() ? "AllowAll" : "ProductionPolicy");

// Static files (if needed)
app.UseStaticFiles();

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Map Controllers
app.MapControllers();

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new
{
    status = "Healthy",
    timestamp = DateTime.UtcNow,
    environment = app.Environment.EnvironmentName
}))
.WithTags("Health")
.AllowAnonymous();

// ============================================================================
// RUN APPLICATION
// ============================================================================

Console.WriteLine($"🚀 NoiseSentinel API starting...");
Console.WriteLine($"📅 Date: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC");
Console.WriteLine($"🌍 Environment: {app.Environment.EnvironmentName}");
Console.WriteLine($"📍 Swagger UI: {(app.Environment.IsDevelopment() ? "http://localhost:5000" : "Disabled in production")}");

app.Run();