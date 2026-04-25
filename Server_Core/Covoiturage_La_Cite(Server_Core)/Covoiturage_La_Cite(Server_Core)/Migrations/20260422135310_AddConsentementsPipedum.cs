using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Covoiturage_La_Cite_Server_Core_.Migrations
{
    /// <inheritdoc />
    public partial class AddConsentementsPipedum : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "consentements_pipeda",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    consentement_partage_donnees = table.Column<bool>(type: "boolean", nullable: false),
                    consentement_geolocalisation = table.Column<bool>(type: "boolean", nullable: false),
                    consentement_marketing = table.Column<bool>(type: "boolean", nullable: false),
                    consentement_analyse_comportement = table.Column<bool>(type: "boolean", nullable: false),
                    version_politique = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    date_consentement = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    ip_consentement = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_consentements_pipeda", x => x.id);
                    table.ForeignKey(
                        name: "FK_consentements_pipeda_Users_user_id",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "idx_consent_user",
                table: "consentements_pipeda",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "idx_consent_version",
                table: "consentements_pipeda",
                column: "version_politique");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "consentements_pipeda");
        }
    }
}
