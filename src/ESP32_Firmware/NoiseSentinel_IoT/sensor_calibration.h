/*
 * Sensor Calibration Module
 * Contains formulas for converting raw ADC values to physical units
 *
 * References:
 * - MAX9814 Microphone: https://www.maximintegrated.com/en/products/analog/audio/MAX9814.html
 * - MQ-2 Sensor Datasheet: HC/Smoke detection
 * - MQ-7 Sensor Datasheet: CO detection
 */

#ifndef SENSOR_CALIBRATION_H
#define SENSOR_CALIBRATION_H

#include <Arduino.h>
#include <math.h>

inline float adcToVoltage(int analogValue)
{
    return analogValue * (3.3f / 4095.0f);
}

inline bool isValidSensorVoltage(float voltage)
{
    return voltage > 0.02f && voltage < 3.28f;
}

inline float calculateSensorResistance(float voltage, float loadResistorKOhm)
{
    return ((3.3f - voltage) / voltage) * loadResistorKOhm;
}

// ============================================================================
// MICROPHONE CALIBRATION (dBA Calculation)
// ============================================================================
#define REFERENCE_VOLTAGE 0.00631  // Reference voltage for 94 dBA (calibrator)
#define CALIBRATION_OFFSET_DB 0.0  // Adjust during field calibration
#define A_WEIGHTING_CORRECTION 0.0 // A-weighting curve adjustment

/**
 * Convert microphone analog reading to dBA (decibels A-weighted)
 *
 * @param analogValue Raw ADC value (0-4095 for ESP32 12-bit ADC)
 * @return Sound pressure level in dBA
 *
 * Formula: dB = 20 * log10(V / V_ref) + offset
 */
float calculateDBa(int analogValue)
{
    // Convert ADC to voltage (ESP32: 12-bit ADC, 0-3.3V)
    float voltage = analogValue * (3.3 / 4095.0);

    // Avoid log(0) error
    if (voltage < 0.001)
        voltage = 0.001;

    // Calculate dB SPL (Sound Pressure Level)
    float dbSPL = 20.0 * log10(voltage / REFERENCE_VOLTAGE);

    // Apply calibration offset and A-weighting
    float dbA = dbSPL + CALIBRATION_OFFSET_DB + A_WEIGHTING_CORRECTION;

    // Constrain to realistic range (30-130 dBA)
    dbA = constrain(dbA, 30.0, 130.0);

    return dbA;
}

// ============================================================================
// MQ-2 SENSOR CALIBRATION (HC - Hydrocarbons)
// ============================================================================
// MQ-2 Parameters (from datasheet characteristic curve)
#define MQ2_RL 10.0f         // Load resistor (10kΩ)
#define MQ2_R0_DEFAULT 10.0f // Sensor resistance in clean air (calibrate)
#define MQ2_HC_M -0.45f      // Slope of HC curve
#define MQ2_HC_B 1.30f       // Intercept of HC curve

/**
 * Convert MQ-2 analog reading to HC (Hydrocarbon) concentration
 *
 * @param analogValue Raw ADC value (0-4095)
 * @param r0 Sensor resistance in clean air (calibrated)
 * @return HC concentration in ppm
 *
 * Formula: ppm = 10^((log10(Rs/R0) - b) / m)
 */
float calculateHC_ppm(int analogValue, float r0 = MQ2_R0_DEFAULT)
{
    float voltage = adcToVoltage(analogValue);
    if (!isValidSensorVoltage(voltage))
        return NAN;

    float Rs = calculateSensorResistance(voltage, MQ2_RL);
    float ratio = Rs / r0;
    float ppm = pow(10, ((log10(ratio) - MQ2_HC_B) / MQ2_HC_M));
    if (!isfinite(ppm))
        return NAN;
    ppm = constrain(ppm, 0.0f, 10000.0f);

    return ppm;
}

// ============================================================================
// MQ-2 SMOKE DETECTION
// ============================================================================
// MQ-2 also detects smoke particles (separate curve from HC)
#define MQ2_SMOKE_M -0.48f // Slope of smoke curve
#define MQ2_SMOKE_B 1.40f  // Intercept of smoke curve

/**
 * Convert MQ-2 analog reading to Smoke concentration
 *
 * @param analogValue Raw ADC value (0-4095)
 * @param r0 Sensor resistance in clean air (calibrated)
 * @return Smoke concentration in ppm
 *
 * Formula: ppm = 10^((log10(Rs/R0) - b) / m)
 */
float calculateSmoke_ppm(int analogValue, float r0 = MQ2_R0_DEFAULT)
{
    float voltage = adcToVoltage(analogValue);
    if (!isValidSensorVoltage(voltage))
        return NAN;

    float Rs = calculateSensorResistance(voltage, MQ2_RL);
    float ratio = Rs / r0;
    float ppm = pow(10, ((log10(ratio) - MQ2_SMOKE_B) / MQ2_SMOKE_M));
    if (!isfinite(ppm))
        return NAN;
    ppm = constrain(ppm, 0.0f, 10000.0f);

    return ppm;
}

// ============================================================================
// MQ-7 SENSOR CALIBRATION (CO - Carbon Monoxide)
// ============================================================================
// MQ-7 Parameters (from datasheet characteristic curve)
#define MQ7_RL 10.0f         // Load resistor (10kΩ)
#define MQ7_R0_DEFAULT 10.0f // Sensor resistance in clean air (calibrate)
#define MQ7_CO_M -0.35f      // Slope of CO curve
#define MQ7_CO_B 0.99f       // Intercept of CO curve

/**
 * Convert MQ-7 analog reading to CO (Carbon Monoxide) concentration
 *
 * @param analogValue Raw ADC value (0-4095)
 * @param r0 Sensor resistance in clean air (calibrated)
 * @return CO concentration in ppm
 *
 * Formula: ppm = 10^((log10(Rs/R0) - b) / m)
 */
float calculateCO_ppm(int analogValue, float r0 = MQ7_R0_DEFAULT)
{
    float voltage = adcToVoltage(analogValue);
    if (!isValidSensorVoltage(voltage))
        return NAN;

    float Rs = calculateSensorResistance(voltage, MQ7_RL);
    float ratio = Rs / r0;
    float ppm = pow(10, ((log10(ratio) - MQ7_CO_B) / MQ7_CO_M));
    if (!isfinite(ppm))
        return NAN;
    ppm = constrain(ppm, 0.0f, 10000.0f);

    return ppm;
}

// ============================================================================
// CO2 ESTIMATION (No Direct Sensor Available)
// ============================================================================
/**
 * Estimate CO2 from CO reading using empirical ratio
 *
 * @param coPpm CO concentration in ppm
 * @return Estimated CO2 concentration in ppm
 *
 * Note: In vehicle exhaust, CO2/CO ratio is typically 50-100.
 * Using conservative estimate of 75.
 */
float estimateCO2(float coPpm)
{
    const float CO2_CO_RATIO = 75.0;
    return coPpm * CO2_CO_RATIO;
}

// ============================================================================
// BATTERY LEVEL MONITORING
// ============================================================================
/**
 * Calculate battery percentage from voltage divider
 *
 * @param analogValue Raw ADC value from battery monitor pin
 *
 * Assumes Li-Ion battery:
 * - 4.2V = 100% (fully charged)
 * - 3.7V = 50% (nominal)
 * - 3.0V = 0% (discharged)
 */
float getBatteryPercentage()
{
    int analogValue = analogRead(33); // BATTERY_LEVEL_PIN

    // Convert to voltage (assuming voltage divider R1=10k, R2=10k)
    float voltage = analogValue * (3.3 / 4095.0) * 2.0;

    // Map voltage to percentage
    float percentage = ((voltage - 3.0) / 1.2) * 100.0;

    // Constrain to 0-100%
    percentage = constrain(percentage, 0.0, 100.0);

    return percentage;
}

// ============================================================================
// CALIBRATION HELPER FUNCTIONS
// ============================================================================
/**
 * Calculate R0 (sensor resistance in clean air) during calibration
 * Used as reference for Rs/R0 ratio calculation
 *
 * @param analogValue ADC reading in clean air environment
 * @param RL Load resistor value (typically 10kΩ)
 * @return R0 value to store in EEPROM
 */
float calculateR0(int analogValue, float RL)
{
    float voltage = analogValue * (3.3 / 4095.0);

    if (voltage >= 3.29 || voltage <= 0.01)
    {
        return RL; // Default value if reading invalid
    }

    float Rs = (3.3 - voltage) / voltage * RL;
    return Rs;
}

/**
 * Perform multi-sample averaging for stable readings
 *
 * @param sensorPin Analog pin to read from
 * @param samples Number of samples to average
 * @return Average ADC value
 */
int getAverageReading(int sensorPin, int samples)
{
    long total = 0;

    for (int i = 0; i < samples; i++)
    {
        total += analogRead(sensorPin);
        delay(10); // Small delay between readings
    }

    return total / samples;
}

#endif // SENSOR_CALIBRATION_H
