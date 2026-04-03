using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace covoiturageAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddEmailResendLimit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "EmailResendCount",
                table: "Users",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "EmailResendLastAttempt",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EmailResendCount",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "EmailResendLastAttempt",
                table: "Users");
        }
    }
}
