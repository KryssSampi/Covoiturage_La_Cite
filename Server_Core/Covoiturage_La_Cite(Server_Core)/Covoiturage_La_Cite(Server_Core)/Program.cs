//using Covoiturage_La_Cite_Server_Core_.Application.Services.UserServices;
//using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL;
//using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL.Repositories.UserRepository;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddSingleton<MongoDbContext>();

//builder.Services.AddDbContext<AppDbContext>(options =>
//    options.UseNpgsql(
//        builder.Configuration.GetConnectionString("DefaultConnection"),
//        o => o.UseNetTopologySuite()
//    )
//);
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

//builder.Services.AddScoped<UserRepository>();
//builder.Services.AddScoped<UserServices>();


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
app.UseCors("AllowAll");


app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();