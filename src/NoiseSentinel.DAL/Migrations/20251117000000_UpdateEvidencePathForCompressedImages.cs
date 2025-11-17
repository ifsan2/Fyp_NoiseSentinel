using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NoiseSentinel.DAL.Migrations
{
    /// <inheritdoc />
    public partial class UpdateEvidencePathForCompressedImages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Change EvidencePath from nvarchar(255) to nvarchar(max) to store base64 compressed images
            migrationBuilder.AlterColumn<string>(
                name: "EvidencePath",
                table: "CHALLAN",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Revert back to nvarchar(255)
            migrationBuilder.AlterColumn<string>(
                name: "EvidencePath",
                table: "CHALLAN",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);
        }
    }
}
