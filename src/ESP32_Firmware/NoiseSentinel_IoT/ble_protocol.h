/*
 * BLE Protocol Definitions
 * JSON command/response structures for mobile app communication
 */

#ifndef BLE_PROTOCOL_H
#define BLE_PROTOCOL_H

#include <Arduino.h>

// ============================================================================
// BLE SERVICE & CHARACTERISTIC UUIDs
// ============================================================================
// Service UUID: FFE0 (Custom service for NoiseSentinel)
#define SERVICE_UUID "0000FFE0-0000-1000-8000-00805F9B34FB"

// Characteristic UUIDs
#define CONTROL_CHAR_UUID "0000FFE1-0000-1000-8000-00805F9B34FB" // Write
#define DATA_CHAR_UUID "0000FFE2-0000-1000-8000-00805F9B34FB"    // Notify

// ============================================================================
// COMMAND TYPES (Mobile App → ESP32)
// ============================================================================
// Commands sent from mobile app to ESP32 via Control Characteristic

/**
 * START_NOISE_TEST
 * Initiates noise level measurement
 *
 * Request JSON:
 * {
 *   "command": "START_NOISE_TEST",
 *   "device_id": 1,
 *   "officer_id": 42,
 *   "timestamp": "2026-01-30T10:30:00Z"
 * }
 */

/**
 * START_EMISSION_TEST
 * Initiates emission gas measurement
 *
 * Request JSON:
 * {
 *   "command": "START_EMISSION_TEST",
 *   "device_id": 1,
 *   "officer_id": 42,
 *   "timestamp": "2026-01-30T10:35:00Z"
 * }
 */

/**
 * CALIBRATE
 * Enters calibration mode with reference values
 *
 * Request JSON:
 * {
 *   "command": "CALIBRATE",
 *   "reference_sound": 94.0,
 *   "reference_co": 50.0,
 *   "reference_hc": 100.0
 * }
 */

/**
 * GET_STATUS
 * Requests current device status
 *
 * Request JSON:
 * {
 *   "command": "GET_STATUS"
 * }
 */

// ============================================================================
// RESPONSE TYPES (ESP32 → Mobile App)
// ============================================================================
// Responses sent from ESP32 to mobile app via Data Characteristic

/**
 * TEST_RESULT (Noise)
 *
 * Response JSON:
 * {
 *   "status": "COMPLETED",
 *   "test_type": "NOISE",
 *   "device_id": 1,
 *   "timestamp": "2026-01-30T10:30:05Z",
 *   "firmware_version": "v1.0.0",
 *   "battery_level": 87,
 *   "data": {
 *     "sound_level_dba": 92.5,
 *     "co": null,
 *     "co2": null,
 *     "hc": null,
 *     "nox": null,
 *     "ml_classification": "Excessive Noise Detected"
 *   },
 *   "signature": "SHA256_HASH"
 * }
 */

/**
 * TEST_RESULT (Emission)
 *
 * Response JSON:
 * {
 *   "status": "COMPLETED",
 *   "test_type": "EMISSION",
 *   "device_id": 1,
 *   "timestamp": "2026-01-30T10:36:30Z",
 *   "firmware_version": "v1.0.0",
 *   "battery_level": 85,
 *   "data": {
 *     "sound_level_dba": 0,
 *     "co": 152.3,
 *     "co2": 11422.5,
 *     "hc": 245.7,
 *     "nox": null,
 *     "ml_classification": "High CO Detected"
 *   },
 *   "signature": "SHA256_HASH"
 * }
 */

/**
 * STATUS_RESPONSE
 *
 * Response JSON:
 * {
 *   "status": "ONLINE",
 *   "device_id": 1,
 *   "firmware_version": "v1.0.0",
 *   "battery_level": 87,
 *   "calibrated": true,
 *   "mode": "IDLE"
 * }
 */

/**
 * ERROR_RESPONSE
 *
 * Response JSON:
 * {
 *   "status": "ERROR",
 *   "message": "Device not calibrated"
 * }
 */

/**
 * CALIBRATION_COMPLETE
 *
 * Response JSON:
 * {
 *   "status": "CALIBRATION_COMPLETE",
 *   "device_id": 1,
 *   "sound_offset": 2.3,
 *   "co_offset": -5.1,
 *   "hc_offset": 10.2,
 *   "firmware_version": "v1.0.0"
 * }
 */

// ============================================================================
// BLE CONNECTION PARAMETERS
// ============================================================================
#define BLE_MTU 512                  // Maximum Transmission Unit
#define BLE_TIMEOUT_MS 30000         // 30 seconds timeout
#define BLE_ADVERTISING_INTERVAL 100 // 100ms advertising interval

// ============================================================================
// PROTOCOL CONSTANTS
// ============================================================================
#define MAX_JSON_SIZE 1024    // Maximum JSON message size
#define MAX_COMMAND_LENGTH 32 // Maximum command string length

// Test status codes
#define STATUS_IDLE "IDLE"
#define STATUS_IN_PROGRESS "IN_PROGRESS"
#define STATUS_COMPLETED "COMPLETED"
#define STATUS_ERROR "ERROR"

// Test types
#define TEST_TYPE_NOISE "NOISE"
#define TEST_TYPE_EMISSION "EMISSION"

// Device modes
#define MODE_IDLE_STR "IDLE"
#define MODE_PAIRING_STR "PAIRING"
#define MODE_NOISE_TEST_STR "NOISE_TEST"
#define MODE_EMISSION_TEST_STR "EMISSION_TEST"
#define MODE_CALIBRATION_STR "CALIBRATION"

#endif // BLE_PROTOCOL_H
