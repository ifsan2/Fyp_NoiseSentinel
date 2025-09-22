-- Role
INSERT INTO [ROLE] (RoleName) VALUES
('Police Officer'),
('Judge');
GO

-- User
INSERT INTO [USER] (FullName, Email, Username, PasswordHash, RoleID) VALUES
('Ali Raza', 'ali.raza@example.com', 'ali_raza', 'hashed_pwd1', 7),
('Ahmed Khan', 'ahmed.khan@example.com', 'ahmed_khan', 'hashed_pwd2', 8);
GO

-- CourtType
INSERT INTO [COURTTYPE] (CourtTypeName) VALUES
('Session Court'),
('Supreme Court'),
('High Court');
GO

-- COURTS
INSERT INTO [COURT] (CourtName, CourtTypeID, Location, District, Province) VALUES
('Rawalpindi Session Court', 5, 'Ketchri Road', 'Rawalpindi', 'Punjab'),
('Islamabad High Court', 7, 'Blue Area', 'Islamabad', 'Islamabad');
GO

-- JUDGES
INSERT INTO [JUDGE] (UserID, CourtID, CNIC, ContactNo, Rank, ServiceStatus) VALUES
(8, 5, '35202-1234567-9', '0345-1234567', 'Traffic Judge', 1);
GO

-- POLICE STATIONS
INSERT INTO [POLICESTATION] (StationName, StationCode, Location, District, Province, Contact) VALUES
('Banni Traffic Police Station', 'TPS-201', 'Banni', 'Rawalpindi', 'Punjab', '042-111-100200'),
('Aabpara Traffic Police Station', 'TPS-202', 'Aabpara', 'Islamabad', 'Islamabad', '051-2223344');
GO

-- POLICE OFFICERS
INSERT INTO [POLICEOFFICER] (UserID, StationID, CNIC, ContactNo, BadgeNumber, Rank, IsInvestigationOfficer, PostingDate) VALUES
(7, 5, '35201-9876543-2', '0300-1234567', 'TP-301', 'Sub-Inspector', 1, GETDATE());
GO


-- ACCUSED
INSERT INTO [ACCUSED] (FullName, CNIC, City, Province, Address, Contact) VALUES
('Kamran Ali', '42101-1234567-1', 'Islamabad', 'Islamabad', 'F-8, Islamabad', '0333-1122334'),
('Usman Tariq', '61101-9876543-5', 'Rawalpindi', 'Punjab', 'Saddar, Rawalpindi', '0301-5566778');
GO

-- VEHICLES
INSERT INTO [VEHICLE] (Veh_Reg_Year, PlateNumber, Make, Color, ChasisNo, EngineNo, OwnerID) VALUES
('2019-03-15', 'LEB-2025', 'Honda CD-70', 'Red', 'CHB12345', 'ENB98765', 5),
('2021-07-20', 'ICT-9090', 'Suzuki Mehran', 'Silver', 'CHC54321', 'ENC56789', 6);
GO

-- VIOLATIONS
INSERT INTO [VIOLATION] (ViolationType, Description, PenaltyAmount, SectionOfLaw, IsCognizable) VALUES
('Noise Pollution', 'Bike exhaust silencer modified, exceeding 95 dB limit', 3000, 'Section 190-A', 5),
('Emission Violation', 'Vehicle emitting excessive black smoke beyond legal emission limit', 5000, 'Section 191-B', 6);
GO

-- IOT DEVICES
INSERT INTO [IOTDEVICE] (DeviceName, FirmwareVersion, IsCalibrated, PairingDateTime, IsRegistered) VALUES
('Iot-stick', 'v1.2', 1, GETDATE(), 1);
GO

-- EMISSION REPORTS
INSERT INTO [EMISSIONREPORT] (DeviceID, CO, CO2, HC, NOx, SoundLevel_dBA, TestDateTime, Ml_Classification, DigitalSignatureValue) VALUES
(5, 0.7, 11.8, 1.1, 0.4, 102.3, GETDATE(), 'Modified', 'signed_hash_noise'),
(5, 0.7, 11.8, 1.1, 0.4, 102.3, GETDATE(), 'Orignal', 'signed_hash_noise'),
(5, 0.6, 13.2, 1.4, 0.5, 78.0, GETDATE(), 'Damaged', 'signed_hash_emission');
GO

-- CHALLANS
INSERT INTO [CHALLAN] (OfficerID, AccusedID, VehicleID, ViolationID, EmissionReportID, EvidencePath, IssueDateTime, DueDateTime, Status, BankDetails, DigitalSignatureValue) VALUES
(3, 5, 4, 5, 4, 'evidence/noise_car1.jpg', GETDATE(), DATEADD(DAY,7,GETDATE()), 'Pending', 'HBL-Acc-12345', 'signed_hash_noise'),
(3, 6, 5, 6, 6, 'evidence/emission_car1.jpg', GETDATE(), DATEADD(DAY,10,GETDATE()), 'Pending', 'UBL-Acc-67890', 'signed_hash_emission');
GO

-- FIRs
INSERT INTO [FIR] (FIRNo, StationID, ChallanID, DateFiled, FIRDescription, FIRStatus, InformantID, InvestigationReport) VALUES
('FIR-TP-001', 5, 8, GETDATE(), 'Accused caught with illegal car silencer exceeding noise limits.', 'Open', 3, 'Noise pollution under investigation'),
('FIR-TP-002', 6, 9, GETDATE(), 'Accused vehicle found emitting excessive smoke.', 'Open', 3, 'Emission violation under investigation');
GO

-- CASES
INSERT INTO [CASE] (FIRID, JudgeID, CaseNo, CaseType, CaseStatus, HearingDate, Verdict) VALUES
(5, 3, 'C-TP-2025-001', 'Noise Violation Case', 'In Progress', DATEADD(DAY,15,GETDATE()), NULL),
(6, 3, 'C-TP-2025-002', 'Emission Violation Case', 'In Progress', DATEADD(DAY,20,GETDATE()), NULL);
GO

-- CASE STATEMENTS
INSERT INTO [CASESTATEMENT] (CaseID, StatementBy, StatementText, StatementDate) VALUES
(4, 'Police Officer Ahmed Khan', 'The accused car silencer produced noise of 102.3 dB, above legal limit.', GETDATE()),
(5, 'Judge Sara Malik', 'Case is under trial for excessive smoke emission from vehicle.', GETDATE());
GO