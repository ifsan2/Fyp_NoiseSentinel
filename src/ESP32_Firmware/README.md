# ESP32 IoT Device Firmware - NoiseSentinel

BLE-enabled ESP32 firmware for noise and emission monitoring in traffic violation detection system.

## 📋 Overview

This firmware powers the IoT sensing devices used by police officers to measure:

- **Noise Levels** (dBA) for silencer violations
- **Emission Gases** (CO, HC, NOx, CO2) for pollution violations

The device communicates with the NoiseSentinel Mobile App via **Bluetooth Low Energy (BLE)** using a JSON-based protocol.

---

## 🔧 Hardware Requirements

### Microcontroller

- **ESP32 DevKit** (or compatible board)
- Minimum 4MB Flash, 520KB SRAM
- Bluetooth 4.2 or higher

### Sensors

#### Noise Monitoring

- **MAX4466** or **MAX9814** Electret Microphone Amplifier
- Connected to GPIO 34 (ADC1_CH6)
- Sensitivity: ~0.006V/Pa
- Frequency Response: 20Hz-20kHz

#### Emission Monitoring

- **MQ-7 Gas Sensor** - Carbon Monoxide (CO) Detection
  - Connected to GPIO 33 (ADC1_CH5)
  - Range: 10-10,000 ppm
  - Warm-up: 30 seconds minimum
- **MQ-2 Gas Sensor** - Hydrocarbon (HC) Detection
  - Connected to GPIO 32 (ADC1_CH4)
  - Range: 300-10,000 ppm (HC/LPG/Smoke)
  - Also detects: Methane, Butane, Propane

### LED Status Indicators

- **Red LED** (GPIO 2) - Not Connected/Pairing
- **Yellow LED** (GPIO 4) - Connected/Idle
- **Green LED** (GPIO 21) - Test in Progress

### Power Supply

- 5V USB or Battery (Li-Ion 3.7V with regulator)
- Typical Current: 100-150mA (idle), 250mA (scanning)

---

## 📁 Project Structure

```
ESP32_Firmware/
├── NoiseSentinel_IoT/
│   ├── NoiseSentinel_IoT.ino    # Main firmware code
│   ├── ble_protocol.h           # BLE communication protocol definitions
│   └── sensor_calibration.h     # Sensor ADC-to-physical-unit conversions
├── .vscode/
│   └── c_cpp_properties.json    # VSCode IntelliSense config
├── README.md                     # This file
└── .gitignore                    # Git ignore rules
```

### File Descriptions

#### `NoiseSentinel_IoT.ino` (908 lines)

Main firmware with:

- BLE server setup and connection management
- Command parser (JSON-based)
- Non-blocking emission test state machine
- Noise measurement with RMS calculation
- LED status control
- Device lifecycle management

#### `ble_protocol.h` (195 lines)

Protocol definitions:

- BLE UUIDs for service and characteristics
- JSON command structures
- Response format specifications
- Protocol constants (MTU, timeouts, modes)

#### `sensor_calibration.h` (273 lines)

Sensor math library:

- dBA calculation from microphone ADC
- CO (ppm) from MQ-7 sensor resistance
- HC (ppm) from MQ-2 sensor resistance
- CO2 estimation from CO ratio
- Smoke detection formulas
- Battery percentage calculation
- Calibration helpers

---

## 🚀 Getting Started

### Prerequisites

1. **Arduino IDE** (v1.8.19 or higher) OR **PlatformIO**
2. **ESP32 Board Support**
   ```
   Arduino IDE → Preferences → Additional Board Manager URLs:
   https://dl.espressif.com/dl/package_esp32_index.json
   ```
3. **Required Libraries** (install via Arduino Library Manager):
   - `ArduinoJson` (v6.21.0 or higher)
   - ESP32 BLE Arduino (included with ESP32 board support)

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd ESP32_Firmware/NoiseSentinel_IoT
   ```

2. **Open in Arduino IDE:**
   - File → Open → `NoiseSentinel_IoT.ino`

3. **Configure Board:**
   - Tools → Board → ESP32 Arduino → ESP32 Dev Module
   - Tools → CPU Frequency → 240MHz (WiFi/BT)
   - Tools → Flash Size → 4MB
   - Tools → Partition Scheme → Default 4MB with spiffs

4. **Select Port:**
   - Tools → Port → (select your ESP32 COM port)

5. **Upload:**
   - Sketch → Upload (Ctrl+U)

### Wiring Diagram

```
ESP32                 Sensors
-------               --------
GPIO 34 (ADC) ───────> MAX4466/MAX9814 OUT
GPIO 33 (ADC) ───────> MQ-7 A0
GPIO 32 (ADC) ───────> MQ-2 A0
GPIO 2  ─────────────> Red LED (+ 220Ω resistor)
GPIO 4  ─────────────> Yellow LED (+ 220Ω resistor)
GPIO 21 ─────────────> Green LED (+ 220Ω resistor)
GND ──────────────────> All sensor GNDs + LED cathodes
3.3V ─────────────────> Microphone VCC
5V ───────────────────> MQ-7 VCC, MQ-2 VCC
```

**Important Notes:**

- MQ sensors require **5V** for heater element
- Microphone requires **3.3V** for analog signal accuracy
- Use 220Ω current-limiting resistors for all LEDs
- Ensure common ground connection

---

## 📡 BLE Communication Protocol

### Device Configuration

- **Device Name:** `IOT-FRM-01`
- **Service UUID:** `0000FFE0-0000-1000-8000-00805F9B34FB`
- **Control Characteristic (Write):** `0000FFE1-0000-1000-8000-00805F9B34FB`
- **Data Characteristic (Notify):** `0000FFE2-0000-1000-8000-00805F9B34FB`

### Commands (Mobile App → ESP32)

#### 1. Start Noise Test

```json
{
  "command": "START_NOISE_TEST",
  "device_id": 1,
  "officer_id": 42,
  "timestamp": "2026-01-30T10:30:00Z"
}
```

**Response:**

```json
{
  "status": "COMPLETED",
  "test_type": "NOISE",
  "device_id": 1,
  "timestamp": "2026-01-30T10:30:05Z",
  "firmware_version": "v1.2.0",
  "battery_level": 87,
  "data": {
    "sound_level_dba": 92.5,
    "co": null,
    "co2": null,
    "hc": null,
    "nox": null,
    "ml_classification": "Excessive Noise - Major Silencer Violation"
  },
  "signature": "SHA256_PLACEHOLDER"
}
```

#### 2. Start Emission Test

```json
{
  "command": "START_EMISSION_TEST",
  "device_id": 1,
  "officer_id": 42,
  "timestamp": "2026-01-30T10:35:00Z"
}
```

**Response (after ~40 seconds):**

```json
{
  "status": "COMPLETED",
  "test_type": "EMISSION",
  "device_id": 1,
  "firmware_version": "v1.2.0",
  "battery_level": 85,
  "data": {
    "sound_level_dba": null,
    "co": 152.3,
    "co2": 11422.5,
    "hc": 245.7,
    "nox": 73.71,
    "ml_classification": "High CO - Exceeds Car Emission Standards"
  },
  "signature": "SHA256_PLACEHOLDER"
}
```

**Progress Updates (during test):**

```json
// Warming phase (0-30s)
{"status": "IN_PROGRESS", "phase": "WARMING", "seconds_remaining": 25}

// Sampling phase (30-40s)
{"status": "IN_PROGRESS", "phase": "SAMPLING", "seconds_remaining": 8}
```

#### 3. Get Device Status

```json
{
  "command": "GET_STATUS"
}
```

**Response:**

```json
{
  "status": "ONLINE",
  "device_id": 1,
  "firmware_version": "v1.2.0",
  "battery_level": 87,
  "calibrated": true,
  "mode": "IDLE",
  "challan_ready": true
}
```

#### 4. Calibrate Sensors

```json
{
  "command": "CALIBRATE",
  "reference_sound": 94.0,
  "reference_co": 50.0,
  "reference_hc": 100.0
}
```

#### 5. Challan Created Notification

```json
{
  "command": "CHALLAN_CREATED",
  "device_id": 1,
  "violation_type": "Noise Violation",
  "timestamp": "2026-01-30T10:25:00Z"
}
```

---

## 🎯 Device Modes & LED Status

| LED Status   | Meaning                               | Mode                            |
| ------------ | ------------------------------------- | ------------------------------- |
| 🔴 Red ON    | Not connected, waiting for mobile app | `IDLE` (unpaired)               |
| 🟡 Yellow ON | Connected to mobile app, ready        | `IDLE` (paired)                 |
| 🟢 Green ON  | Test in progress (noise/emission)     | `NOISE_TEST` or `EMISSION_TEST` |
| 🟡 Blinking  | Challan created, ready for test       | `IDLE` (challan ready)          |

---

## 🔬 Sensor Calibration

### Noise Sensor (MAX4466/MAX9814)

**Theory:**

```
dBA = 20 × log₁₀(V_measured / V_reference) + Calibration_Offset
```

**Calibration Steps:**

1. Use a **94 dBA calibrator** (standard SPL reference)
2. Measure RMS voltage output
3. Adjust `REFERENCE_VOLTAGE` in `sensor_calibration.h`
4. Typical value: 0.00631V for 94 dBA

**Default Settings:**

- Reference: 0.00631V @ 94 dBA
- Calibration Offset: 0 dB
- Range: 30-130 dBA

### MQ-7 (CO Sensor)

**Theory:**

```
ppm = 10^((log₁₀(Rs/R0) - B) / M)
```

Where:

- `Rs` = Sensor resistance in target gas
- `R0` = Sensor resistance in clean air
- `M` = Slope of characteristic curve (-0.35)
- `B` = Intercept (0.99)

**Calibration Steps:**

1. Warm up sensor for **48 hours** in clean air
2. Measure ADC value in clean air
3. Calculate R0 using `calculateR0()` function
4. Update `MQ7_R0` constant

**Pakistan Emission Standards:**

- Cars (Petrol): < 0.5% (5000 ppm)
- Motorcycles: < 4.5% (45000 ppm)

### MQ-2 (HC Sensor)

**Configuration:**

- Slope: -0.45
- Intercept: 1.30
- Range: 300-10,000 ppm

**Pakistan Standards:**

- Cars: < 200 ppm
- Motorcycles: < 12,000 ppm

---

## 🧪 Testing & Validation

### Noise Test (10 seconds)

1. Device takes 800 samples at 8kHz
2. Removes DC offset
3. Calculates RMS voltage
4. Converts to dBA using calibration
5. Classifies violation severity

**Classification Thresholds:**

- ≥ 95 dBA: Severe Violation
- ≥ 90 dBA: Major Violation
- ≥ 85 dBA: Bike Violation
- ≥ 80 dBA: Car Violation
- < 80 dBA: Compliant

### Emission Test (40 seconds)

1. **Warming Phase (30s):** Sensor heater stabilization
2. **Sampling Phase (10s):** 200 samples at 50ms intervals
3. **Analysis:** Averaging valid samples, outlier rejection
4. **Classification:** Based on Pakistan EURO-2 standards

**Valid Sample Criteria:**

- 0 < CO < 10,000 ppm
- 0 < HC < 10,000 ppm
- Non-NaN values

---

## 🐛 Troubleshooting

### Device Not Connecting

- **Check:** BLE is enabled on mobile device
- **Check:** Device name is "IOT-FRM-01"
- **Fix:** Reset ESP32, verify red LED is blinking

### Erratic Sensor Readings

- **MQ Sensors:** Ensure 30-second warm-up before first test
- **Microphone:** Check 3.3V supply (not 5V!)
- **Fix:** Run calibration command

### BLE Disconnects During Test

- **Cause:** Weak signal or interference
- **Fix:** Stay within 3 meters of device
- **Fix:** Disable WiFi on ESP32 (BLE only mode)

### High Emission Readings in Clean Air

- **MQ-7/MQ-2:** Requires 48-hour burn-in period
- **Fix:** Recalibrate R0 in clean air environment
- **Fix:** Check sensor heater voltage (should be 5V)

### Noise Values Stuck at 30 or 130 dBA

- **Cause:** Signal clipping or microphone disconnected
- **Fix:** Check wiring, verify 3.3V supply
- **Fix:** Adjust `REFERENCE_VOLTAGE` constant

---

## 📊 Serial Monitor Output

Enable Serial Monitor (115200 baud) for debugging:

```
===========================================
  NoiseSentinel IoT Device
  Firmware: v1.2.0
===========================================
  LED Status:
    Red    (Pin 2) - Not Connected
    Yellow (Pin 4) - Connected/Paired
    Green  (Pin 21) - Scanning
===========================================
✅ BLE advertising started
📡 Device name: IOT-FRM-01
🔗 Waiting for mobile app connection...
🔴 Red LED ON - Waiting for connection...

✅ Mobile app connected
📥 Received command: {"command":"START_NOISE_TEST",...}
🔧 Processing: START_NOISE_TEST
🔊 Starting noise test...
📊 Sampling phase started
✅ Noise test complete: 92.5 dBA
📤 Sending response (387 bytes)
```

---

## 🔐 Security Considerations

- **Data Integrity:** SHA256 signature placeholder for future implementation
- **BLE Security:** No encryption (future: BLE pairing/bonding)
- **Command Validation:** JSON schema validation before processing
- **State Protection:** Challan must be created before tests
- **Disconnect Handling:** Test state resets on disconnect

---

## 🚧 Known Limitations

1. **NOx Estimation:** Calculated as 30% of HC (no direct sensor)
2. **CO2 Estimation:** Derived from CO ratio (75:1)
3. **Signature:** Placeholder only (no cryptographic signing yet)
4. **Battery Monitoring:** Mock value (hardware ADC not implemented)
5. **Calibration Persistence:** Not saved to EEPROM (resets on power cycle)

---

## 🔄 Firmware Updates

### Version History

**v1.2.0** (Current)

- Non-blocking emission test with state machine
- Progress heartbeat notifications every 3 seconds
- LED status indicators (red/yellow/green)
- Improved BLE stability with chunked responses

**v1.1.0**

- Added challan creation requirement
- Enhanced JSON protocol
- Violation classification logic

**v1.0.0**

- Initial release
- Basic BLE communication
- Sensor reading functions

### Updating Firmware

1. Download latest `.ino` file from repository
2. Open in Arduino IDE
3. Verify board settings match current configuration
4. Upload via USB

---

## 📖 References

### Datasheets

- [MAX9814 Microphone Amplifier](https://www.maximintegrated.com/en/products/analog/audio/MAX9814.html)
- [MQ-7 CO Sensor](https://www.sparkfun.com/datasheets/Sensors/Biometric/MQ-7.pdf)
- [MQ-2 Gas Sensor](https://www.pololu.com/file/0J309/MQ2.pdf)
- [ESP32 Technical Reference](https://www.espressif.com/sites/default/files/documentation/esp32_technical_reference_manual_en.pdf)

### Standards

- Pakistan Motor Vehicle Rules (Noise Limits)
- Pakistan EURO-2 Emission Standards
- ISO 1999 - Acoustics Standards
- BLE Core Specification 4.2

---

## 👥 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/sensor-improvement`)
3. Test on actual hardware
4. Commit changes (`git commit -m 'Add MQ-135 NOx sensor support'`)
5. Push to branch (`git push origin feature/sensor-improvement`)
6. Open Pull Request

---

## 📄 License

Part of NoiseSentinel Traffic Management System.  
See main repository for license information.

---

## 💬 Support

For issues related to:

- **Hardware Setup:** Check wiring diagram and power requirements
- **BLE Connection:** See troubleshooting section
- **Sensor Calibration:** Review calibration procedures
- **Mobile App Integration:** See MobileApp README.md

**Serial Monitor Debugging:** Enable 115200 baud for detailed logs.
