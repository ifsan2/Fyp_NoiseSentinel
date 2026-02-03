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
#define MQ2_RL 10.0    // Load resistor (10kΩ)
#define MQ2_R0 10.0    // Sensor resistance in clean air (calibrate)
#define MQ2_HC_M -0.45 // Slope of HC curve
#define MQ2_HC_B 1.30  // Intercept of HC curve

/**
 * Convert MQ-2 analog reading to HC (Hydrocarbon) concentration
 *
 * @param analogValue Raw ADC value (0-4095)
 * @return HC concentration in ppm
 *
 * Formula: ppm = 10^((log10(Rs/R0) - b) / m)
 */
float calculateHC_ppm(int analogValue)
{
    // Convert ADC to voltage
    float voltage = analogValue * (3.3 / 4095.0);

    // Avoid division by zero
    if (voltage >= 3.29)
        voltage = 3.29;
    if (voltage <= 0.01)
        voltage = 0.01;

    // Calculate sensor resistance (Rs)
    float Rs = (3.3 - voltage) / voltage * MQ2_RL;

    // Calculate Rs/R0 ratio
    float ratio = Rs / MQ2_R0;

    // Apply characteristic curve formula
    float ppm = pow(10, ((log10(ratio) - MQ2_HC_B) / MQ2_HC_M));

    // Constrain to sensor range (allow low values to verify readings)
    ppm = constrain(ppm, 0.1, 10000.0);

    return ppm;
}

// ============================================================================
// MQ-2 SMOKE DETECTION
// ============================================================================
// MQ-2 also detects smoke particles (separate curve from HC)
#define MQ2_SMOKE_M -0.48 // Slope of smoke curve
#define MQ2_SMOKE_B 1.40  // Intercept of smoke curve

/**
 * Convert MQ-2 analog reading to Smoke concentration
 *
 * @param analogValue Raw ADC value (0-4095)
 * @return Smoke concentration in ppm
 *
 * Formula: ppm = 10^((log10(Rs/R0) - b) / m)
 */
float calculateSmoke_ppm(int analogValue)
{
    // Convert ADC to voltage
    float voltage = analogValue * (3.3 / 4095.0);

    // Avoid division by zero
    if (voltage >= 3.29)
        voltage = 3.29;
    if (voltage <= 0.01)
        voltage = 0.01;

    // Calculate sensor resistance (Rs)
    float Rs = (3.3 - voltage) / voltage * MQ2_RL;

    // Calculate Rs/R0 ratio
    float ratio = Rs / MQ2_R0;

    // Apply smoke characteristic curve formula
    float ppm = pow(10, ((log10(ratio) - MQ2_SMOKE_B) / MQ2_SMOKE_M));

    // Constrain to sensor range (allow low values to verify readings)
    ppm = constrain(ppm, 0.1, 10000.0);

    return ppm;
}

// ============================================================================
// MQ-7 SENSOR CALIBRATION (CO - Carbon Monoxide)
// ============================================================================
// MQ-7 Parameters (from datasheet characteristic curve)
#define MQ7_RL 10.0    // Load resistor (10kΩ)
#define MQ7_R0 10.0    // Sensor resistance in clean air (calibrate)
#define MQ7_CO_M -0.35 // Slope of CO curve
#define MQ7_CO_B 0.99  // Intercept of CO curve

/**
 * Convert MQ-7 analog reading to CO (Carbon Monoxide) concentration
 *
 * @param analogValue Raw ADC value (0-4095)
 * @return CO concentration in ppm
 *
 * Formula: ppm = 10^((log10(Rs/R0) - b) / m)
 */
float calculateCO_ppm(int analogValue)
{
    // Convert ADC to voltage
    float voltage = analogValue * (3.3 / 4095.0);

    // Avoid division by zero
    if (voltage >= 3.29)
        voltage = 3.29;
    if (voltage <= 0.01)
        voltage = 0.01;

    // Calculate sensor resistance (Rs)
    float Rs = (3.3 - voltage) / voltage * MQ7_RL;

    // Calculate Rs/R0 ratio
    float ratio = Rs / MQ7_R0;

    // Apply characteristic curve formula
    float ppm = pow(10, ((log10(ratio) - MQ7_CO_B) / MQ7_CO_M));

    // Constrain to sensor range (allow low values to verify readings)
    ppm = constrain(ppm, 0.1, 1000.0);

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
 * @return Battery percentage (0-100%)
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
