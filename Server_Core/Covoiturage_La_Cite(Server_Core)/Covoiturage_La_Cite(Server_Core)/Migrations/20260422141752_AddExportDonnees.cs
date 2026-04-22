using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Covoiturage_La_Cite_Server_Core_.Migrations
{
    /// <inheritdoc />
    public partial class AddExportDonnees : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "exports_donnees",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    type_export = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    tables_exportees_json = table.Column<string>(type: "jsonb", nullable: true),
                    fichier_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    statut = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    date_demande = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    date_completion = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    date_expiration_lien = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_exports_donnees", x => x.id);
                    table.ForeignKey(
                        name: "FK_exports_donnees_Users_user_id",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "idx_exports_statut",
                table: "exports_donnees",
                column: "statut");

            migrationBuilder.CreateIndex(
                name: "idx_exports_user",
                table: "exports_donnees",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "exports_donnees");
        }
    }
}
