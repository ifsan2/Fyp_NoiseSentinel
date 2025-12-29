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
import accusedApi from "../../api/accusedApi";
import challanApi from "../../api/challanApi";
import vehicleApi from "../../api/vehicleApi";
import violationApi from "../../api/violationApi";
import { ViolationSelector } from "../../components/challan/ViolationSelector";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { Header } from "../../components/common/Header";
import { Input } from "../../components/common/Input";
import { CreateChallanDto } from "../../models/Challan";
import { ViolationListItemDto } from "../../models/Violation";
import { colors } from "../../styles/colors";
import { validation } from "../../utils/validation";

interface CreateChallanScreenProps {
  navigation: any;
  route: any;
}

export const CreateChallanScreen: React.FC<CreateChallanScreenProps> = ({
  navigation,
  route,
}) => {
  const emissionReportId = route.params?.emissionReportId;

  const [step, setStep] = useState(1);
  const [violations, setViolations] = useState<ViolationListItemDto[]>([]);
  const [loading, setLoading] = useState(false);

  // Step 1: Violation
  const [selectedViolation, setSelectedViolation] =
    useState<ViolationListItemDto | null>(null);

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
  const [bankDetails, setBankDetails] = useState("");

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    loadViolations();

    // Prevent back button if emissionReportId exists
    if (emissionReportId) {
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
          ]
        );
      });

      return unsubscribe;
    }
  }, [navigation, emissionReportId]);

  const loadViolations = async () => {
    try {
      const allViolations = await violationApi.getAllViolations();

      // Filter based on whether this is from emission report or direct challan
      if (emissionReportId) {
        // From emission report → Only show COGNIZABLE violations
        const cognizableViolations = allViolations.filter(
          (v) => v.isCognizable === true
        );
        setViolations(cognizableViolations);

        if (cognizableViolations.length === 0) {
          Toast.show({
            type: "warning",
            text1: "No Cognizable Violations",
            text2: "Please add cognizable violations in the system",
          });
        }
      } else {
        // Direct challan → Only show NON-COGNIZABLE violations
        const nonCognizableViolations = allViolations.filter(
          (v) => v.isCognizable === false
        );
        setViolations(nonCognizableViolations);

        if (nonCognizableViolations.length === 0) {
          Toast.show({
            type: "warning",
            text1: "No Non-Cognizable Violations",
            text2: "Please add non-cognizable violations in the system",
          });
        }
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load violations",
      });
    }
  };

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera roll permissions to upload evidence images."
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
        "Sorry, we need camera permissions to take photos."
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
      const vehicle = await vehicleApi.getVehicleByPlateNumber(
        vehicleSearchPlate
      );
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

  const validateStep = (currentStep: number): boolean => {
    const newErrors: any = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      // If emissionReportId exists, show confirmation
      if (emissionReportId) {
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
          ]
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
        // EmissionReportId is optional - null for direct challans, set for emission report challans
        emissionReportId: emissionReportId || null,
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
      if (bankDetails) {
        data.bankDetails = bankDetails;
      }

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
            challanId: response.challanId 
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
        JSON.stringify(error.response?.data, null, 2)
      );
      console.error(
        "❌ Validation Errors:",
        JSON.stringify(error.response?.data?.errors, null, 2)
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

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map((s) => (
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

  const renderStep1 = () => (
    <ScrollView style={styles.stepContent}>
      <Text style={styles.stepTitle}>Step 1: Select Violation</Text>
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
        <Text style={styles.cardTitle}>🏦 Bank Details (Optional)</Text>
        <Input
          label="Bank Account Details"
          placeholder="e.g., Account: 1234567890, Bank: HBL"
          value={bankDetails}
          onChangeText={setBankDetails}
          multiline
          numberOfLines={2}
        />
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Header
        title="Submit Challan"
        subtitle={`Step ${step} of 4`}
        showBack
        onBackPress={handleBack}
      />

      {renderStepIndicator()}

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}

      <View style={styles.footer}>
        {step < 4 ? (
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
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 12,
  },
  searchInputWrapper: {
    flex: 1,
  },
  searchButtonWrapper: {
    marginBottom: 12,
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
});
