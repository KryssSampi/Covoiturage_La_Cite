using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Covoiturage_La_Cite_Server_Core_.Migrations
{
    /// <inheritdoc />
    public partial class AddGoTasksAndPrefsAndAuthSession : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "EmailNegligeables",
                table: "UserPreferences",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "EmailPrimordiales",
                table: "UserPreferences",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "EmailSecondaires",
                table: "UserPreferences",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "PushNegligeables",
                table: "UserPreferences",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "PushPrimordiales",
                table: "UserPreferences",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "PushSecondaires",
                table: "UserPreferences",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "GoTasks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TaskKey = table.Column<string>(type: "text", nullable: false),
                    TitleFr = table.Column<string>(type: "text", nullable: false),
                    TitleEn = table.Column<string>(type: "text", nullable: false),
                    DescriptionFr = table.Column<string>(type: "text", nullable: false),
                    DescriptionEn = table.Column<string>(type: "text", nullable: false),
                    Category = table.Column<string>(type: "text", nullable: false),
                    Link = table.Column<string>(type: "text", nullable: true),
                    Points = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GoTasks", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserGoTaskProgressions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    GoTaskId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsDone = table.Column<bool>(type: "boolean", nullable: false),
                    CompletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserGoTaskProgressions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserGoTaskProgressions_GoTasks_GoTaskId",
                        column: x => x.GoTaskId,
                        principalTable: "GoTasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserGoTaskProgressions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GoTasks_TaskKey",
                table: "GoTasks",
                column: "TaskKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserGoTaskProgressions_GoTaskId",
                table: "UserGoTaskProgressions",
                column: "GoTaskId");

            migrationBuilder.CreateIndex(
                name: "IX_UserGoTaskProgressions_UserId_GoTaskId",
                table: "UserGoTaskProgressions",
                columns: new[] { "UserId", "GoTaskId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserGoTaskProgressions");

            migrationBuilder.DropTable(
                name: "GoTasks");

            migrationBuilder.DropColumn(
                name: "EmailNegligeables",
                table: "UserPreferences");

            migrationBuilder.DropColumn(
                name: "EmailPrimordiales",
                table: "UserPreferences");

            migrationBuilder.DropColumn(
                name: "EmailSecondaires",
                table: "UserPreferences");

            migrationBuilder.DropColumn(
                name: "PushNegligeables",
                table: "UserPreferences");

            migrationBuilder.DropColumn(
                name: "PushPrimordiales",
                table: "UserPreferences");

            migrationBuilder.DropColumn(
                name: "PushSecondaires",
                table: "UserPreferences");
        }
    }
}
