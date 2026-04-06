using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Covoiturage_La_Cite_Server_Core_.Migrations
{
    /// <inheritdoc />
    public partial class AddIdentityVerificationFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string[]>(
                name: "IdentityVerificationPhotos",
                table: "Users",
                type: "text[]",
                nullable: false,
                defaultValue: new string[0]);

            migrationBuilder.AddColumn<bool>(
                name: "IdentityVerified",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IdentityVerificationPhotos",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IdentityVerified",
                table: "Users");
        }
    }
}
