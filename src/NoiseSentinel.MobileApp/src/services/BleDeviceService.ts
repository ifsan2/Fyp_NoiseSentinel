/**
 * BLE Device Service (react-native-ble-plx)
 * Handles Bluetooth Low Energy communication with ESP32 IoT devices
 *
 * Features:
 * - Device discovery and connection
 * - Send test commands (Noise/Emission)
 * - Receive sensor data
 * - Handle disconnections and errors
 */

import {
  BleManager,
  Device,
  Characteristic,
  State,
} from "react-native-ble-plx";
import { Platform, PermissionsAndroid } from "react-native";
import base64 from "react-native-base64";

// ============================================================================
// BLE CONFIGURATION
// ============================================================================

// UUIDs must match ESP32 firmware
const SERVICE_UUID = "0000FFE0-0000-1000-8000-00805F9B34FB";
const CONTROL_CHARACTERISTIC_UUID = "0000FFE1-0000-1000-8000-00805F9B34FB";
const DATA_CHARACTERISTIC_UUID = "0000FFE2-0000-1000-8000-00805F9B34FB";

// Timeouts
const SCAN_TIMEOUT = 10000; // 10 seconds
const CONNECTION_TIMEOUT = 15000; // 15 seconds
const TEST_TIMEOUT = 90000; // 90 seconds (for emission test with warm-up)
const BLE_UNAVAILABLE_ERROR =
  "Bluetooth BLE is not available in Expo Go. Use a development build (npx expo run:android) to use IoT features.";

// ============================================================================
// TYPES
// ============================================================================
export interface BleDevice {
  id: string;
  name: string;
  rssi: number;
}

export interface TestCommand {
  command:
    | "CHALLAN_CREATED"
    | "START_NOISE_TEST"
    | "START_EMISSION_TEST"
    | "START_REALTIME_STREAM"
    | "STOP_REALTIME_STREAM"
    | "CALIBRATE"
    | "GET_STATUS";
  device_id: number;
  officer_id?: number;
  timestamp?: string;
  violation_type?: string;
  reference_sound?: number;
  reference_co?: number;
  reference_hc?: number;
}

export interface TestResult {
  status: "COMPLETED" | "ERROR" | "IN_PROGRESS";
  test_type: "NOISE" | "EMISSION";
  device_id: number;
  timestamp: string;
  firmware_version: string;
  battery_level: number;
  data: {
    sound_level_dba: number | null;
    co: number | null;
    co2: number | null;
    hc: number | null;
    nox: number | null;
    ml_classification: string;
  };
  signature?: string;
}

export interface RealtimeSensorData {
  status: "STREAM";
  type: "SENSOR_DATA" | "STREAM_STARTED" | "STREAM_STOPPED";
  device_id: number;
  timestamp_ms?: number;
  data?: {
    sound_level_dba: number | null;
    co: number | null;
    co2: number | null;
    hc: number | null;
    nox: number | null;
  };
}

// ============================================================================
// BLE DEVICE SERVICE CLASS
// ============================================================================
class BleDeviceService {
  private manager!: BleManager;
  private bleSupported: boolean = true;
  private connectedDevice: Device | null = null;
  private notificationSubscription: any = null;
  private pendingResultCallback: ((result: any) => void) | null = null;
  private pendingResultTimer: ReturnType<typeof setTimeout> | null = null;
  private responseBuffer: string = "";
  private lastDeviceId: number = 0;
  private disconnectionListener: (() => void) | null = null;
  private progressCallback:
    | ((phase: string, countdown: number) => void)
    | null = null;
  private realtimeDataCallback: ((data: RealtimeSensorData) => void) | null =
    null;

  constructor() {
    try {
      this.manager = new BleManager();
    } catch (error) {
      this.bleSupported = false;
      console.warn("⚠️ BLE native module unavailable:", error);
    }
  }

  private ensureBleAvailable(): void {
    if (!this.bleSupported) {
      throw new Error(BLE_UNAVAILABLE_ERROR);
    }
  }

  /**
   * Initialize BLE Manager
   */
  async initialize(): Promise<void> {
    this.ensureBleAvailable();

    try {
      const state = await this.manager.state();
      console.log(`📱 BLE State: ${state}`);

      // Monitor Bluetooth state changes
      this.manager.onStateChange((newState) => {
        console.log(`📱 BLE State Changed: ${newState}`);
        if (newState === State.PoweredOff || newState === State.Unauthorized) {
          console.log("⚠️ Bluetooth disabled - triggering disconnection");
          // Always call handleDisconnection when BT is disabled, even if connectedDevice is null
          this.handleDisconnection();
        }
      }, true);

      if (state !== State.PoweredOn) {
        console.warn("⚠️ Bluetooth is not powered on");
        // Wait for Bluetooth to be powered on
        return new Promise((resolve, reject) => {
          const subscription = this.manager.onStateChange((newState) => {
            if (newState === State.PoweredOn) {
              subscription.remove();
              console.log("✅ Bluetooth powered on");
              resolve();
            }
          }, true);

          // Timeout after 10 seconds
          setTimeout(() => {
            subscription.remove();
            reject(new Error("Bluetooth not available"));
          }, 10000);
        });
      }

      // Request permissions on Android
      if (Platform.OS === "android" && Platform.Version >= 31) {
        await this.requestAndroidPermissions();
      }

      console.log("✅ BLE Manager initialized");
    } catch (error: any) {
      console.error("❌ BLE initialization failed:", error);
      // If error is about no device connected, it might be a stale state
      if (error.message?.includes("No device connected")) {
        console.log("⚠️ Stale BLE state detected, reinitializing...");
        // Destroy and recreate manager
        try {
          await this.manager.destroy();
        } catch (e) {
          // Ignore destroy errors
        }
        try {
          this.manager = new BleManager();
        } catch (createError) {
          this.bleSupported = false;
          throw new Error(BLE_UNAVAILABLE_ERROR);
        }
        // Retry initialization once
        const state = await this.manager.state();
        console.log(`📱 BLE State after reinit: ${state}`);
        if (state !== State.PoweredOn) {
          throw new Error("Bluetooth not available");
        }
        console.log("✅ BLE Manager reinitialized successfully");
      } else {
        throw new Error("Failed to initialize Bluetooth: " + error.message);
      }
    }
  }

  /**
   * Request Bluetooth permissions on Android 12+
   */
  private async requestAndroidPermissions(): Promise<void> {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);

      if (
        granted["android.permission.BLUETOOTH_SCAN"] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted["android.permission.BLUETOOTH_CONNECT"] ===
          PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log("✅ Bluetooth permissions granted");
      } else {
        throw new Error("Bluetooth permissions denied");
      }
    } catch (error) {
      console.error("❌ Permission request failed:", error);
      throw error;
    }
  }

  /**
   * Scan for NoiseSentinel IoT devices
   */
  async scanForDevices(): Promise<BleDevice[]> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      const devices: BleDevice[] = [];
      const seenDevices = new Set<string>();

      console.log("🔍 Scanning for BLE devices...");

      this.manager.startDeviceScan(
        null, // Scan for all devices
        { allowDuplicates: false },
        (error, device) => {
          if (error) {
            console.error("❌ Scan error:", error);
            this.manager.stopDeviceScan();
            reject(error);
            return;
          }

          if (device && device.name && !seenDevices.has(device.id)) {
            // Filter for IoT devices - accept any device that:
            // 1. Starts with "NoiseSentinel" OR
            // 2. Starts with "IOT-" (for backend-registered devices like IOT-FRM-01)
            if (
              device.name.startsWith("NoiseSentinel") ||
              device.name.startsWith("IOT-")
            ) {
              seenDevices.add(device.id);
              devices.push({
                id: device.id,
                name: device.name,
                rssi: device.rssi || -100,
              });
              console.log(`📡 Found device: ${device.name} (${device.id})`);
            }
          }
        },
      );

      // Stop scanning after timeout
      setTimeout(() => {
        this.manager.stopDeviceScan();
        console.log(`🔍 Scan complete. Found ${devices.length} devices`);
        resolve(devices);
      }, SCAN_TIMEOUT);
    });
  }

  /**
   * Connect to a BLE device
   */
  async connect(deviceId: string): Promise<void> {
    await this.initialize();

    try {
      console.log(`🔗 Connecting to device: ${deviceId}`);

      // Connect to device with longer timeout for stability
      this.connectedDevice = await this.manager.connectToDevice(deviceId, {
        timeout: CONNECTION_TIMEOUT,
        requestMTU: 517, // Request higher MTU during connection
      });

      // Request larger MTU for better data transfer (max 517 to match ESP32)
      try {
        const mtu = await this.connectedDevice.requestMTU(517);
        console.log(`📡 MTU negotiated: ${mtu} bytes`);
      } catch (mtuError) {
        console.warn("⚠️ MTU negotiation failed, using default");
      }

      // Discover all services and characteristics
      await this.connectedDevice.discoverAllServicesAndCharacteristics();
      console.log("✅ Connected and services discovered");

      // Setup notification listener for data characteristic BEFORE sending any commands
      console.log("📡 Setting up notification listener...");
      this.notificationSubscription =
        this.connectedDevice.monitorCharacteristicForService(
          SERVICE_UUID,
          DATA_CHARACTERISTIC_UUID,
          (error, characteristic) => {
            if (error) {
              // Check if it's a disconnection error
              if (
                error.message?.includes("disconnected") ||
                error.message?.includes("cancelled")
              ) {
                console.log("ℹ️ Device disconnected - cleaning up");
                this.handleDisconnection();
              } else {
                console.error("❌ Notification error:", error);
              }
              return;
            }

            if (characteristic?.value) {
              console.log("📩 Notification received, processing...");
              this.handleNotification(characteristic);
            } else {
              console.warn("⚠️ Notification without value");
            }
          },
        );

      // Small delay to ensure notification subscription is fully established
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
      console.log("✅ Notifications enabled and ready");
    } catch (error) {
      console.error("❌ Connection failed:", error);
      this.connectedDevice = null;
      throw new Error("Failed to connect to device");
    }
  }

  /**
   * Handle incoming notification from device
   */
  private handleNotification(characteristic: Characteristic): void {
    try {
      const chunk = base64.decode(characteristic.value || "");
      console.log("📥 Received chunk:", chunk);

      // Accumulate chunks
      this.responseBuffer += chunk;

      // Reset timeout when new data arrives
      if (this.pendingResultTimer && this.pendingResultCallback) {
        clearTimeout(this.pendingResultTimer);
        this.pendingResultTimer = setTimeout(() => {
          if (this.pendingResultCallback) {
            console.error(
              "❌ Timeout after receiving partial data:",
              this.responseBuffer,
            );
            this.pendingResultCallback = null;
            this.pendingResultTimer = null;
            this.responseBuffer = "";
          }
        }, 10000); // 10 seconds between chunks to handle slow ESP32 transmission
      }

      // Try to parse the accumulated buffer
      try {
        const result = JSON.parse(this.responseBuffer); // Use any type for flexibility
        console.log("📥 Parsed result:", result);

        // Clear buffer on successful parse
        this.responseBuffer = "";

        // Check if this is a progress update (heartbeat) or final result
        if (result.status === "IN_PROGRESS") {
          // This is a heartbeat/progress update
          console.log("💓 Heartbeat received:", result);
          if (
            this.progressCallback &&
            result.phase &&
            result.seconds_remaining !== undefined
          ) {
            this.progressCallback(result.phase, result.seconds_remaining);
          }
          // Don't resolve the promise for progress updates
          return;
        }

        if (result.status === "STREAM") {
          const streamData = result as RealtimeSensorData;
          if (streamData.type === "SENSOR_DATA" && this.realtimeDataCallback) {
            this.realtimeDataCallback(streamData);
          } else {
            console.log("📡 Stream event:", streamData.type);
          }
          return;
        }

        // This is a final result - resolve pending promise if exists
        if (this.pendingResultCallback) {
          console.log("🔄 Calling pendingResultCallback...");

          // Stop polling since we got a result
          this.stopPolling();

          if (this.pendingResultTimer) {
            clearTimeout(this.pendingResultTimer);
            this.pendingResultTimer = null;
          }
          const callback = this.pendingResultCallback;
          this.pendingResultCallback = null;
          callback(result);
          console.log("✅ Promise should be resolved now");
        } else {
          console.log("⚠️ No pending callback found - result ignored");
        }
      } catch (parseError) {
        // If parse fails, keep accumulating (incomplete JSON)
        // Check if buffer is too large (prevent memory issues)
        if (this.responseBuffer.length > 10000) {
          console.error("❌ Response buffer too large, clearing");
          this.responseBuffer = "";
          if (this.pendingResultTimer) {
            clearTimeout(this.pendingResultTimer);
            this.pendingResultTimer = null;
          }
        }
      }
    } catch (error) {
      console.error("❌ Failed to decode notification:", error);
      this.responseBuffer = ""; // Clear buffer on decode error
    }
  }

  /**
   * Handle disconnection cleanup
   */
  private handleDisconnection(): void {
    console.log("🔌 handleDisconnection called");

    // Clear response buffer
    this.responseBuffer = "";

    // Stop polling
    this.stopPolling();

    // Don't clear pending callbacks here - let them timeout or complete naturally
    // This prevents race conditions where disconnect happens right after receiving data
    // The callback will be cleared by either:
    // 1. Successful response processing (handleNotification)
    // 2. Timeout (waitForTestResult)
    console.log("⏳ Keeping pending callback/timer to avoid race condition");

    // Remove notification subscription
    if (this.notificationSubscription) {
      this.notificationSubscription.remove();
      this.notificationSubscription = null;
    }

    // Store whether we had a connected device
    const wasConnected = this.connectedDevice !== null;

    // Clear device reference
    this.connectedDevice = null;

    // Notify listener about disconnection (only if we were actually connected)
    if (this.disconnectionListener && wasConnected) {
      console.log("📢 Notifying disconnection listener");
      const listener = this.disconnectionListener;
      // Don't clear listener here - let the screen manage it
      // This allows the same listener to handle multiple disconnections
      setTimeout(() => listener(), 100); // Small delay to ensure state is clean
    } else if (this.disconnectionListener && !wasConnected) {
      console.log(
        "⚠️ Disconnection listener exists but no device was connected",
      );
    }
  }

  /**
   * Disconnect from device
   */
  async disconnect(): Promise<void> {
    if (!this.connectedDevice) return;

    try {
      const deviceId = this.connectedDevice.id;

      // Clean up state first
      this.handleDisconnection();

      // Disconnect device
      await this.manager.cancelDeviceConnection(deviceId);
      console.log("✅ Disconnected from device");
    } catch (error) {
      console.error("❌ Disconnect failed:", error);
      // Ensure cleanup even on error
      this.handleDisconnection();
    }
  }

  /**
   * Set a listener to be called when device disconnects unexpectedly
   */
  setDisconnectionListener(listener: () => void): void {
    this.disconnectionListener = listener;
  }

  /**
   * Remove disconnection listener
   */
  removeDisconnectionListener(): void {
    this.disconnectionListener = null;
  }

  /**
   * Set a callback for test progress updates (heartbeat messages)
   */
  setProgressCallback(
    callback: (phase: string, countdown: number) => void,
  ): void {
    this.progressCallback = callback;
  }

  /**
   * Remove progress callback
   */
  removeProgressCallback(): void {
    this.progressCallback = null;
  }

  /**
   * Set a callback for realtime sensor stream updates
   */
  setRealtimeDataCallback(callback: (data: RealtimeSensorData) => void): void {
    this.realtimeDataCallback = callback;
  }

  /**
   * Remove realtime sensor stream callback
   */
  removeRealtimeDataCallback(): void {
    this.realtimeDataCallback = null;
  }

  /**
   * Send command to ESP32 device
   */
  private async sendCommand(command: TestCommand): Promise<void> {
    if (!this.connectedDevice) {
      throw new Error("No device connected");
    }

    const jsonCommand = JSON.stringify(command);
    const base64Command = base64.encode(jsonCommand);

    console.log(`📤 Sending command: ${jsonCommand}`);

    // Start keep-alive BEFORE sending command to maintain connection
    this.startKeepAlive();

    // Use writeWithoutResponse - faster and doesn't wait for BLE ACK
    await this.connectedDevice.writeCharacteristicWithoutResponseForService(
      SERVICE_UUID,
      CONTROL_CHARACTERISTIC_UUID,
      base64Command,
    );

    console.log("✅ Write command completed");
  }

  /**
   * Wait for test result from device
   */
  private waitForTestResult(timeout: number = TEST_TIMEOUT): Promise<any> {
    return new Promise((resolve, reject) => {
      // Clear any existing timer and callback
      if (this.pendingResultTimer) {
        clearTimeout(this.pendingResultTimer);
        this.pendingResultTimer = null;
      }

      console.log("🔧 Setting up new callback and timer");

      // Set timeout
      this.pendingResultTimer = setTimeout(() => {
        console.log("❌ Device response timeout triggered");
        this.pendingResultCallback = null;
        this.pendingResultTimer = null;
        reject(new Error("Device response timeout"));
      }, timeout);

      // Set callback
      this.pendingResultCallback = (result: any) => {
        console.log("✅ Callback triggered, resolving promise");
        // Clear timer immediately when callback is called
        if (this.pendingResultTimer) {
          clearTimeout(this.pendingResultTimer);
          this.pendingResultTimer = null;
        }
        this.pendingResultCallback = null;
        resolve(result);
      };

      console.log("✅ Callback and timer set, waiting for response...");
    });
  }

  /**
   * Notify IoT device that challan has been created
   */
  async notifyChallanCreated(
    deviceId: number,
    violationType: string,
  ): Promise<any> {
    const command: TestCommand = {
      command: "CHALLAN_CREATED",
      device_id: deviceId,
      violation_type: violationType,
      timestamp: new Date().toISOString(),
    };

    // Set up callback BEFORE sending command to avoid race condition
    const resultPromise = this.waitForTestResult(5000);
    await this.sendCommand(command);
    return await resultPromise;
  }

  /**
   * Start noise test
   */
  async startNoiseTest(deviceId: number, officerId: number): Promise<any> {
    this.lastDeviceId = deviceId;
    const command: TestCommand = {
      command: "START_NOISE_TEST",
      device_id: deviceId,
      officer_id: officerId,
      timestamp: new Date().toISOString(),
    };

    // Set up callback BEFORE sending command to avoid race condition
    const resultPromise = this.waitForTestResult();
    await this.sendCommand(command);
    return await resultPromise;
  }

  /**
   * Start emission test
   */
  async startEmissionTest(deviceId: number, officerId: number): Promise<any> {
    this.lastDeviceId = deviceId;
    const command: TestCommand = {
      command: "START_EMISSION_TEST",
      device_id: deviceId,
      officer_id: officerId,
      timestamp: new Date().toISOString(),
    };

    // Verify connection is still active before starting
    if (!this.connectedDevice) {
      throw new Error("No device connected");
    }

    const isConnected = await this.connectedDevice.isConnected();
    console.log(`🔗 Device connection status before test: ${isConnected}`);

    if (!isConnected) {
      throw new Error("Device disconnected before test could start");
    }

    // Set up callback BEFORE sending command to avoid race condition
    const resultPromise = this.waitForTestResult(TEST_TIMEOUT);

    try {
      await this.sendCommand(command);
      console.log("✅ Command sent successfully, waiting for response...");

      // Start polling for data (keep-alive already started in sendCommand)
      this.startPollingForResponse();
    } catch (sendError: any) {
      console.error("❌ Failed to send command:", sendError.message);
      // Stop keep-alive and clear callbacks
      this.stopKeepAlive();
      if (this.pendingResultTimer) {
        clearTimeout(this.pendingResultTimer);
        this.pendingResultTimer = null;
      }
      this.pendingResultCallback = null;
      throw sendError;
    }

    return await resultPromise;
  }

  /**
   * Start realtime sensor streaming
   */
  async startRealtimeStream(
    deviceId: number,
    officerId?: number,
  ): Promise<void> {
    this.lastDeviceId = deviceId;
    const command: TestCommand = {
      command: "START_REALTIME_STREAM",
      device_id: deviceId,
      officer_id: officerId,
      timestamp: new Date().toISOString(),
    };

    await this.sendCommand(command);
  }

  /**
   * Stop realtime sensor streaming
   */
  async stopRealtimeStream(deviceId?: number): Promise<void> {
    const command: TestCommand = {
      command: "STOP_REALTIME_STREAM",
      device_id: deviceId || this.lastDeviceId,
      timestamp: new Date().toISOString(),
    };

    await this.sendCommand(command);
    this.stopKeepAlive();
  }

  /**
   * Keep-alive interval to prevent BLE disconnection
   */
  private keepAliveInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Poll for response as backup when notifications don't work
   * Also keeps connection alive by reading RSSI every 500ms
   */
  private pollingInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Start keep-alive mechanism - simple RSSI reads (ESP32 is now non-blocking)
   */
  private startKeepAlive(): void {
    console.log("💓 Starting keep-alive mechanism (RSSI every 2 seconds)...");

    this.keepAliveInterval = setInterval(async () => {
      try {
        if (!this.connectedDevice) {
          this.stopKeepAlive();
          return;
        }

        // Check if still connected
        const isConnected = await this.connectedDevice.isConnected();
        if (!isConnected) {
          console.log("💓 Keep-alive: Connection lost");
          this.stopKeepAlive();
          return;
        }

        // Read RSSI to generate BLE traffic and keep connection alive
        const rssi = await this.connectedDevice.readRSSI();
        console.log(`💓 Keep-alive OK, RSSI: ${rssi}`);
      } catch (error: any) {
        console.log("💓 Keep-alive error:", error.message || error);
      }
    }, 2000); // Every 2 seconds
  }

  private stopKeepAlive(): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  private startPollingForResponse(): void {
    console.log("📡 Starting polling for response (every 2 seconds)...");

    // Ensure keep-alive is running (may already be started by sendCommand)
    if (!this.keepAliveInterval) {
      this.startKeepAlive();
    }

    // Poll every 2 seconds to check for data
    this.pollingInterval = setInterval(async () => {
      try {
        if (!this.connectedDevice) {
          console.log("📡 Polling: No device reference");
          this.stopPolling();
          return;
        }

        // Check connection status
        const isConnected = await this.connectedDevice.isConnected();
        if (!isConnected) {
          console.log("📡 Polling: Device disconnected");
          this.stopPolling();
          return;
        }

        console.log("📡 Polling: Connection active, checking for data...");

        // Try to read the data characteristic
        try {
          const characteristic =
            await this.connectedDevice.readCharacteristicForService(
              SERVICE_UUID,
              DATA_CHARACTERISTIC_UUID,
            );

          if (characteristic?.value) {
            const data = base64.decode(characteristic.value);
            console.log(
              "📡 Raw data from read:",
              data ? data.substring(0, 50) : "empty",
            );

            // Only process if we got actual JSON data (not empty)
            if (data && data.trim().startsWith("{")) {
              console.log(
                "📡 ✅ Polling received valid JSON:",
                data.substring(0, 100),
              );

              // Process as if it came via notification
              this.handleNotification(characteristic);
            } else {
              console.log("📡 Data not valid JSON yet, continuing to poll...");
            }
          } else {
            console.log("📡 No characteristic value");
          }
        } catch (readError: any) {
          console.log("📡 Read error:", readError.message || readError);
        }
      } catch (error: any) {
        console.log("📡 Polling error (continuing):", error.message || error);
      }
    }, 2000); // Poll every 2 seconds for data
  }

  private stopPolling(): void {
    // Stop polling
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    // Also stop keep-alive
    this.stopKeepAlive();
    console.log("📡 Polling and keep-alive stopped");
  }

  /**
   * Get device status
   */
  async getDeviceStatus(deviceId?: number): Promise<any> {
    const command: TestCommand = {
      command: "GET_STATUS",
      device_id: deviceId || this.lastDeviceId,
    };

    // Set up callback BEFORE sending command to avoid race condition
    const resultPromise = this.waitForTestResult(10000);
    await this.sendCommand(command);
    return await resultPromise;
  }

  /**
   * Calibrate device (Station Authority only)
   */
  async calibrateDevice(
    deviceId: number,
    referenceSound: number,
    referenceCO: number,
    referenceHC: number,
  ): Promise<any> {
    const command: TestCommand = {
      command: "CALIBRATE",
      device_id: deviceId,
      reference_sound: referenceSound,
      reference_co: referenceCO,
      reference_hc: referenceHC,
    };

    // Set up callback BEFORE sending command to avoid race condition
    const resultPromise = this.waitForTestResult(30000);
    await this.sendCommand(command);
    return await resultPromise;
  }

  /**
   * Check if device is connected
   */
  async isConnected(): Promise<boolean> {
    if (!this.connectedDevice) {
      return false;
    }

    try {
      // Check actual connection state with BLE manager
      const isConnected = await this.connectedDevice.isConnected();
      if (!isConnected) {
        console.log("⚠️ Device no longer connected - cleaning up");
        this.handleDisconnection();
      }
      return isConnected;
    } catch (error) {
      console.error("❌ Error checking connection state:", error);
      this.handleDisconnection();
      return false;
    }
  }

  /**
   * Get connected device ID
   */
  getConnectedDeviceId(): string | null {
    return this.connectedDevice?.id || null;
  }

  /**
   * Check if Bluetooth is enabled
   */
  async isBluetoothEnabled(): Promise<boolean> {
    this.ensureBleAvailable();

    try {
      const state = await this.manager.state();
      return state === State.PoweredOn;
    } catch (error) {
      console.error("❌ Error checking Bluetooth state:", error);
      return false;
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    if (!this.bleSupported) {
      return;
    }

    // Clear pending callbacks
    if (this.pendingResultTimer) {
      clearTimeout(this.pendingResultTimer);
      this.pendingResultTimer = null;
    }
    this.pendingResultCallback = null;
    this.realtimeDataCallback = null;

    // Disconnect if connected
    await this.disconnect();

    // Destroy manager
    await this.manager.destroy();
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================
export default new BleDeviceService();
