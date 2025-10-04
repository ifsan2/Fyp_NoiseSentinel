using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NoiseSentinel.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddAdminRoleSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ACCUSED",
                columns: table => new
                {
                    AccusedID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FullName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    CNIC = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    City = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Province = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Address = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Contact = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ACCUSED", x => x.AccusedID);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "COURTTYPE",
                columns: table => new
                {
                    CourtTypeID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CourtTypeName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_COURTTYPE", x => x.CourtTypeID);
                });

            migrationBuilder.CreateTable(
                name: "IOTDEVICE",
                columns: table => new
                {
                    DeviceID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DeviceName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    FirmwareVersion = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsCalibrated = table.Column<bool>(type: "bit", nullable: true),
                    PairingDateTime = table.Column<DateTime>(type: "datetime", nullable: true),
                    IsRegistered = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IOTDEVICE", x => x.DeviceID);
                });

            migrationBuilder.CreateTable(
                name: "POLICESTATION",
                columns: table => new
                {
                    StationID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StationName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    StationCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Location = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    District = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Province = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Contact = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_POLICESTATION", x => x.StationID);
                });

            migrationBuilder.CreateTable(
                name: "ROLE",
                columns: table => new
                {
                    RoleID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ROLE", x => x.RoleID);
                });

            migrationBuilder.CreateTable(
                name: "VIOLATION",
                columns: table => new
                {
                    ViolationID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ViolationType = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    PenaltyAmount = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    SectionOfLaw = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    IsCognizable = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VIOLATION", x => x.ViolationID);
                });

            migrationBuilder.CreateTable(
                name: "VEHICLE",
                columns: table => new
                {
                    VehicleID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Veh_Reg_Year = table.Column<DateTime>(type: "datetime", nullable: true),
                    PlateNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Make = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Color = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ChasisNo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    EngineNo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    OwnerID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VEHICLE", x => x.VehicleID);
                    table.ForeignKey(
                        name: "FK_VEHICLE_ACCUSED_OwnerID",
                        column: x => x.OwnerID,
                        principalTable: "ACCUSED",
                        principalColumn: "AccusedID");
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleId = table.Column<int>(type: "int", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "COURT",
                columns: table => new
                {
                    CourtID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CourtName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    CourtTypeID = table.Column<int>(type: "int", nullable: true),
                    Location = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    District = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Province = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_COURT", x => x.CourtID);
                    table.ForeignKey(
                        name: "FK_COURT_COURTTYPE_CourtTypeID",
                        column: x => x.CourtTypeID,
                        principalTable: "COURTTYPE",
                        principalColumn: "CourtTypeID");
                });

            migrationBuilder.CreateTable(
                name: "EMISSIONREPORT",
                columns: table => new
                {
                    EmissionReportID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DeviceID = table.Column<int>(type: "int", nullable: true),
                    CO = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    CO2 = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    HC = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    NOx = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    SoundLevel_dBA = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    TestDateTime = table.Column<DateTime>(type: "datetime", nullable: true),
                    Ml_Classification = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    DigitalSignatureValue = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EMISSIONREPORT", x => x.EmissionReportID);
                    table.ForeignKey(
                        name: "FK_EMISSIONREPORT_IOTDEVICE_DeviceID",
                        column: x => x.DeviceID,
                        principalTable: "IOTDEVICE",
                        principalColumn: "DeviceID");
                });

            migrationBuilder.CreateTable(
                name: "USER",
                columns: table => new
                {
                    UserID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FullName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Username = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    PasswordHash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    RoleID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_USER", x => x.UserID);
                    table.ForeignKey(
                        name: "FK_USER_ROLE_RoleID",
                        column: x => x.RoleID,
                        principalTable: "ROLE",
                        principalColumn: "RoleID");
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_USER_UserId",
                        column: x => x.UserId,
                        principalTable: "USER",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderKey = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_USER_UserId",
                        column: x => x.UserId,
                        principalTable: "USER",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false),
                    RoleId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_USER_UserId",
                        column: x => x.UserId,
                        principalTable: "USER",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false),
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_USER_UserId",
                        column: x => x.UserId,
                        principalTable: "USER",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "JUDGE",
                columns: table => new
                {
                    JudgeID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserID = table.Column<int>(type: "int", nullable: true),
                    CourtID = table.Column<int>(type: "int", nullable: true),
                    CNIC = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    ContactNo = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Rank = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ServiceStatus = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JUDGE", x => x.JudgeID);
                    table.ForeignKey(
                        name: "FK_JUDGE_COURT_CourtID",
                        column: x => x.CourtID,
                        principalTable: "COURT",
                        principalColumn: "CourtID");
                    table.ForeignKey(
                        name: "FK_JUDGE_USER_UserID",
                        column: x => x.UserID,
                        principalTable: "USER",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "POLICEOFFICER",
                columns: table => new
                {
                    OfficerID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserID = table.Column<int>(type: "int", nullable: true),
                    StationID = table.Column<int>(type: "int", nullable: true),
                    CNIC = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    ContactNo = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    BadgeNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Rank = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsInvestigationOfficer = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    PostingDate = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_POLICEOFFICER", x => x.OfficerID);
                    table.ForeignKey(
                        name: "FK_POLICEOFFICER_POLICESTATION_StationID",
                        column: x => x.StationID,
                        principalTable: "POLICESTATION",
                        principalColumn: "StationID");
                    table.ForeignKey(
                        name: "FK_POLICEOFFICER_USER_UserID",
                        column: x => x.UserID,
                        principalTable: "USER",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "CHALLAN",
                columns: table => new
                {
                    ChallanID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OfficerID = table.Column<int>(type: "int", nullable: true),
                    AccusedID = table.Column<int>(type: "int", nullable: true),
                    VehicleID = table.Column<int>(type: "int", nullable: true),
                    ViolationID = table.Column<int>(type: "int", nullable: true),
                    EmissionReportID = table.Column<int>(type: "int", nullable: true),
                    EvidencePath = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    IssueDateTime = table.Column<DateTime>(type: "datetime", nullable: true),
                    DueDateTime = table.Column<DateTime>(type: "datetime", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    BankDetails = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    DigitalSignatureValue = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CHALLAN", x => x.ChallanID);
                    table.ForeignKey(
                        name: "FK_CHALLAN_ACCUSED_AccusedID",
                        column: x => x.AccusedID,
                        principalTable: "ACCUSED",
                        principalColumn: "AccusedID");
                    table.ForeignKey(
                        name: "FK_CHALLAN_EMISSIONREPORT_EmissionReportID",
                        column: x => x.EmissionReportID,
                        principalTable: "EMISSIONREPORT",
                        principalColumn: "EmissionReportID");
                    table.ForeignKey(
                        name: "FK_CHALLAN_POLICEOFFICER_OfficerID",
                        column: x => x.OfficerID,
                        principalTable: "POLICEOFFICER",
                        principalColumn: "OfficerID");
                    table.ForeignKey(
                        name: "FK_CHALLAN_VEHICLE_VehicleID",
                        column: x => x.VehicleID,
                        principalTable: "VEHICLE",
                        principalColumn: "VehicleID");
                    table.ForeignKey(
                        name: "FK_CHALLAN_VIOLATION_ViolationID",
                        column: x => x.ViolationID,
                        principalTable: "VIOLATION",
                        principalColumn: "ViolationID");
                });

            migrationBuilder.CreateTable(
                name: "FIR",
                columns: table => new
                {
                    FIRID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FIRNo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    StationID = table.Column<int>(type: "int", nullable: true),
                    ChallanID = table.Column<int>(type: "int", nullable: true),
                    DateFiled = table.Column<DateTime>(type: "datetime", nullable: true),
                    FIRDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    FIRStatus = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    InformantID = table.Column<int>(type: "int", nullable: true),
                    InvestigationReport = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FIR", x => x.FIRID);
                    table.ForeignKey(
                        name: "FK_FIR_CHALLAN_ChallanID",
                        column: x => x.ChallanID,
                        principalTable: "CHALLAN",
                        principalColumn: "ChallanID");
                    table.ForeignKey(
                        name: "FK_FIR_POLICEOFFICER_InformantID",
                        column: x => x.InformantID,
                        principalTable: "POLICEOFFICER",
                        principalColumn: "OfficerID");
                    table.ForeignKey(
                        name: "FK_FIR_POLICESTATION_StationID",
                        column: x => x.StationID,
                        principalTable: "POLICESTATION",
                        principalColumn: "StationID");
                });

            migrationBuilder.CreateTable(
                name: "CASE",
                columns: table => new
                {
                    CaseID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FIRID = table.Column<int>(type: "int", nullable: true),
                    JudgeID = table.Column<int>(type: "int", nullable: true),
                    CaseNo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CaseType = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    CaseStatus = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    HearingDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    Verdict = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CASE", x => x.CaseID);
                    table.ForeignKey(
                        name: "FK_CASE_FIR_FIRID",
                        column: x => x.FIRID,
                        principalTable: "FIR",
                        principalColumn: "FIRID");
                    table.ForeignKey(
                        name: "FK_CASE_JUDGE_JudgeID",
                        column: x => x.JudgeID,
                        principalTable: "JUDGE",
                        principalColumn: "JudgeID");
                });

            migrationBuilder.CreateTable(
                name: "CASESTATEMENT",
                columns: table => new
                {
                    StatementID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CaseID = table.Column<int>(type: "int", nullable: true),
                    StatementBy = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    StatementText = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StatementDate = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CASESTATEMENT", x => x.StatementID);
                    table.ForeignKey(
                        name: "FK_CASESTATEMENT_CASE_CaseID",
                        column: x => x.CaseID,
                        principalTable: "CASE",
                        principalColumn: "CaseID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true,
                filter: "[NormalizedName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_CASE_FIRID",
                table: "CASE",
                column: "FIRID");

            migrationBuilder.CreateIndex(
                name: "IX_CASE_JudgeID",
                table: "CASE",
                column: "JudgeID");

            migrationBuilder.CreateIndex(
                name: "IX_CASESTATEMENT_CaseID",
                table: "CASESTATEMENT",
                column: "CaseID");

            migrationBuilder.CreateIndex(
                name: "IX_CHALLAN_AccusedID",
                table: "CHALLAN",
                column: "AccusedID");

            migrationBuilder.CreateIndex(
                name: "IX_CHALLAN_EmissionReportID",
                table: "CHALLAN",
                column: "EmissionReportID");

            migrationBuilder.CreateIndex(
                name: "IX_CHALLAN_OfficerID",
                table: "CHALLAN",
                column: "OfficerID");

            migrationBuilder.CreateIndex(
                name: "IX_CHALLAN_VehicleID",
                table: "CHALLAN",
                column: "VehicleID");

            migrationBuilder.CreateIndex(
                name: "IX_CHALLAN_ViolationID",
                table: "CHALLAN",
                column: "ViolationID");

            migrationBuilder.CreateIndex(
                name: "IX_COURT_CourtTypeID",
                table: "COURT",
                column: "CourtTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_EMISSIONREPORT_DeviceID",
                table: "EMISSIONREPORT",
                column: "DeviceID");

            migrationBuilder.CreateIndex(
                name: "IX_FIR_ChallanID",
                table: "FIR",
                column: "ChallanID");

            migrationBuilder.CreateIndex(
                name: "IX_FIR_InformantID",
                table: "FIR",
                column: "InformantID");

            migrationBuilder.CreateIndex(
                name: "IX_FIR_StationID",
                table: "FIR",
                column: "StationID");

            migrationBuilder.CreateIndex(
                name: "IX_JUDGE_CourtID",
                table: "JUDGE",
                column: "CourtID");

            migrationBuilder.CreateIndex(
                name: "IX_JUDGE_UserID",
                table: "JUDGE",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_POLICEOFFICER_StationID",
                table: "POLICEOFFICER",
                column: "StationID");

            migrationBuilder.CreateIndex(
                name: "IX_POLICEOFFICER_UserID",
                table: "POLICEOFFICER",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_ROLE_RoleName",
                table: "ROLE",
                column: "RoleName",
                unique: true,
                filter: "[RoleName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "USER",
                column: "Email",
                unique: true,
                filter: "[Email] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_USER_RoleID",
                table: "USER",
                column: "RoleID");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "USER",
                column: "Username",
                unique: true,
                filter: "[Username] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_VEHICLE_OwnerID",
                table: "VEHICLE",
                column: "OwnerID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "CASESTATEMENT");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "CASE");

            migrationBuilder.DropTable(
                name: "FIR");

            migrationBuilder.DropTable(
                name: "JUDGE");

            migrationBuilder.DropTable(
                name: "CHALLAN");

            migrationBuilder.DropTable(
                name: "COURT");

            migrationBuilder.DropTable(
                name: "EMISSIONREPORT");

            migrationBuilder.DropTable(
                name: "POLICEOFFICER");

            migrationBuilder.DropTable(
                name: "VEHICLE");

            migrationBuilder.DropTable(
                name: "VIOLATION");

            migrationBuilder.DropTable(
                name: "COURTTYPE");

            migrationBuilder.DropTable(
                name: "IOTDEVICE");

            migrationBuilder.DropTable(
                name: "POLICESTATION");

            migrationBuilder.DropTable(
                name: "USER");

            migrationBuilder.DropTable(
                name: "ACCUSED");

            migrationBuilder.DropTable(
                name: "ROLE");
        }
    }
}
