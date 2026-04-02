using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class AddSchoolRoleToUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SchoolRole",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SchoolRole",
                table: "Users");
        }
    }
}
