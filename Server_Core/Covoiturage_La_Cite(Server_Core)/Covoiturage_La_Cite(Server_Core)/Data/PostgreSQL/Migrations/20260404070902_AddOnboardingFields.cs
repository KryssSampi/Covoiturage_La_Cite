using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class AddOnboardingFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // AddColumn ne génère pas DEFAULT pour text[] — on passe par SQL brut
            migrationBuilder.Sql(@"ALTER TABLE ""Vehicles"" ADD ""VehiclePhotoUrls"" text[] NOT NULL DEFAULT '{}';");

            migrationBuilder.AddColumn<bool>(
                name: "Verified",
                table: "Vehicles",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "AlreadySetAProfilePicture",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "AlreadySignPolitics",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "AlreadySubmittedAllVehiculeDocument",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "OnboardingCompleted",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "VehiclePhotoUrls",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "Verified",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "AlreadySetAProfilePicture",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "AlreadySignPolitics",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "AlreadySubmittedAllVehiculeDocument",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "OnboardingCompleted",
                table: "Users");
        }
    }
}
