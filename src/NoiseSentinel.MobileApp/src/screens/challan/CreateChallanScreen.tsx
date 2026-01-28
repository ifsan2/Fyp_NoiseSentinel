import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { Scan } from "lucide-react-native";
import accusedApi from "../../api/accusedApi";
import challanApi from "../../api/challanApi";
import vehicleApi from "../../api/vehicleApi";
import violationApi from "../../api/violationApi";
import emissionReportApi from "../../api/emissionReportApi";
import iotDeviceApi from "../../api/iotDeviceApi";
import { ViolationSelector } from "../../components/challan/ViolationSelector";
import { ChallanTypeBadge } from "../../components/challan/ChallanTypeBadge";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { Header } from "../../components/common/Header";
import { Input } from "../../components/common/Input";
import { CreateChallanDto } from "../../models/Challan";
import { ViolationListItemDto } from "../../models/Violation";
import {
  getChallanType,
  isEmissionReportRecommended,
  getViolationCategory,
} from "../../utils/challanTypeHelper";
import { colors } from "../../styles/colors";
import { validation } from "../../utils/validation";
import { BANK_DETAILS } from "../../utils/constants";

interface CreateChallanScreenProps {
  navigation: any;
  route: any;
}

export const CreateChallanScreen: React.FC<CreateChallanScreenProps> = ({
  navigation,
  route,
}) => {
  // Route params
  const challanType = route.params?.challanType; // "Traffic" or "Non-Traffic"
  const violationCategory = route.params?.violationCategory; // "Noise" or "Emission"
  const deviceId = route.params?.deviceId;
  const emissionReportId = route.params?.emissionReportId;

  // Determine initial step based on challan type
  // Both Traffic and Non-Traffic: Start with violation selection (step 1)
  const [step, setStep] = useState(1);
  const [violations, setViolations] = useState<ViolationListItemDto[]>([]);
  const [loading, setLoading] = useState(false);

  // Step 1: Violation
  const [selectedViolation, setSelectedViolation] =
    useState<ViolationListItemDto | null>(null);

  // For Non-Traffic: Device scan data
  const [pairedDeviceId, setPairedDeviceId] = useState<number | null>(
    deviceId || null,
  );
  const [deviceName, setDeviceName] = useState("");
  const [soundLevel, setSoundLevel] = useState("");
  const [co, setCo] = useState("");
  const [co2, setCo2] = useState("");
  const [hc, setHc] = useState("");
  const [nox, setNox] = useState("");
  const [mlClassification, setMlClassification] = useState("");
  const [scanned, setScanned] = useState(false);
  const [createdEmissionReportId, setCreatedEmissionReportId] = useState<
    number | null
  >(emissionReportId || null);

  // Step 2: Vehicle
  const [vehicleSearchPlate, setVehicleSearchPlate] = useState("");
  const [vehicleId, setVehicleId] = useState<number | null>(null);
  const [vehicleFound, setVehicleFound] = useState(false);
  const [vehiclePlateNumber, setVehiclePlateNumber] = useState("");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [vehicleChasisNo, setVehicleChasisNo] = useState("");
  const [vehicleEngineNo, setVehicleEngineNo] = useState("");
  const [vehicleRegYear, setVehicleRegYear] = useState("");

  // Step 3: Accused
  const [accusedSearchCnic, setAccusedSearchCnic] = useState("");
  const [accusedId, setAccusedId] = useState<number | null>(null);
  const [accusedFound, setAccusedFound] = useState(false);
  const [accusedFullName, setAccusedFullName] = useState("");
  const [accusedCnic, setAccusedCnic] = useState("");
  const [accusedCity, setAccusedCity] = useState("");
  const [accusedProvince, setAccusedProvince] = useState("");
  const [accusedAddress, setAccusedAddress] = useState("");
  const [accusedContact, setAccusedContact] = useState("");
  const [accusedEmail, setAccusedEmail] = useState("");

  // Step 4: Evidence & Bank
  const [evidencePath, setEvidencePath] = useState("");
  const [evidenceImage, setEvidenceImage] = useState<string | null>(null);

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (challanType === "Traffic") {
      loadViolations();
    } else if (challanType === "Non-Traffic") {
      loadViolations();
      if (pairedDeviceId) {
        loadDeviceInfo();
      }
    }

    // Prevent back button if emissionReportId exists
    if (emissionReportId || createdEmissionReportId) {
      const unsubscribe = navigation.addListener("beforeRemove", (e: any) => {
        // Prevent default back action
        e.preventDefault();

        // Show confirmation dialog
        Alert.alert(
          "Cancel Challan Creation?",
          "An emission report has been generated. The report will remain in the system without a challan. Are you sure you want to cancel?",
          [
            { text: "No, Continue", style: "cancel" },
            {
              text: "Yes, Cancel",
              style: "destructive",
              onPress: () => navigation.dispatch(e.data.action),
            },
          ],
        );
      });

      return unsubscribe;
    }
  }, [challanType, navigation, emissionReportId, createdEmissionReportId]);

  const loadDeviceInfo = async () => {
    if (!pairedDeviceId) return;

    try {
      const device = await iotDeviceApi.getDeviceById(pairedDeviceId);
      if (device) {
        setDeviceName(device.deviceName);
      }
    } catch (error) {
      console.error("Error loading device info:", error);
    }
  };

  const loadViolations = async () => {
    try {
      setLoading(true);
      const allViolations = await violationApi.getAllViolations();

      console.log("📋 All Violations:", allViolations);
      console.log("🏷️ Challan Type:", challanType);

      if (challanType === "Traffic") {
        // Traffic: Show only traffic violations (no noise/emission keywords)
        const trafficViolations = allViolations.filter((v) => {
          const category = getViolationCategory(v.violationType);
          console.log(`  - ${v.violationType} → ${category}`);
          return category === "Traffic" && v.isCognizable === false;
        });
        console.log("🚦 Traffic Violations:", trafficViolations);
        setViolations(trafficViolations);

        if (trafficViolations.length === 0) {
          Toast.show({
            type: "warning",
            text1: "No Traffic Violations",
            text2: "Please add traffic violations in the system",
          });
        }
      } else if (challanType === "Non-Traffic") {
        // Non-Traffic: Show all non-traffic violations (noise + emission)
        const nonTrafficViolations = allViolations.filter((v) => {
          const category = getViolationCategory(v.violationType);
          console.log(`  - ${v.violationType} → ${category}`);
          return category === "Non-Traffic";
        });
        console.log("🔊 Non-Traffic Violations:", nonTrafficViolations);
        setViolations(nonTrafficViolations);

        if (nonTrafficViolations.length === 0) {
          Toast.show({
            type: "warning",
            text1: "No Non-Traffic Violations",
            text2: "Please add non-traffic violations in the system",
          });
        }
      }
    } catch (error) {
      console.error("❌ Error loading violations:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load violations",
      });
    } finally {
      setLoading(false);
    }
  };

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera roll permissions to upload evidence images.",
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7, // Compress to 70% quality
        base64: true, // Get base64 string
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        // Create base64 data URI
        const base64Image = `data:image/jpeg;base64,${asset.base64}`;

        setEvidenceImage(asset.uri); // For preview
        setEvidencePath(base64Image); // For upload

        Toast.show({
          type: "success",
          text1: "Image Selected",
          text2: "Evidence image added successfully",
        });
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to pick image",
      });
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    // Request camera permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera permissions to take photos.",
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        const base64Image = `data:image/jpeg;base64,${asset.base64}`;

        setEvidenceImage(asset.uri);
        setEvidencePath(base64Image);

        Toast.show({
          type: "success",
          text1: "Photo Captured",
          text2: "Evidence photo added successfully",
        });
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to take photo",
      });
    }
  };

  const removeImage = () => {
    setEvidenceImage(null);
    setEvidencePath("");
    Toast.show({
      type: "info",
      text1: "Image Removed",
      text2: "Evidence image removed",
    });
  };

  const handleSearchVehicle = async () => {
    if (!vehicleSearchPlate.trim()) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Enter plate number to search",
      });
      return;
    }

    try {
      const vehicle =
        await vehicleApi.getVehicleByPlateNumber(vehicleSearchPlate);
      setVehicleId(vehicle.vehicleId);
      setVehiclePlateNumber(vehicle.plateNumber);
      setVehicleMake(vehicle.make || "");
      setVehicleColor(vehicle.color || "");
      setVehicleFound(true);

      Toast.show({
        type: "success",
        text1: "Vehicle Found!",
        text2: `${vehicle.plateNumber} - ${vehicle.make}`,
      });
    } catch (error) {
      setVehicleFound(false);
      setVehicleId(null);
      setVehiclePlateNumber(vehicleSearchPlate);

      Toast.show({
        type: "info",
        text1: "Vehicle Not Found",
        text2: "Fill in details to create new vehicle record",
      });
    }
  };

  const handleSearchAccused = async () => {
    if (!accusedSearchCnic.trim()) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Enter CNIC to search",
      });
      return;
    }

    if (!validation.cnic(accusedSearchCnic)) {
      Toast.show({
        type: "error",
        text1: "Invalid CNIC",
        text2: "Format: 12345-1234567-1",
      });
      return;
    }

    try {
      const accused = await accusedApi.getAccusedByCnic(accusedSearchCnic);
      setAccusedId(accused.accusedId);
      setAccusedFullName(accused.fullName);
      setAccusedCnic(accused.cnic);
      setAccusedCity(accused.city || "");
      setAccusedProvince(accused.province || "");
      setAccusedAddress(accused.address || "");
      setAccusedContact(accused.contact || "");
      setAccusedEmail(accused.email || "");
      setAccusedFound(true);

      Toast.show({
        type: "success",
        text1: "Person Found!",
        text2: `${accused.fullName} (${accused.cnic})`,
      });
    } catch (error) {
      setAccusedFound(false);
      setAccusedId(null);
      setAccusedCnic(accusedSearchCnic);

      Toast.show({
        type: "info",
        text1: "Person Not Found",
        text2: "Fill in details to create new accused record",
      });
    }
  };

  const handleScan = () => {
    if (!selectedViolation) return;

    // Determine category from selected violation type
    const violationType = selectedViolation.violationType.toLowerCase();
    const isNoise =
      violationType.includes("noise") ||
      violationType.includes("sound") ||
      violationType.includes("silencer");

    if (isNoise) {
      // Noise: Only sound level
      setSoundLevel("92.5");
      setCo("");
      setCo2("");
      setHc("");
      setNox("");
      setMlClassification("Excessive Noise Detected");
    } else {
      // Emission: Only gases, no sound
      setSoundLevel("");
      setCo("2.3");
      setCo2("14.7");
      setHc("180");
      setNox("850");
      setMlClassification("Excessive Emissions Detected");
    }
    setScanned(true);

    Toast.show({
      type: "success",
      text1: "Scan Complete",
      text2: `${isNoise ? "Noise" : "Emission"} data captured successfully`,
    });
  };

  const createEmissionReport = async (): Promise<number | null> => {
    if (!pairedDeviceId || !scanned || !selectedViolation) return null;

    try {
      // Determine category from selected violation type
      const violationType = selectedViolation.violationType.toLowerCase();
      const isNoise =
        violationType.includes("noise") ||
        violationType.includes("sound") ||
        violationType.includes("silencer");

      const reportData: any = {
        deviceId: pairedDeviceId,
        mlClassification: mlClassification,
        testDateTime: new Date().toISOString(),
      };

      // For Noise violations: send sound level, set gases to 0 or omit
      if (isNoise) {
        reportData.soundLevelDBa = soundLevel ? parseFloat(soundLevel) : 0;
        // Don't send gas values for noise violations (backend accepts null/undefined for optional fields)
      }
      // For Emission violations: send gases, set sound to 0
      else {
        reportData.soundLevelDBa = 0; // Required by backend, send 0 for emission-only
        // Send gas measurements
        if (co) reportData.co = parseFloat(co);
        if (co2) reportData.co2 = parseFloat(co2);
        if (hc) reportData.hc = parseFloat(hc);
        if (nox) reportData.nox = parseFloat(nox);
      }

      const report = await emissionReportApi.createEmissionReport(reportData);
      return report.emissionReportId;
    } catch (error) {
      console.error("Error creating emission report:", error);
      throw error;
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: any = {};

    // For Traffic: steps are 1 (violation) → 2 (vehicle) → 3 (accused) → 4 (evidence)
    // For Non-Traffic: steps are 1 (violation) → 2 (vehicle) → 3 (accused) → 4 (scan) → 5 (evidence)

    if (challanType === "Traffic") {
      switch (currentStep) {
        case 1:
          if (!selectedViolation) {
            Toast.show({
              type: "error",
              text1: "Error",
              text2: "Please select a violation",
            });
            return false;
          }
          break;

        case 2:
          if (!vehiclePlateNumber.trim()) {
            newErrors.vehiclePlateNumber = "Plate number is required";
          }
          if (!vehicleId && !vehicleMake.trim()) {
            newErrors.vehicleMake = "Make/Model is required for new vehicle";
          }
          break;

        case 3:
          if (!accusedCnic.trim()) {
            newErrors.accusedCnic = "CNIC is required";
          } else if (!validation.cnic(accusedCnic)) {
            newErrors.accusedCnic = "Invalid CNIC format";
          }

          if (!accusedId) {
            if (!accusedFullName.trim())
              newErrors.accusedFullName = "Full name required";
            if (!accusedCity.trim()) newErrors.accusedCity = "City required";
            if (!accusedProvince.trim())
              newErrors.accusedProvince = "Province required";
            if (!accusedAddress.trim())
              newErrors.accusedAddress = "Address required";
            if (!accusedContact.trim())
              newErrors.accusedContact = "Contact required";
          }
          break;
      }
    } else {
      // Non-Traffic flow
      switch (currentStep) {
        case 1: // Violation (first)
          if (!selectedViolation) {
            Toast.show({
              type: "error",
              text1: "Error",
              text2: "Please select a violation",
            });
            return false;
          }
          break;

        case 2: // Vehicle
          if (!vehiclePlateNumber.trim()) {
            newErrors.vehiclePlateNumber = "Plate number is required";
          }
          if (!vehicleId && !vehicleMake.trim()) {
            newErrors.vehicleMake = "Make/Model is required for new vehicle";
          }
          break;

        case 3: // Accused
          if (!accusedCnic.trim()) {
            newErrors.accusedCnic = "CNIC is required";
          } else if (!validation.cnic(accusedCnic)) {
            newErrors.accusedCnic = "Invalid CNIC format";
          }

          if (!accusedId) {
            if (!accusedFullName.trim())
              newErrors.accusedFullName = "Full name required";
            if (!accusedCity.trim()) newErrors.accusedCity = "City required";
            if (!accusedProvince.trim())
              newErrors.accusedProvince = "Province required";
            if (!accusedAddress.trim())
              newErrors.accusedAddress = "Address required";
            if (!accusedContact.trim())
              newErrors.accusedContact = "Contact required";
          }
          break;

        case 4: // Scan
          if (!scanned) {
            Toast.show({
              type: "error",
              text1: "Error",
              text2: "Please scan device data first",
            });
            return false;
          }
          break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(step)) return;

    // For Non-Traffic, after scan (step 4), create emission report before moving to evidence
    if (
      challanType === "Non-Traffic" &&
      step === 4 &&
      scanned &&
      !createdEmissionReportId
    ) {
      try {
        setLoading(true);
        const reportId = await createEmissionReport();
        if (reportId) {
          setCreatedEmissionReportId(reportId);
          Toast.show({
            type: "success",
            text1: "Report Created",
            text2: `Emission Report #${reportId} created successfully`,
          });
        }
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to create emission report",
        });
        return;
      } finally {
        setLoading(false);
      }
    }

    setStep(step + 1);
  };

  const handleBack = () => {
    const minStep = 1; // Both flows start at step 1 now

    if (step > minStep) {
      setStep(step - 1);
    } else {
      // If emissionReportId exists, show confirmation
      if (emissionReportId || createdEmissionReportId) {
        Alert.alert(
          "Cancel Challan Creation?",
          "An emission report has been generated. The report will remain in the system without a challan. Are you sure you want to cancel?",
          [
            { text: "No, Continue", style: "cancel" },
            {
              text: "Yes, Cancel",
              style: "destructive",
              onPress: () => navigation.goBack(),
            },
          ],
        );
      } else {
        navigation.goBack();
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    try {
      setLoading(true);

      // Build the data object, only including defined fields
      const data: CreateChallanDto = {
        violationId: selectedViolation!.violationId,
        // EmissionReportId - use created one for Non-Traffic or existing one
        emissionReportId: createdEmissionReportId || emissionReportId || null,
      };

      // Add vehicle info - either ID or input
      if (vehicleId) {
        data.vehicleId = vehicleId;
      } else {
        // Build vehicle input, only include fields with values
        const vehicleInput: any = {
          plateNumber: vehiclePlateNumber,
          make: vehicleMake,
        };

        if (vehicleColor) vehicleInput.color = vehicleColor;
        if (vehicleChasisNo) vehicleInput.chasisNo = vehicleChasisNo;
        if (vehicleEngineNo) vehicleInput.engineNo = vehicleEngineNo;
        // Backend expects DateTime for vehRegYear, send as ISO date string (Jan 1 of that year)
        if (vehicleRegYear) {
          vehicleInput.vehRegYear = `${vehicleRegYear}-01-01T00:00:00Z`;
        }

        data.vehicleInput = vehicleInput;
      }

      // Add accused info - either ID or input
      if (accusedId) {
        data.accusedId = accusedId;
      } else {
        data.accusedInput = {
          fullName: accusedFullName,
          cnic: accusedCnic,
          city: accusedCity,
          province: accusedProvince,
          address: accusedAddress,
          contact: accusedContact,
          email: accusedEmail || undefined,
        };
      }

      // Add optional fields only if they have values
      if (evidencePath) {
        data.evidencePath = evidencePath;
      }
      // Bank details will be auto-appended by backend from appsettings.json

      console.log("📤 Submitting Challan:", JSON.stringify(data, null, 2));

      const response = await challanApi.createChallan(data);

      Toast.show({
        type: "success",
        text1: "Challan Created Successfully!",
        text2: response.isCognizable
          ? "⚖️ Cognizable - FIR can be filed"
          : `Penalty: PKR ${response.penaltyAmount}`,
        visibilityTime: 2000,
      });

      // Navigate to the created challan's detail page or My Challans list
      setTimeout(() => {
        if (response.challanId) {
          // Navigate to the challan detail screen
          navigation.navigate("ChallanDetail", {
            challanId: response.challanId,
          });
        } else {
          // Fallback: Navigate to My Challans list
          navigation.navigate("MyChallans");
        }
      }, 1500);
    } catch (error: any) {
      console.error("❌ Create Challan Error:", error);
      console.error(
        "❌ Response Data:",
        JSON.stringify(error.response?.data, null, 2),
      );
      console.error(
        "❌ Validation Errors:",
        JSON.stringify(error.response?.data?.errors, null, 2),
      );

      // Show validation errors if available
      let errorMessage = "Failed to create challan";
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0];
        errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Toast.show({
        type: "error",
        text1: "Error Creating Challan",
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    // Traffic: 4 steps, Non-Traffic: 5 steps
    const steps = challanType === "Traffic" ? [1, 2, 3, 4] : [1, 2, 3, 4, 5];

    return (
      <View style={styles.stepIndicator}>
        {steps.map((s) => (
          <View
            key={s}
            style={[
              styles.stepDot,
              step >= s && styles.stepDotActive,
              step === s && styles.stepDotCurrent,
            ]}
          >
            <Text
              style={[styles.stepNumber, step >= s && styles.stepNumberActive]}
            >
              {s}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderStep1 = () => (
    <ScrollView style={styles.stepContent}>
      <Text style={styles.stepTitle}>Step 1: Select Violation</Text>

      {selectedViolation && (
        <View style={styles.challanTypeContainer}>
          <Text style={styles.challanTypeLabel}>Challan Type:</Text>
          <ChallanTypeBadge
            type={getChallanType(
              selectedViolation.violationType,
              emissionReportId,
            )}
            size="large"
          />
          {isEmissionReportRecommended(selectedViolation.violationType) &&
            !emissionReportId && (
              <Text style={styles.warningText}>
                ⚠️ This is a Non-Traffic violation. Emission report is required.
              </Text>
            )}
        </View>
      )}

      <ViolationSelector
        violations={violations}
        selectedViolationId={selectedViolation?.violationId}
        onSelect={setSelectedViolation}
      />
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView style={styles.stepContent} keyboardShouldPersistTaps="handled">
      <Text style={styles.stepTitle}>Step 2: Vehicle Details</Text>

      <Card>
        <Text style={styles.cardTitle}>🔍 Search Existing Vehicle</Text>
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrapper}>
            <Input
              placeholder="Enter plate number (e.g., PK-ABC-123)"
              value={vehicleSearchPlate}
              onChangeText={setVehicleSearchPlate}
              autoCapitalize="characters"
            />
          </View>
          <View style={styles.searchButtonWrapper}>
            <Button title="Search" onPress={handleSearchVehicle} size="small" />
          </View>
        </View>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>
          {vehicleFound ? "✓ Vehicle Found" : "📝 Create New Vehicle"}
        </Text>

        <Input
          label="Plate Number"
          value={vehiclePlateNumber}
          onChangeText={setVehiclePlateNumber}
          error={errors.vehiclePlateNumber}
          autoCapitalize="characters"
          required
          editable={!vehicleFound}
        />

        <Input
          label="Make/Model"
          placeholder="e.g., Honda City 2020"
          value={vehicleMake}
          onChangeText={setVehicleMake}
          error={errors.vehicleMake}
          required={!vehicleId}
          editable={!vehicleFound}
        />

        <Input
          label="Color"
          placeholder="e.g., White"
          value={vehicleColor}
          onChangeText={setVehicleColor}
          editable={!vehicleFound}
        />

        {!vehicleFound && (
          <>
            <Input
              label="Chasis Number"
              placeholder="Optional"
              value={vehicleChasisNo}
              onChangeText={setVehicleChasisNo}
            />

            <Input
              label="Engine Number"
              placeholder="Optional"
              value={vehicleEngineNo}
              onChangeText={setVehicleEngineNo}
            />

            <Input
              label="Registration Year"
              placeholder="YYYY"
              value={vehicleRegYear}
              onChangeText={setVehicleRegYear}
              keyboardType="numeric"
            />
          </>
        )}
      </Card>
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView style={styles.stepContent} keyboardShouldPersistTaps="handled">
      <Text style={styles.stepTitle}>Step 3: Accused/Owner Details</Text>

      <Card>
        <Text style={styles.cardTitle}>🔍 Search Existing Person</Text>
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrapper}>
            <Input
              placeholder="Enter CNIC (12345-1234567-1)"
              value={accusedSearchCnic}
              onChangeText={setAccusedSearchCnic}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.searchButtonWrapper}>
            <Button title="Search" onPress={handleSearchAccused} size="small" />
          </View>
        </View>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>
          {accusedFound ? "✓ Person Found" : "📝 Create New Accused Record"}
        </Text>

        <Input
          label="Full Name"
          value={accusedFullName}
          onChangeText={setAccusedFullName}
          error={errors.accusedFullName}
          required={!accusedId}
          editable={!accusedFound}
        />

        <Input
          label="CNIC"
          placeholder="12345-1234567-1"
          value={accusedCnic}
          onChangeText={setAccusedCnic}
          error={errors.accusedCnic}
          keyboardType="numeric"
          required
          editable={!accusedFound}
        />

        {!accusedFound && (
          <>
            <Input
              label="City"
              placeholder="e.g., Lahore"
              value={accusedCity}
              onChangeText={setAccusedCity}
              error={errors.accusedCity}
              required
            />

            <Input
              label="Province"
              placeholder="e.g., Punjab"
              value={accusedProvince}
              onChangeText={setAccusedProvince}
              error={errors.accusedProvince}
              required
            />

            <Input
              label="Address"
              placeholder="Full address"
              value={accusedAddress}
              onChangeText={setAccusedAddress}
              error={errors.accusedAddress}
              multiline
              numberOfLines={2}
              required
            />

            <Input
              label="Contact Number"
              placeholder="+92-300-1234567"
              value={accusedContact}
              onChangeText={setAccusedContact}
              error={errors.accusedContact}
              keyboardType="phone-pad"
              required
            />

            <Input
              label="Email Address"
              placeholder="example@email.com (for notifications)"
              value={accusedEmail}
              onChangeText={setAccusedEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </>
        )}
      </Card>
    </ScrollView>
  );

  const renderScanStep = () => {
    if (!selectedViolation) return null;

    // Determine category from selected violation type
    const violationType = selectedViolation.violationType.toLowerCase();
    const isNoise =
      violationType.includes("noise") ||
      violationType.includes("sound") ||
      violationType.includes("silencer");
    const category = isNoise ? "Noise" : "Emission";

    return (
      <ScrollView style={styles.stepContent}>
        <Text style={styles.stepTitle}>Step 4: Device Scan</Text>

        <Card>
          <Text style={styles.cardTitle}>📡 IoT Device Information</Text>
          {pairedDeviceId ? (
            <View style={styles.deviceInfo}>
              <Text style={styles.deviceLabel}>Device ID:</Text>
              <Text style={styles.deviceValue}>{pairedDeviceId}</Text>
              <Text style={styles.deviceLabel}>Category:</Text>
              <Text style={styles.deviceValue}>
                {isNoise ? "🔊 Noise Monitor" : "💨 Emission Analyzer"}
              </Text>
              <Text style={styles.deviceLabel}>Status:</Text>
              <Text style={[styles.deviceValue, styles.deviceActive]}>
                ✓ Connected
              </Text>
            </View>
          ) : (
            <Text style={styles.warningText}>
              ⚠️ No device paired. Please pair a device first.
            </Text>
          )}
        </Card>

        {!scanned && pairedDeviceId && (
          <Card>
            <Text style={styles.cardTitle}>
              {isNoise ? "🔊 Scan Sound Level" : "💨 Scan Emission Levels"}
            </Text>
            <Text style={styles.helperText}>
              {isNoise
                ? "Position the device near the vehicle's exhaust to measure sound levels"
                : "Connect the device to measure emission gas levels"}
            </Text>
            <Button
              title="Start Scan"
              onPress={handleScan}
              fullWidth
              variant="primary"
            />
          </Card>
        )}

        {scanned && (
          <Card>
            <Text style={[styles.cardTitle, styles.successText]}>
              ✓ Scan Complete
            </Text>

            {isNoise && (
              <View style={styles.scanResults}>
                <View style={styles.scanResultRow}>
                  <Text style={styles.scanLabel}>Sound Level:</Text>
                  <Text
                    style={[
                      styles.scanValue,
                      soundLevel && parseFloat(soundLevel) > 85
                        ? styles.scanValueDanger
                        : styles.scanValueNormal,
                    ]}
                  >
                    {soundLevel} dB
                  </Text>
                </View>
                {soundLevel && parseFloat(soundLevel) > 85 && (
                  <Text style={styles.warningText}>
                    ⚠️ Sound level exceeds legal limit (85 dB)
                  </Text>
                )}
              </View>
            )}

            {!isNoise && (
              <View style={styles.scanResults}>
                <View style={styles.scanResultRow}>
                  <Text style={styles.scanLabel}>CO (Carbon Monoxide):</Text>
                  <Text style={styles.scanValue}>{co} ppm</Text>
                </View>
                <View style={styles.scanResultRow}>
                  <Text style={styles.scanLabel}>CO₂ (Carbon Dioxide):</Text>
                  <Text style={styles.scanValue}>{co2} ppm</Text>
                </View>
                <View style={styles.scanResultRow}>
                  <Text style={styles.scanLabel}>HC (Hydrocarbons):</Text>
                  <Text style={styles.scanValue}>{hc} ppm</Text>
                </View>
                <View style={styles.scanResultRow}>
                  <Text style={styles.scanLabel}>NOx (Nitrogen Oxides):</Text>
                  <Text style={styles.scanValue}>{nox} ppm</Text>
                </View>
                {mlClassification && (
                  <View style={styles.classificationContainer}>
                    <Text style={styles.scanLabel}>Classification:</Text>
                    <Text
                      style={[
                        styles.classificationText,
                        mlClassification === "Pass"
                          ? styles.classificationPass
                          : styles.classificationFail,
                      ]}
                    >
                      {mlClassification}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </Card>
        )}
      </ScrollView>
    );
  };

  const renderStep4 = () => (
    <ScrollView style={styles.stepContent} keyboardShouldPersistTaps="handled">
      <Text style={styles.stepTitle}>Step 4: Evidence & Bank Details</Text>

      <Card>
        <Text style={styles.cardTitle}>📸 Evidence (Optional)</Text>
        <Text style={styles.helperText}>
          Upload photo evidence of the violation
        </Text>

        {evidenceImage ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: evidenceImage }}
              style={styles.previewImage}
            />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={removeImage}
            >
              <Text style={styles.removeImageText}>✕ Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imageButtons}>
            <Button
              title="📷 Take Photo"
              onPress={takePhoto}
              variant="secondary"
              style={styles.imageButton}
            />
            <Button
              title="🖼️ Choose from Gallery"
              onPress={pickImage}
              variant="secondary"
              style={styles.imageButton}
            />
          </View>
        )}
      </Card>

      <Card>
        <Text style={styles.cardTitle}>🏦 Bank Account Details</Text>
        <View style={styles.bankDetailsContainer}>
          <Text style={styles.bankDetailsLabel}>Account Title:</Text>
          <Text style={styles.bankDetailsValue}>
            {BANK_DETAILS.ACCOUNT_TITLE}
          </Text>

          <Text style={styles.bankDetailsLabel}>Account Number:</Text>
          <Text style={styles.bankDetailsValue}>
            {BANK_DETAILS.ACCOUNT_NUMBER}
          </Text>

          <Text style={styles.bankDetailsLabel}>Bank:</Text>
          <Text style={styles.bankDetailsValue}>{BANK_DETAILS.BANK_NAME}</Text>

          <Text style={styles.bankDetailsLabel}>Branch Code:</Text>
          <Text style={styles.bankDetailsValue}>
            {BANK_DETAILS.BRANCH_CODE}
          </Text>

          <Text style={styles.bankDetailsLabel}>IBAN:</Text>
          <Text style={styles.bankDetailsValue}>{BANK_DETAILS.IBAN}</Text>
        </View>
      </Card>

      {/* Review Summary */}
      <Card variant="elevated">
        <Text style={styles.reviewTitle}>📋 Review Summary</Text>

        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Violation:</Text>
          <Text style={styles.reviewValue}>
            {selectedViolation?.violationType}
          </Text>
        </View>

        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Penalty:</Text>
          <Text style={styles.reviewValue}>
            PKR {selectedViolation?.penaltyAmount}
          </Text>
        </View>

        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Vehicle:</Text>
          <Text style={styles.reviewValue}>{vehiclePlateNumber}</Text>
        </View>

        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Accused:</Text>
          <Text style={styles.reviewValue}>
            {accusedFullName || accusedCnic}
          </Text>
        </View>

        {selectedViolation?.isCognizable && (
          <View style={styles.cognizableWarning}>
            <Text style={styles.cognizableText}>
              ⚖️ This is a COGNIZABLE offense
            </Text>
            <Text style={styles.cognizableSubtext}>
              FIR can be filed by Station Authority
            </Text>
          </View>
        )}
      </Card>
    </ScrollView>
  );

  // Determine total steps and final step based on challan type
  const totalSteps = challanType === "Traffic" ? 4 : 5;
  const finalStep = totalSteps;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Header
        title={`Submit ${challanType} Challan`}
        subtitle={`Step ${step} of ${totalSteps}`}
        showBack
        onBackPress={handleBack}
      />

      {renderStepIndicator()}

      {/* Traffic Flow: Steps 1-4 (Violation → Vehicle → Accused → Evidence) */}
      {challanType === "Traffic" && (
        <>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </>
      )}

      {/* Non-Traffic Flow: Steps 1-5 (Violation → Vehicle → Accused → Scan → Evidence) */}
      {challanType === "Non-Traffic" && (
        <>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderScanStep()}
          {step === 5 && renderStep4()}
        </>
      )}

      <View style={styles.footer}>
        {step < finalStep ? (
          <Button
            title="Next"
            onPress={handleNext}
            fullWidth
            disabled={step === 1 && !selectedViolation}
          />
        ) : (
          <Button
            title={loading ? "Submitting Challan..." : "Submit Challan"}
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            fullWidth
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  stepDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.neutral[100],
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },
  stepDotActive: {
    backgroundColor: colors.primary[100],
  },
  stepDotCurrent: {
    backgroundColor: colors.primary[600],
  },
  stepNumber: {
    fontSize: 14,
    color: colors.neutral[400],
    fontWeight: "600",
  },
  stepNumberActive: {
    color: colors.white,
  },
  stepContent: {
    flex: 1,
    padding: 16,
  },
  stepTitle: {
    fontSize: 18,
    color: colors.text.primary,
    marginBottom: 16,
    fontWeight: "600",
  },
  cardTitle: {
    fontSize: 15,
    color: colors.text.primary,
    marginBottom: 12,
    fontWeight: "600",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  searchInputWrapper: {
    flex: 1,
  },
  searchButtonWrapper: {
    paddingTop: 24,
  },
  reviewTitle: {
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "600",
  },
  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  reviewLabel: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  reviewValue: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: "500",
  },
  cognizableWarning: {
    marginTop: 16,
    backgroundColor: colors.error[50],
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.error[200],
  },
  cognizableText: {
    fontSize: 14,
    color: colors.error[700],
    fontWeight: "600",
  },
  cognizableSubtext: {
    fontSize: 12,
    color: colors.error[600],
    marginTop: 4,
  },
  helperText: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 12,
  },
  imageContainer: {
    alignItems: "center",
    marginVertical: 12,
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    resizeMode: "cover",
  },
  removeImageButton: {
    marginTop: 12,
    backgroundColor: colors.error[600],
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  removeImageText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: "500",
  },
  imageButtons: {
    gap: 12,
    marginTop: 12,
  },
  imageButton: {
    width: "100%",
  },
  footer: {
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  challanTypeContainer: {
    backgroundColor: colors.background.secondary,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  challanTypeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
  },
  warningText: {
    fontSize: 13,
    color: colors.error[700],
    fontWeight: "500",
    marginTop: 4,
  },
  deviceInfo: {
    gap: 8,
  },
  deviceLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.secondary,
    marginTop: 8,
  },
  deviceValue: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.text.primary,
  },
  deviceActive: {
    color: colors.success[700],
  },
  successText: {
    color: colors.success[700],
  },
  scanResults: {
    marginTop: 12,
    gap: 12,
  },
  scanResultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  scanLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  scanValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  scanValueDanger: {
    color: colors.error[700],
  },
  scanValueNormal: {
    color: colors.success[700],
  },
  classificationContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  classificationText: {
    fontSize: 16,
    fontWeight: "700",
  },
  classificationPass: {
    color: colors.success[700],
  },
  classificationFail: {
    color: colors.error[700],
  },
  bankDetailsContainer: {
    backgroundColor: colors.background.secondary,
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  bankDetailsLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.secondary,
    marginTop: 8,
  },
  bankDetailsValue: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.text.primary,
    marginTop: 2,
  },
});
