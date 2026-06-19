/*
 * NoiseSentinel IoT Device Firmware
 * BLE-enabled ESP32 for noise and emission monitoring
 *
 * Features:
 * - BLE communication with mobile app
 * - Noise level measurement (MAX4466/MAX9814)
 * - Emission testing (MQ-7 CO, MQ-2 HC/NOx)
 * - LED status indicators
 * - JSON command/response protocol
 */

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <ArduinoJson.h>
#include <Preferences.h>
#include "ble_protocol.h"
#include "sensor_calibration.h"

// ============================================================================
// PIN DEFINITIONS
// ============================================================================
#define MIC_PIN 34 // MAX4466 or MAX9814 microphone
#define MQ7_PIN 32 // MQ-7 (CO sensor)
#define MQ2_PIN 35 // MQ-2 (HC/NOx sensor)

// LED Status Indicators
#define LED_RED_PIN 12    // Red LED - Not connected/paired
#define LED_YELLOW_PIN 14 // Yellow LED - Connected/paired (idle)
#define LED_GREEN_PIN 27  // Green LED - Scanning in progress

// Legacy alias for compatibility
#define LED_PIN LED_RED_PIN

// ============================================================================
// BLE OBJECTS
// ============================================================================
BLEServer *bleServer = nullptr;
BLECharacteristic *controlCharacteristic = nullptr;
BLECharacteristic *dataCharacteristic = nullptr;
bool deviceConnected = false;
bool oldDeviceConnected = false;

// ============================================================================
// DEVICE STATE
// ============================================================================
String deviceMode = MODE_IDLE_STR;
int deviceId = 1;            // Default device ID
bool challanCreated = false; // Track if challan notification received
String currentViolationType = "";

// Realtime streaming (detection mode)
bool realtimeStreaming = false;
unsigned long lastStreamAt = 0;
const unsigned long STREAM_INTERVAL_MS = 500;
const int STREAM_GAS_SAMPLES = 5;

// Firmware info
const String FIRMWARE_VERSION = "v1.2.0";
const int BATTERY_LEVEL = 85; // Mock value (implement actual battery reading if needed)

// ============================================================================
// CALIBRATION STORAGE
// ============================================================================
Preferences prefs;
const char *PREFS_NAMESPACE = "NoiseSentinel";
const char *KEY_SOUND_OFFSET = "sound_offset";
const char *KEY_MQ7_R0 = "mq7_r0";
const char *KEY_MQ2_R0 = "mq2_r0";

float soundOffsetDb = 0.0f;
float mq7R0 = MQ7_R0_DEFAULT;
float mq2R0 = MQ2_R0_DEFAULT;

// ============================================================================
// NON-BLOCKING EMISSION TEST STATE MACHINE
// ============================================================================
enum EmissionTestState
{
    EMISSION_IDLE,
    EMISSION_WARMING,
    EMISSION_SAMPLING,
    EMISSION_COMPLETE
};

EmissionTestState emissionState = EMISSION_IDLE;
unsigned long emissionStartTime = 0;
unsigned long lastHeartbeatTime = 0;
int emissionWarmupSeconds = 0;
int emissionOfficerId = 0;

// Sampling state
float emissionCoSum = 0, emissionHcSum = 0;
int emissionValidCO = 0, emissionValidHC = 0;
int emissionSampleCount = 0;
const int EMISSION_TOTAL_SAMPLES = 200;
unsigned long lastSampleTime = 0;

// Forward declarations
void handleCommand(const char *jsonCommand);
void handleChallanCreated(JsonDocument &doc);
void handleStartNoiseTest(JsonDocument &doc);
void handleStartEmissionTest(JsonDocument &doc);
void handleStartRealtimeStream(JsonDocument &doc);
void handleStopRealtimeStream(JsonDocument &doc);
void sendJsonResponse(JsonDocument &doc);
void sendErrorResponse(String message);
float measureNoiseLevel();
float measureNoiseLevelWithOffset(float offsetDb);
void measureEmissions(float &co, float &hc, float &nox);
float readAverageVoltage(int pin, int samples);
float calculateR0FromPpm(float rs, float ppm, float m, float b);
String classifyNoise(float dba);
String classifyEmission(float co, float hc);
void handleGetStatus(JsonDocument &doc);
void handleCalibrate(JsonDocument &doc);
void processEmissionTest();
void processRealtimeStream();

// LED status helper functions
void setLedStatus(bool red, bool yellow, bool green);
void setLedDisconnected(); // Red ON, others OFF
void setLedConnected();    // Yellow ON, others OFF
void setLedScanning();     // Green ON, others OFF
void blinkLed(int pin, int times, int delayMs);

// ============================================================================
// LED STATUS FUNCTIONS
// ============================================================================
void setLedStatus(bool red, bool yellow, bool green)
{
    digitalWrite(LED_RED_PIN, red ? HIGH : LOW);
    digitalWrite(LED_YELLOW_PIN, yellow ? HIGH : LOW);
    digitalWrite(LED_GREEN_PIN, green ? HIGH : LOW);
}

void setLedDisconnected()
{
    // Red LED ON - device not connected/paired
    setLedStatus(true, false, false);
}

void setLedConnected()
{
    // Yellow LED ON - device connected/paired (idle)
    setLedStatus(false, true, false);
}

void setLedScanning()
{
    // Green LED ON - scanning in progress
    setLedStatus(false, false, true);
}

void blinkLed(int pin, int times, int delayMs)
{
    for (int i = 0; i < times; i++)
    {
        digitalWrite(pin, HIGH);
        delay(delayMs);
        digitalWrite(pin, LOW);
        delay(delayMs);
    }
}

// ============================================================================
// BLE SERVER CALLBACKS
// ============================================================================
class ServerCallbacks : public BLEServerCallbacks
{
    void onConnect(BLEServer *server)
    {
        deviceConnected = true;
        setLedConnected(); // Yellow LED - connected/paired
        Serial.println("✅ Mobile app connected");
    }

    void onDisconnect(BLEServer *server)
    {
        deviceConnected = false;
        setLedDisconnected(); // Red LED - not connected
        Serial.println("❌ Mobile app disconnected");

        // Reset challan state on disconnect
        challanCreated = false;
        currentViolationType = "";
        deviceMode = MODE_IDLE_STR;
        realtimeStreaming = false;
    }
};

// ============================================================================
// CONTROL CHARACTERISTIC CALLBACKS (Receive commands)
// ============================================================================
class ControlCallbacks : public BLECharacteristicCallbacks
{
    void onWrite(BLECharacteristic *characteristic)
    {
        String value = String(characteristic->getValue().c_str());
        if (value.length() > 0)
        {
            Serial.println("📥 Received command: " + value);
            handleCommand(value.c_str());
        }
    }
};

// ============================================================================
// COMMAND HANDLER
// ============================================================================
void handleCommand(const char *jsonCommand)
{
    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, jsonCommand);

    if (error)
    {
        Serial.println("❌ JSON parsing failed: " + String(error.c_str()));
        sendErrorResponse("Invalid JSON format");
        return;
    }

    String command = doc["command"].as<String>();
    Serial.println("🔧 Processing: " + command);

    if (command == "CHALLAN_CREATED")
    {
        handleChallanCreated(doc);
    }
    else if (command == "START_NOISE_TEST")
    {
        handleStartNoiseTest(doc);
    }
    else if (command == "START_EMISSION_TEST")
    {
        handleStartEmissionTest(doc);
    }
    else if (command == "START_REALTIME_STREAM")
    {
        handleStartRealtimeStream(doc);
    }
    else if (command == "STOP_REALTIME_STREAM")
    {
        handleStopRealtimeStream(doc);
    }
    else if (command == "GET_STATUS")
    {
        handleGetStatus(doc);
    }
    else if (command == "CALIBRATE")
    {
        handleCalibrate(doc);
    }
    else if (command == "PING")
    {
        // Keep-alive ping from mobile app - just log it, no response needed
        Serial.println("💓 PING received (keep-alive)");
    }
    else
    {
        sendErrorResponse("Unknown command: " + command);
    }
}

// ============================================================================
// COMMAND: CHALLAN_CREATED
// ============================================================================
void handleChallanCreated(JsonDocument &doc)
{
    deviceId = doc["device_id"] | deviceId;
    currentViolationType = doc["violation_type"].as<String>();

    // Set flag to allow emission/noise tests
    challanCreated = true;

    Serial.println("✅ Challan created for: " + currentViolationType);

    // Send acknowledgment
    StaticJsonDocument<256> response;
    response["status"] = "CHALLAN_ACKNOWLEDGED";
    response["device_id"] = deviceId;
    response["violation_type"] = currentViolationType;
    response["timestamp"] = doc["timestamp"].as<String>();

    sendJsonResponse(response);

    // Blink yellow LED to indicate challan ready
    blinkLed(LED_YELLOW_PIN, 3, 200);
    setLedConnected(); // Back to yellow (connected/paired)
}

// ============================================================================
// COMMAND: START_NOISE_TEST
// ============================================================================
void handleStartNoiseTest(JsonDocument &doc)
{
    if (!challanCreated)
    {
        sendErrorResponse("No challan created. Create challan first.");
        return;
    }

    if (realtimeStreaming)
    {
        realtimeStreaming = false;
        deviceMode = MODE_IDLE_STR;
    }

    deviceMode = MODE_NOISE_TEST_STR;
    deviceId = doc["device_id"] | deviceId;
    int officerId = doc["officer_id"] | 0;

    Serial.println("🔊 Starting noise test...");
    setLedScanning(); // Green LED - scanning in progress

    // Send sampling phase update
    if (deviceConnected && dataCharacteristic != nullptr)
    {
        StaticJsonDocument<128> samplingUpdate;
        samplingUpdate["status"] = "IN_PROGRESS";
        samplingUpdate["phase"] = "SAMPLING";
        samplingUpdate["seconds_remaining"] = 10; // ~10 seconds for 800 samples

        String output;
        serializeJson(samplingUpdate, output);
        dataCharacteristic->setValue(output.c_str());
        dataCharacteristic->notify();
        Serial.println("📊 Sampling phase started");
        delay(10);
    }

    // Perform noise measurement
    float soundLevel = measureNoiseLevel();
    String classification = classifyNoise(soundLevel);

    // Build response
    StaticJsonDocument<512> response;
    response["status"] = "COMPLETED";
    response["test_type"] = "NOISE";
    response["device_id"] = deviceId;
    response["timestamp"] = doc["timestamp"].as<String>();
    response["firmware_version"] = FIRMWARE_VERSION;
    response["battery_level"] = BATTERY_LEVEL;

    JsonObject data = response.createNestedObject("data");
    data["sound_level_dba"] = soundLevel;
    data["co"] = nullptr;
    data["co2"] = nullptr;
    data["hc"] = nullptr;
    data["nox"] = nullptr;
    data["ml_classification"] = classification;

    response["signature"] = "SHA256_PLACEHOLDER";

    sendJsonResponse(response);

    deviceMode = MODE_IDLE_STR;
    setLedConnected(); // Yellow LED - back to connected/paired state
    Serial.println("✅ Noise test complete: " + String(soundLevel) + " dBA");
}

// ============================================================================
// COMMAND: START_EMISSION_TEST (Non-blocking version)
// ============================================================================
void handleStartEmissionTest(JsonDocument &doc)
{
    if (!challanCreated)
    {
        sendErrorResponse("No challan created. Create challan first.");
        return;
    }

    if (realtimeStreaming)
    {
        realtimeStreaming = false;
        deviceMode = MODE_IDLE_STR;
    }

    // Already running a test?
    if (emissionState != EMISSION_IDLE)
    {
        sendErrorResponse("Emission test already in progress");
        return;
    }

    deviceMode = MODE_EMISSION_TEST_STR;
    deviceId = doc["device_id"] | deviceId;
    emissionOfficerId = doc["officer_id"] | 0;

    Serial.println("💨 Starting emission test (non-blocking)...");
    setLedScanning(); // Green LED - scanning in progress

    // Initialize state machine
    emissionState = EMISSION_WARMING;
    emissionStartTime = millis();
    lastHeartbeatTime = millis();
    emissionWarmupSeconds = 0;

    // Reset sampling state
    emissionCoSum = 0;
    emissionHcSum = 0;
    emissionValidCO = 0;
    emissionValidHC = 0;
    emissionSampleCount = 0;
    lastSampleTime = 0;

    // Send immediate acknowledgment
    if (deviceConnected && dataCharacteristic != nullptr)
    {
        StaticJsonDocument<128> ack;
        ack["status"] = "IN_PROGRESS";
        ack["phase"] = "WARMING";
        ack["seconds_remaining"] = 30;

        String ackOutput;
        serializeJson(ack, ackOutput);
        Serial.println("📤 Sending immediate ACK: " + ackOutput);
        dataCharacteristic->setValue(ackOutput.c_str());
        dataCharacteristic->notify();
    }

    Serial.println("⏳ Warming up sensors (non-blocking)...");
}

// ============================================================================
// COMMAND: START_REALTIME_STREAM / STOP_REALTIME_STREAM
// ============================================================================
void handleStartRealtimeStream(JsonDocument &doc)
{
    if (emissionState != EMISSION_IDLE || deviceMode == MODE_NOISE_TEST_STR ||
        deviceMode == MODE_EMISSION_TEST_STR || deviceMode == MODE_CALIBRATION_STR)
    {
        sendErrorResponse("Device busy. Try again when idle.");
        return;
    }

    if (!deviceConnected || dataCharacteristic == nullptr)
    {
        sendErrorResponse("Device not connected");
        return;
    }

    deviceId = doc["device_id"] | deviceId;
    deviceMode = MODE_DETECTION_STR;
    realtimeStreaming = true;
    lastStreamAt = 0;

    setLedScanning(); // Green LED - realtime detection
    Serial.println("📡 Realtime streaming started");

    StaticJsonDocument<128> response;
    response["status"] = STATUS_STREAM;
    response["type"] = "STREAM_STARTED";
    response["device_id"] = deviceId;
    sendJsonResponse(response);
}

void handleStopRealtimeStream(JsonDocument &doc)
{
    if (!realtimeStreaming)
    {
        return;
    }

    deviceId = doc["device_id"] | deviceId;
    realtimeStreaming = false;
    deviceMode = MODE_IDLE_STR;
    setLedConnected();
    Serial.println("🛑 Realtime streaming stopped");

    StaticJsonDocument<128> response;
    response["status"] = STATUS_STREAM;
    response["type"] = "STREAM_STOPPED";
    response["device_id"] = deviceId;
    sendJsonResponse(response);
}

// ============================================================================
// EMISSION TEST STATE MACHINE (called from loop)
// ============================================================================
void processEmissionTest()
{
    if (emissionState == EMISSION_IDLE)
        return;

    unsigned long now = millis();

    // ========== WARMING PHASE (30 seconds) ==========
    if (emissionState == EMISSION_WARMING)
    {
        int elapsedSeconds = (now - emissionStartTime) / 1000;

        // Blink green LED during warming
        digitalWrite(LED_GREEN_PIN, (elapsedSeconds % 2 == 0) ? HIGH : LOW);

        // Send heartbeat every 3 seconds
        if (now - lastHeartbeatTime >= 3000)
        {
            lastHeartbeatTime = now;
            int remaining = 30 - elapsedSeconds;

            if (deviceConnected && dataCharacteristic != nullptr)
            {
                StaticJsonDocument<128> heartbeat;
                heartbeat["status"] = "IN_PROGRESS";
                heartbeat["phase"] = "WARMING";
                heartbeat["seconds_remaining"] = remaining > 0 ? remaining : 0;

                String output;
                serializeJson(heartbeat, output);
                dataCharacteristic->setValue(output.c_str());
                dataCharacteristic->notify();
                Serial.println("💓 Heartbeat: " + String(remaining) + "s remaining");
            }
        }

        // Check if warming complete
        if (elapsedSeconds >= 30)
        {
            Serial.println("📊 Warming complete, starting sampling...");
            emissionState = EMISSION_SAMPLING;
            emissionStartTime = now; // Reset for sampling phase
            lastSampleTime = now;
            setLedScanning(); // Green LED solid during sampling

            // Notify sampling start
            if (deviceConnected && dataCharacteristic != nullptr)
            {
                StaticJsonDocument<128> samplingStart;
                samplingStart["status"] = "IN_PROGRESS";
                samplingStart["phase"] = "SAMPLING";
                samplingStart["seconds_remaining"] = 10;

                String output;
                serializeJson(samplingStart, output);
                dataCharacteristic->setValue(output.c_str());
                dataCharacteristic->notify();
            }
        }
    }

    // ========== SAMPLING PHASE (200 samples @ 50ms = 10 seconds) ==========
    else if (emissionState == EMISSION_SAMPLING)
    {
        // Take a sample every 50ms
        if (now - lastSampleTime >= 50)
        {
            lastSampleTime = now;

            // Read MQ-7 (CO)
            int mq7Raw = analogRead(MQ7_PIN);
            float coValue = calculateCO_ppm(mq7Raw, mq7R0);
            if (!isnan(coValue) && coValue > 0 && coValue < 10000)
            {
                emissionCoSum += coValue;
                emissionValidCO++;
            }

            // Read MQ-2 (HC)
            int mq2Raw = analogRead(MQ2_PIN);
            float hcValue = calculateHC_ppm(mq2Raw, mq2R0);
            if (!isnan(hcValue) && hcValue > 0 && hcValue < 10000)
            {
                emissionHcSum += hcValue;
                emissionValidHC++;
            }

            emissionSampleCount++;

            // Log every 50 samples
            if (emissionSampleCount % 50 == 0)
            {
                Serial.println("Sample " + String(emissionSampleCount) + "/" + String(EMISSION_TOTAL_SAMPLES));
            }

            // Check if sampling complete
            if (emissionSampleCount >= EMISSION_TOTAL_SAMPLES)
            {
                emissionState = EMISSION_COMPLETE;
            }
        }
    }

    // ========== COMPLETE - SEND RESULTS ==========
    else if (emissionState == EMISSION_COMPLETE)
    {
        // Calculate averages
        float coAvg = (emissionValidCO > 0) ? (emissionCoSum / emissionValidCO) : 0.0;
        float hcAvg = (emissionValidHC > 0) ? (emissionHcSum / emissionValidHC) : 0.0;
        float noxValue = hcAvg * 0.3;
        float co2Value = estimateCO2(coAvg);

        Serial.println("📈 Results:");
        Serial.println("  CO: " + String(coAvg, 2) + " ppm (" + String(emissionValidCO) + "/" + String(EMISSION_TOTAL_SAMPLES) + " valid samples)");
        Serial.println("  HC: " + String(hcAvg, 2) + " ppm (" + String(emissionValidHC) + "/" + String(EMISSION_TOTAL_SAMPLES) + " valid samples)");
        Serial.println("  NOx (estimated): " + String(noxValue, 2) + " ppm");

        String classification = classifyEmission(coAvg, hcAvg);

        // Build response
        StaticJsonDocument<512> response;
        response["status"] = "COMPLETED";
        response["test_type"] = "EMISSION";
        response["device_id"] = deviceId;
        response["firmware_version"] = FIRMWARE_VERSION;
        response["battery_level"] = BATTERY_LEVEL;

        JsonObject data = response.createNestedObject("data");
        data["sound_level_dba"] = nullptr;
        data["co"] = coAvg;
        data["co2"] = co2Value;
        data["hc"] = hcAvg;
        data["nox"] = noxValue;
        data["ml_classification"] = classification;

        response["signature"] = "SHA256_PLACEHOLDER";

        Serial.print("🔗 Connection status before sending: deviceConnected=");
        Serial.println(deviceConnected ? "true" : "false");

        sendJsonResponse(response);

        // Reset state
        emissionState = EMISSION_IDLE;
        deviceMode = MODE_IDLE_STR;
        setLedConnected(); // Yellow LED - back to connected/paired state
        Serial.println("✅ Emission test complete");
    }
}

// ============================================================================
// REALTIME STREAMING (called from loop)
// ============================================================================
void processRealtimeStream()
{
    if (!realtimeStreaming)
    {
        return;
    }

    if (!deviceConnected)
    {
        realtimeStreaming = false;
        deviceMode = MODE_IDLE_STR;
        return;
    }

    if (emissionState != EMISSION_IDLE)
    {
        return;
    }

    unsigned long now = millis();
    if (now - lastStreamAt < STREAM_INTERVAL_MS)
    {
        return;
    }

    lastStreamAt = now;

    float soundLevel = measureNoiseLevel();

    int mq7Raw = getAverageReading(MQ7_PIN, STREAM_GAS_SAMPLES);
    float coValue = calculateCO_ppm(mq7Raw, mq7R0);

    int mq2Raw = getAverageReading(MQ2_PIN, STREAM_GAS_SAMPLES);
    float hcValue = calculateHC_ppm(mq2Raw, mq2R0);

    float noxValue = (isfinite(hcValue) && hcValue > 0.0f) ? (hcValue * 0.3f) : 0.0f;
    float co2Value = (isfinite(coValue) && coValue > 0.0f) ? estimateCO2(coValue) : 0.0f;

    StaticJsonDocument<256> response;
    response["status"] = STATUS_STREAM;
    response["type"] = "SENSOR_DATA";
    response["device_id"] = deviceId;
    response["timestamp_ms"] = now;

    JsonObject data = response.createNestedObject("data");
    data["sound_level_dba"] = soundLevel;
    if (isfinite(coValue))  data["co"]  = coValue;  else data["co"].set(nullptr);
if (isfinite(co2Value)) data["co2"] = co2Value; else data["co2"].set(nullptr);
if (isfinite(hcValue))  data["hc"]  = hcValue;  else data["hc"].set(nullptr);
if (isfinite(noxValue)) data["nox"] = noxValue; else data["nox"].set(nullptr);

    sendJsonResponse(response);
}

// ============================================================================
// COMMAND: GET_STATUS
// ============================================================================
void handleGetStatus(JsonDocument &doc)
{
    StaticJsonDocument<256> response;
    response["status"] = "ONLINE";
    response["device_id"] = deviceId;
    response["firmware_version"] = FIRMWARE_VERSION;
    response["battery_level"] = BATTERY_LEVEL;
    response["calibrated"] = true;
    response["mode"] = deviceMode;
    response["challan_ready"] = challanCreated;

    sendJsonResponse(response);
}

// ============================================================================
// COMMAND: CALIBRATE
// ============================================================================
void handleCalibrate(JsonDocument &doc)
{
    if (realtimeStreaming)
    {
        realtimeStreaming = false;
        deviceMode = MODE_IDLE_STR;
    }

    deviceMode = MODE_CALIBRATION_STR;
    Serial.println("🔧 Calibrating sensors...");

    float refSound = doc["reference_sound"] | 94.0f;
    float refCO = doc["reference_co"] | 50.0f;
    float refHC = doc["reference_hc"] | 100.0f;

    // ===== Sound calibration =====
    float measuredDb = measureNoiseLevelWithOffset(0.0f);
    if (isfinite(measuredDb))
    {
        soundOffsetDb = refSound - measuredDb;
        prefs.putFloat(KEY_SOUND_OFFSET, soundOffsetDb);
    }

    // ===== Gas sensor calibration (optional reference ppm) =====
    const int gasSamples = 40;

    if (refCO > 0.0f)
    {
        float mq7Voltage = readAverageVoltage(MQ7_PIN, gasSamples);
        if (isValidSensorVoltage(mq7Voltage))
        {
            float rs = calculateSensorResistance(mq7Voltage, MQ7_RL);
            float newR0 = calculateR0FromPpm(rs, refCO, MQ7_CO_M, MQ7_CO_B);
            if (isfinite(newR0) && newR0 > 0.0f)
            {
                mq7R0 = newR0;
                prefs.putFloat(KEY_MQ7_R0, mq7R0);
            }
        }
    }

    if (refHC > 0.0f)
    {
        float mq2Voltage = readAverageVoltage(MQ2_PIN, gasSamples);
        if (isValidSensorVoltage(mq2Voltage))
        {
            float rs = calculateSensorResistance(mq2Voltage, MQ2_RL);
            float newR0 = calculateR0FromPpm(rs, refHC, MQ2_HC_M, MQ2_HC_B);
            if (isfinite(newR0) && newR0 > 0.0f)
            {
                mq2R0 = newR0;
                prefs.putFloat(KEY_MQ2_R0, mq2R0);
            }
        }
    }

    StaticJsonDocument<256> response;
    response["status"] = "CALIBRATION_COMPLETE";
    response["device_id"] = deviceId;
    response["sound_offset"] = soundOffsetDb;
    response["co_offset"] = mq7R0;
    response["hc_offset"] = mq2R0;
    response["sound_measured_db"] = measuredDb;
    response["mq7_r0"] = mq7R0;
    response["mq2_r0"] = mq2R0;
    response["firmware_version"] = FIRMWARE_VERSION;

    sendJsonResponse(response);

    deviceMode = MODE_IDLE_STR;
    Serial.println("✅ Calibration complete");
}

// ============================================================================
// SENSOR MEASUREMENT FUNCTIONS
// ============================================================================

/**
 * Measure noise level using microphone
 * Uses the exact algorithm from tested reference code
 */
float measureNoiseLevel()
{
    return measureNoiseLevelWithOffset(soundOffsetDb);
}

float measureNoiseLevelWithOffset(float offsetDb)
{
    const int SAMPLES = 800;
    const int SAMPLE_RATE_HZ = 8000;
    const float MIC_SENSITIVITY_V_PER_PA = 0.00631f;
    const float MIC_PREAMP_GAIN = 125.0f;
    const float REF_PRESSURE_PA = 0.00002f;

    // Welford's algorithm for mean and RMS without storing samples
    float mean = 0.0f;
    float m2 = 0.0f;

    for (int i = 0; i < SAMPLES; i++)
    {
        float sampleV = analogReadMilliVolts(MIC_PIN) / 1000.0f;
        float delta = sampleV - mean;
        mean += delta / (i + 1);
        float delta2 = sampleV - mean;
        m2 += delta * delta2;

        delayMicroseconds(1000000 / SAMPLE_RATE_HZ);
    }

    float rms = sqrt(m2 / SAMPLES);
    if (!isfinite(rms) || rms <= 0.0f)
    {
        return 30.0f;
    }

    // SPL → dB(A)
    float pressurePa = rms / (MIC_SENSITIVITY_V_PER_PA * MIC_PREAMP_GAIN);
    if (!isfinite(pressurePa) || pressurePa < REF_PRESSURE_PA)
    {
        pressurePa = REF_PRESSURE_PA;
    }
    float spl = 20.0f * log10(pressurePa / REF_PRESSURE_PA);
    float dBA = spl + offsetDb;

    // Constrain to realistic range
    dBA = constrain(dBA, 30.0f, 130.0f);

    return dBA;
}

/**
 * Measure emission gases
 * Reads raw values and converts using sensor_calibration.h functions
 */
void measureEmissions(float &co, float &hc, float &nox)
{
    const int samples = 200;
    float coSum = 0, hcSum = 0;
    int validCO = 0, validHC = 0;

    Serial.println("📊 Sampling emission sensors...");

    for (int i = 0; i < samples; i++)
    {
        // ====== MQ-7 (CO) SENSOR ======
        int mq7Raw = analogRead(MQ7_PIN);
        float coValue = calculateCO_ppm(mq7Raw, mq7R0);

        // Validate reading
        if (!isnan(coValue) && coValue > 0 && coValue < 10000)
        {
            coSum += coValue;
            validCO++;
        }

        // ====== MQ-2 (HC/Gas) SENSOR ======
        int mq2Raw = analogRead(MQ2_PIN);
        float hcValue = calculateHC_ppm(mq2Raw, mq2R0);

        // Validate reading
        if (!isnan(hcValue) && hcValue > 0 && hcValue < 10000)
        {
            hcSum += hcValue;
            validHC++;
        }

        // Log progress every 50 samples
        if (i % 50 == 0)
        {
            Serial.print("Sample " + String(i) + ": MQ-7 ADC=" + String(mq7Raw) + " -> CO=" + String(coValue, 2) + " ppm");
            Serial.println(", MQ-2 ADC=" + String(mq2Raw) + " -> HC=" + String(hcValue, 2) + " ppm");
        }

        delay(50); // 50ms between samples
    }

    // Calculate averages from valid samples
    co = (validCO > 0) ? (coSum / validCO) : 0.0;
    hc = (validHC > 0) ? (hcSum / validHC) : 0.0;
    nox = hc * 0.3; // Approximate NOx from HC (MQ-2 responds to both)

    Serial.println("📊 Sensor Summary:");
    Serial.println("  Valid CO samples: " + String(validCO) + "/" + String(samples));
    Serial.println("  Valid HC samples: " + String(validHC) + "/" + String(samples));
    Serial.println("  Average CO (before constraint): " + String(co, 2) + " ppm");
    Serial.println("  Average HC (before constraint): " + String(hc, 2) + " ppm");

    Serial.println("📈 Results:");
    Serial.println("  CO: " + String(co) + " ppm (" + String(validCO) + "/" + String(samples) + " valid samples)");
    Serial.println("  HC: " + String(hc) + " ppm (" + String(validHC) + "/" + String(samples) + " valid samples)");
    Serial.println("  NOx (estimated): " + String(nox) + " ppm");
}

float readAverageVoltage(int pin, int samples)
{
    float sum = 0.0f;
    for (int i = 0; i < samples; i++)
    {
        sum += analogReadMilliVolts(pin) / 1000.0f;
        delay(20);
    }
    return sum / samples;
}

float calculateR0FromPpm(float rs, float ppm, float m, float b)
{
    if (!isfinite(rs) || rs <= 0.0f || ppm <= 0.0f)
    {
        return NAN;
    }

    float ratio = pow(10.0f, (m * log10(ppm)) + b);
    if (!isfinite(ratio) || ratio <= 0.0f)
    {
        return NAN;
    }

    return rs / ratio;
}

// ============================================================================
// ML CLASSIFICATION (Rule-based for vehicle violations)
// ============================================================================

/**
 * Classify noise level for vehicle silencer violations
 * Pakistan Motor Vehicle Rules:
 * - Cars/4-wheelers: < 80 dBA
 * - Bikes/2-wheelers: < 85 dBA (some tolerance)
 */
String classifyNoise(float dba)
{
    if (dba >= 95.0)
        return "Severe Silencer Violation - Immediate Action Required";
    if (dba >= 90.0)
        return "Excessive Noise - Major Silencer Violation";
    if (dba >= 85.0)
        return "High Noise - Bike Silencer Violation Likely";
    if (dba >= 80.0)
        return "Moderate Noise - Car Silencer Violation Possible";
    if (dba >= 75.0)
        return "Elevated Noise Level - Within Limits";
    return "Normal Noise Level - Compliant";
}

/**
 * Classify emission levels for vehicles
 * Pakistan Emission Standards (EURO-2 equivalent):
 * Cars (Petrol):
 *   - CO: < 0.5% (5000 ppm)
 *   - HC: < 200 ppm
 * Bikes/Motorcycles:
 *   - CO: < 4.5% (45000 ppm) - more lenient
 *   - HC: < 12000 ppm
 */
String classifyEmission(float co, float hc)
{
    // Severe violations (likely bike/old vehicle)
    if (co > 5000.0)
        return "Critical CO Level - Severe Engine Malfunction";
    if (hc > 1000.0)
        return "Critical HC Level - Major Emission Violation";

    // High violations (exceeds car limits)
    if (co > 500.0)
        return "High CO - Exceeds Car Emission Standards";
    if (hc > 300.0)
        return "High HC - Exceeds Car Emission Standards";

    // Moderate violations (warning zone)
    if (co > 200.0 || hc > 150.0)
        return "Moderate Emission - Near Violation Threshold";

    // Acceptable range
    if (co > 100.0 || hc > 80.0)
        return "Elevated Emission - Within Acceptable Limits";

    return "Normal Emission Level - Compliant";
}

// ============================================================================
// BLE RESPONSE FUNCTIONS
// ============================================================================

/**
 * Send JSON response via BLE
 */
void sendJsonResponse(JsonDocument &doc)
{
    String output;
    serializeJson(doc, output);

    Serial.print("📤 Attempting to send response: deviceConnected=");
    Serial.print(deviceConnected ? "true" : "false");
    Serial.print(", dataCharacteristic=");
    Serial.println(dataCharacteristic != nullptr ? "exists" : "null");

    if (!deviceConnected || dataCharacteristic == nullptr)
    {
        Serial.println("⚠️ Cannot send - not connected");
        return;
    }

    // Send response in chunks if needed (MTU = 512)
    const int chunkSize = 500;
    int len = output.length();

    Serial.println("📤 Sending response (" + String(len) + " bytes)");

    for (int i = 0; i < len; i += chunkSize)
    {
        String chunk = output.substring(i, min(i + chunkSize, len));
        dataCharacteristic->setValue(chunk.c_str());
        dataCharacteristic->notify();
        delay(100); // Increased delay for reliable transmission
    }

    Serial.println("✅ Response sent");

    // Wait a bit to ensure response is fully transmitted before any state changes
    delay(200);
}

/**
 * Send error response
 */
void sendErrorResponse(String message)
{
    StaticJsonDocument<128> response;
    response["status"] = "ERROR";
    response["message"] = message;
    sendJsonResponse(response);
    Serial.println("❌ Error: " + message);
}

// ============================================================================
// SETUP
// ============================================================================
void setup()
{
    Serial.begin(115200);
    delay(1000);

    analogReadResolution(12);
    analogSetPinAttenuation(MIC_PIN, ADC_11db);
    analogSetPinAttenuation(MQ7_PIN, ADC_11db);
    analogSetPinAttenuation(MQ2_PIN, ADC_11db);

    prefs.begin(PREFS_NAMESPACE, false);
    soundOffsetDb = prefs.getFloat(KEY_SOUND_OFFSET, 0.0f);
    mq7R0 = prefs.getFloat(KEY_MQ7_R0, MQ7_R0_DEFAULT);
    mq2R0 = prefs.getFloat(KEY_MQ2_R0, MQ2_R0_DEFAULT);

    if (!isfinite(mq7R0) || mq7R0 <= 0.0f)
        mq7R0 = MQ7_R0_DEFAULT;
    if (!isfinite(mq2R0) || mq2R0 <= 0.0f)
        mq2R0 = MQ2_R0_DEFAULT;

    // Initialize all LED pins
    pinMode(LED_RED_PIN, OUTPUT);
    pinMode(LED_YELLOW_PIN, OUTPUT);
    pinMode(LED_GREEN_PIN, OUTPUT);

    // Start with red LED (not connected)
    setLedDisconnected();

    Serial.println("===========================================");
    Serial.println("  NoiseSentinel IoT Device");
    Serial.println("  Firmware: " + FIRMWARE_VERSION);
    Serial.println("  Calibration:");
    Serial.println("    Sound Offset (dB): " + String(soundOffsetDb, 2));
    Serial.println("    MQ7 R0: " + String(mq7R0, 2));
    Serial.println("    MQ2 R0: " + String(mq2R0, 2));
    Serial.println("===========================================");
    Serial.println("  LED Status:");
    Serial.println("    Red    (Pin " + String(LED_RED_PIN) + ") - Not Connected");
    Serial.println("    Yellow (Pin " + String(LED_YELLOW_PIN) + ") - Connected/Paired");
    Serial.println("    Green  (Pin " + String(LED_GREEN_PIN) + ") - Scanning");
    Serial.println("===========================================");

    // Initialize BLE
    BLEDevice::init("IOT-FRM-01"); // Device name (matches backend)
    bleServer = BLEDevice::createServer();
    bleServer->setCallbacks(new ServerCallbacks());

    // Create BLE service
    BLEService *service = bleServer->createService(SERVICE_UUID);

    // Control characteristic (Write NO RESPONSE for faster communication)
    controlCharacteristic = service->createCharacteristic(
        CONTROL_CHAR_UUID,
        BLECharacteristic::PROPERTY_WRITE_NR);
    controlCharacteristic->setCallbacks(new ControlCallbacks());

    // Data characteristic (Notify + Read for polling fallback)
    dataCharacteristic = service->createCharacteristic(
        DATA_CHAR_UUID,
        BLECharacteristic::PROPERTY_NOTIFY | BLECharacteristic::PROPERTY_READ);
    dataCharacteristic->addDescriptor(new BLE2902());

    // Start service
    service->start();

    // Start advertising with more stable connection parameters
    BLEAdvertising *advertising = BLEDevice::getAdvertising();
    advertising->addServiceUUID(SERVICE_UUID);
    advertising->setScanResponse(true);
    advertising->setMinPreferred(0x06); // Minimum connection interval (7.5ms)
    advertising->setMaxPreferred(0x12); // Maximum connection interval (22.5ms)
    BLEDevice::startAdvertising();

    Serial.println("✅ BLE advertising started");
    Serial.println("📡 Device name: IOT-FRM-01");
    Serial.println("🔗 Waiting for mobile app connection...");
    Serial.println("🔴 Red LED ON - Waiting for connection...");

    // Blink red LED to indicate device is ready and waiting
    blinkLed(LED_RED_PIN, 5, 100);
    setLedDisconnected(); // End with red LED on (not connected)
}

// ============================================================================
// LOOP
// ============================================================================
void loop()
{
    // Handle connection state changes
    if (deviceConnected && !oldDeviceConnected)
    {
        oldDeviceConnected = deviceConnected;
    }

    if (!deviceConnected && oldDeviceConnected)
    {
        delay(500);                    // Give time for disconnect
        bleServer->startAdvertising(); // Restart advertising
        Serial.println("🔁 Restarting advertising...");
        oldDeviceConnected = deviceConnected;

        // Reset emission test if disconnected mid-test
        if (emissionState != EMISSION_IDLE)
        {
            Serial.println("⚠️ Test cancelled due to disconnect");
            emissionState = EMISSION_IDLE;
            deviceMode = MODE_IDLE_STR;
        }
    }

    // Process non-blocking emission test state machine
    processEmissionTest();

    // Process realtime sensor streaming
    processRealtimeStream();

    // Small delay to prevent watchdog issues (but not blocking!)
    delay(10);
}
