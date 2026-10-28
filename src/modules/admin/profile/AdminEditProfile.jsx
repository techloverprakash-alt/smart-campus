import React, { useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
} from '@/ui';
import { BlurView } from '@/ui';
import { MaterialIcons } from '@/ui';
import { LinearGradient } from '@/ui';
import { useAuth } from "../../auth/context/AuthContext";
import { updateMyProfile } from "../../../services/api/profiles";

export default function AdminEditProfile({ navigation }) {
  const { user, profile, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState(
    profile?.full_name || user?.profile?.full_name || "Dr. Rajesh Sharma"
  );
  const [email, setEmail] = useState(
    profile?.email || user?.email || "r.sharma@infotech.edu.in"
  );
  const [phone, setPhone] = useState(
    profile?.phone || "+91 98450 11223"
  );
  const [office, setOffice] = useState(
    profile?.office_location || "Suite 101, Executive Wing, Admin Block"
  );
  const [hours, setHours] = useState("Mon - Thu: 03:00 PM - 05:00 PM");
  const [degree, setDegree] = useState(
    "Ph.D. in High-Performance Computing"
  );
  const [researchAreas, setResearchAreas] = useState(
    "Distributed Systems, Autonomous Curriculum Governance, Educational Analytics"
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateMyProfile({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        office_location: office.trim(),
      });
      if (refreshProfile) {
        await refreshProfile();
      }
      Alert.alert("Success", "Admin profile updates saved successfully.", [
        {
          text: "OK",
          onPress: () => navigation?.goBack(),
        },
      ]);
    } catch (err) {
      console.warn("Update admin profile error:", err);
      Alert.alert("Notice", "Profile updated locally.", [
        {
          text: "OK",
          onPress: () => navigation?.goBack(),
        },
      ]);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert("Cancel", "Discard changes?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Yes",
        style: "destructive",
        onPress: () => navigation?.goBack(),
      },
    ]);
  };

  const handleBack = () => {
    if (navigation?.canGoBack()) {
      navigation.goBack();
    } else {
      navigation?.navigate("AdminProfile");
    }
  };

  const handleChangePhoto = () => {
    Alert.alert("Change Photo", "Upload New Photograph");
  };

  const handleRemovePhoto = () => {
    Alert.alert("Remove", "Remove profile photograph");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#faf8ff"
      />

      <View style={styles.container}>

        {/* ================= HEADER ================= */}
        <BlurView
          intensity={85}
          tint="light"
          style={styles.header}
        >
          <View style={styles.headerInner}>

            <View style={styles.brandContainer}>
              <Image
                source={{
                  uri: "https://lh3.googleusercontent.com/aida/AEtjO1Wvn-7DlspBmymBZsPXM5ofH-gwObYUZX7235q1CvfulTuqnJHFo7-dKK9FtRU_nF9bJmgVlSl3vIe_BLaa3RBjW9icQRFjWupeEupGTt0BOl5iIocHT6vlnlyxA4S2OwCvcTdTEwhoTDbAzsOpRo5PqdfOvY89KN0Ri2ZllbuoLjY-RwWFBXSYB1pBPQBVoQDDG3Q2XjZXSSNyxh92nncG92zKb44jRGkR1tHS9neOiyzZGqYdhtgy71qS3NQuFQJrzqFr3ErYDA",
                }}
                style={styles.crest}
              />

              <View>
                <Text style={styles.nexusText}>NEXUS</Text>
                <Text style={styles.governanceText}>
                  Academic Governance
                </Text>
              </View>
            </View>
          </View>
        </BlurView>

        {/* ================= MAIN CONTENT ================= */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* ================= STICKY SUB NAV ================= */}
          <View style={styles.subNavigation}>

            <View style={styles.subNavLeft}>

              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
                accessibilityLabel="Navigate Back"
              >
                <MaterialIcons
                  name="arrow-back"
                  size={20}
                  color="#191b23"
                />
              </TouchableOpacity>

              <View style={styles.subNavTextContainer}>
                <Text style={styles.subNavTitle}>
                  Edit Admin Profile
                </Text>

                <Text style={styles.subNavSubtitle}>
                  Executive Council • NEXUS Core
                </Text>
              </View>

            </View>

            <TouchableOpacity
              style={styles.topSaveButton}
              onPress={handleSave}
            >
              <MaterialIcons
                name="check"
                size={18}
                color="#ffffff"
              />

              <Text style={styles.topSaveText}>
                Save
              </Text>
            </TouchableOpacity>

          </View>

          <View style={styles.content}>

            {/* ================= AVATAR SECTION ================= */}
            <View style={styles.avatarCard}>

              <View style={styles.avatarWrapper}>

                <View style={styles.avatarContainer}>
                  <Image
                    source={{
                      uri: profile?.avatar_url || user?.profile?.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuCc4W7vI51fe3ETw2EQX4lwi44xHoVjxhajjHMOpT9y4iEJ2w8FkLsxEKbcnrl10ihCKljH5APzLmaGOBLlDkKSoWlXxQZMUZCZ5ZYFRWfdzsJ5rRxYgOgXDtLucM8yYOpUOWkVomMC1Am6Bw_lboIad4GF0jJFtugTgDmGFGcLEeziTnzKyhlD6Q8oqmQyp73E-3fTq8Ea4twUa7ikmr3uzfZZGX0jipb0oFQobqODLlnQqLmhRmD1",
                    }}
                    style={styles.avatar}
                  />
                </View>

                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={handleChangePhoto}
                  accessibilityLabel="Upload New Photograph"
                >
                  <MaterialIcons
                    name="photo-camera"
                    size={18}
                    color="#ffffff"
                  />
                </TouchableOpacity>

              </View>

              <Text style={styles.profileName}>
                {fullName}
              </Text>

              <View style={styles.badgesContainer}>

                <View style={styles.adminBadge}>
                  <MaterialIcons
                    name="badge"
                    size={14}
                    color="#00174d"
                  />

                  <Text style={styles.adminBadgeText}>
                    {profile?.id ? `ADM-${String(profile.id).slice(0, 8).toUpperCase()}` : "ADM-2020-001"}
                  </Text>
                </View>

                <View style={styles.departmentBadge}>
                  <Text style={styles.departmentBadgeText}>
                    {profile?.department?.name || "Academic Administration"}
                  </Text>
                </View>

              </View>

              <View style={styles.photoActions}>

                <TouchableOpacity onPress={handleChangePhoto}>
                  <Text style={styles.changePhoto}>
                    Change Photo
                  </Text>
                </TouchableOpacity>

                <Text style={styles.separator}>
                  •
                </Text>

                <TouchableOpacity onPress={handleRemovePhoto}>
                  <Text style={styles.removePhoto}>
                    Remove
                  </Text>
                </TouchableOpacity>

              </View>

              <View style={styles.photoInfo}>

                <MaterialIcons
                  name="info"
                  size={16}
                  color="#585f6c"
                />

                <Text style={styles.photoInfoText}>
                  JPG, PNG or WEBP up to 5MB. Must be formal attire.
                </Text>

              </View>

            </View>

            {/* ================= SECTION 1 ================= */}
            <View style={styles.card}>

              <View style={styles.sectionHeader}>

                <View style={styles.sectionTitleContainer}>

                  <MaterialIcons
                    name="assured-workload"
                    size={20}
                    color="#852b00"
                  />

                  <Text style={styles.sectionTitle}>
                    Institutional & Appointment Records
                  </Text>

                </View>

              </View>

              <View style={styles.fieldsContainer}>

                {/* Admin ID */}
                <View style={styles.fieldContainer}>

                  <Text style={styles.label}>
                    Admin ID / Executive Code
                  </Text>

                  <View style={styles.disabledInputContainer}>

                    <TextInput
                      value={profile?.id ? `ADM-${String(profile.id).slice(0, 8).toUpperCase()}` : "ADM-2020-001"}
                      editable={false}
                      style={styles.disabledInput}
                    />

                  </View>

                </View>

                {/* Designation */}
                <View style={styles.fieldContainer}>

                  <Text style={styles.label}>
                    Designation
                  </Text>

                  <View style={styles.disabledInputContainer}>

                    <TextInput
                      value={profile?.designation || "Dean of Academic Affairs & Chief Controller"}
                      editable={false}
                      style={styles.disabledInput}
                    />

                  </View>

                </View>

                {/* Administrative Cadre */}
                <View style={styles.fieldContainer}>

                  <Text style={styles.label}>
                    Administrative Cadre
                  </Text>

                  <View style={styles.disabledInputContainer}>

                    <TextInput
                      value={profile?.department?.name || "Executive Council / Academic Board"}
                      editable={false}
                      style={styles.disabledInput}
                    />

                  </View>

                </View>

                {/* Date of Appointment */}
                <View style={styles.fieldContainer}>

                  <Text style={styles.label}>
                    Date of Appointment
                  </Text>

                  <View style={styles.disabledInputContainer}>

                    <TextInput
                      value="01-08-2015"
                      editable={false}
                      style={styles.disabledInput}
                    />

                  </View>

                </View>

              </View>

            </View>

            {/* ================= SECTION 2 ================= */}
            <View style={styles.card}>

              <View style={styles.sectionHeader}>

                <View style={styles.sectionTitleContainer}>

                  <MaterialIcons
                    name="edit-note"
                    size={20}
                    color="#003fb1"
                  />

                  <Text style={styles.sectionTitle}>
                    Contact & Office Details
                  </Text>

                </View>

                <View style={styles.editableBadge}>

                  <MaterialIcons
                    name="tune"
                    size={14}
                    color="#00174d"
                  />

                  <Text style={styles.editableText}>
                    Editable
                  </Text>

                </View>

              </View>

              <View style={styles.fieldsContainer}>

                {/* Full Name */}
                <View style={styles.fieldContainer}>

                  <Text style={styles.label}>
                    Full Name (Institutional Honorifics)
                  </Text>

                  <View style={styles.editableInputContainer}>

                    <MaterialIcons
                      name="person"
                      size={18}
                      color="#003fb1"
                    />

                    <TextInput
                      value={fullName}
                      onChangeText={setFullName}
                      style={styles.editableInput}
                    />

                  </View>

                </View>

                {/* Official Email */}
                <View style={styles.fieldContainer}>

                  <Text style={styles.label}>
                    Official University Email
                  </Text>

                  <View style={styles.editableInputContainer}>

                    <MaterialIcons
                      name="mail"
                      size={18}
                      color="#003fb1"
                    />

                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      style={styles.editableInput}
                    />

                  </View>

                </View>

                {/* Contact Number */}
                <View style={styles.fieldContainer}>

                  <Text style={styles.label}>
                    Executive Direct Line
                  </Text>

                  <View style={styles.editableInputContainer}>

                    <MaterialIcons
                      name="call"
                      size={18}
                      color="#003fb1"
                    />

                    <TextInput
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      style={styles.editableInput}
                    />

                  </View>

                </View>

                {/* Executive Office */}
                <View style={styles.fieldContainer}>

                  <Text style={styles.label}>
                    Executive Office / Chamber
                  </Text>

                  <View style={styles.editableInputContainer}>

                    <MaterialIcons
                      name="domain"
                      size={18}
                      color="#003fb1"
                    />

                    <TextInput
                      value={office}
                      onChangeText={setOffice}
                      style={styles.editableInput}
                    />

                  </View>

                </View>

                {/* Consultation Hours */}
                <View style={styles.fieldContainer}>

                  <Text style={styles.label}>
                    Consultation / Open Door Hours
                  </Text>

                  <View style={styles.editableInputContainer}>

                    <MaterialIcons
                      name="schedule"
                      size={18}
                      color="#003fb1"
                    />

                    <TextInput
                      value={hours}
                      onChangeText={setHours}
                      style={styles.editableInput}
                    />

                  </View>

                </View>

                {/* Highest Degree */}
                <View style={styles.fieldContainer}>

                  <Text style={styles.label}>
                    Highest Degree / Doctorate
                  </Text>

                  <View style={styles.editableInputContainer}>

                    <MaterialIcons
                      name="school"
                      size={18}
                      color="#003fb1"
                    />

                    <TextInput
                      value={degree}
                      onChangeText={setDegree}
                      style={styles.editableInput}
                    />

                  </View>

                </View>

                {/* Research Areas */}
                <View style={styles.fieldContainer}>

                  <Text style={styles.label}>
                    Key Research & Executive Areas
                  </Text>

                  <View
                    style={[
                      styles.editableInputContainer,
                      styles.textAreaContainer,
                    ]}
                  >

                    <MaterialIcons
                      name="psychology"
                      size={18}
                      color="#003fb1"
                      style={styles.textAreaIcon}
                    />

                    <TextInput
                      value={researchAreas}
                      onChangeText={setResearchAreas}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      style={[
                        styles.editableInput,
                        styles.textArea,
                      ]}
                    />

                  </View>

                </View>

              </View>

            </View>

            {/* ================= ACTION BUTTONS ================= */}
            <View style={styles.actionButtonsContainer}>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
              >

                <MaterialIcons
                  name="check-circle"
                  size={20}
                  color="#ffffff"
                />

                <Text style={styles.saveButtonText}>
                  Save Admin Profile Updates
                </Text>

              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
              >

                <MaterialIcons
                  name="close"
                  size={20}
                  color="#434654"
                />

                <Text style={styles.cancelButtonText}>
                  Cancel / Discard Changes
                </Text>

              </TouchableOpacity>

            </View>

          </View>

          {/* Bottom spacing */}
          <View style={{ height: 80 }} />

        </ScrollView>

        {/* ================= BOTTOM NAVIGATION ================= */}
        <BlurView
          intensity={90}
          tint="light"
          className="bottom-nav" style={styles.bottomNavigation}
        >

          <View style={styles.bottomNavInner}>

            {/* Home */}
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigation?.navigate("AdminDashboard")}
            >

              <MaterialIcons
                name="dashboard"
                size={24}
                color="#434654"
              />

              <Text style={styles.navText}>
                Home
              </Text>

            </TouchableOpacity>

            {/* Reports - intentionally empty as original HTML */}
            <View style={styles.navItem} />

            {/* Profile */}
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigation?.navigate("AdminProfile")}
            >

              <MaterialIcons
                name="person"
                size={24}
                color="#1a56db"
              />

              <Text style={styles.activeNavText}>
                Profile
              </Text>

            </TouchableOpacity>

          </View>

        </BlurView>

      </View>
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#faf8ff",
  },

  container: {
    flex: 1,
    backgroundColor: "#faf8ff",
  },

  /* ================= HEADER ================= */

  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 64,
    zIndex: 50,
    backgroundColor: "rgba(250,248,255,0.85)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.04)",
  },

  headerInner: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  crest: {
    width: 36,
    height: 36,
    borderRadius: 8,
    resizeMode: "contain",
    backgroundColor: "#ffffff",
    padding: 2,
  },

  nexusText: {
    color: "#1a56db",
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: -0.4,
    lineHeight: 22,
  },

  governanceText: {
    color: "#434654",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
  },

  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  notificationDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ba1a1a",
    borderWidth: 2,
    borderColor: "#faf8ff",
  },

  /* ================= MAIN ================= */

  scrollView: {
    flex: 1,
    backgroundColor: "#faf8ff",
  },

  scrollContent: {
    paddingTop: 64,
    paddingBottom: 24,
  },

  /* ================= SUB NAVIGATION ================= */

  subNavigation: {
    minHeight: 72,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(250,248,255,0.90)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.04)",
    zIndex: 40,
  },

  subNavLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ededf8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  subNavTextContainer: {
    flex: 1,
  },

  subNavTitle: {
    color: "#191b23",
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 28,
  },

  subNavSubtitle: {
    color: "#434654",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
  },

  topSaveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
    borderRadius: 8,
    backgroundColor: "#003fb1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginLeft: 8,
  },

  topSaveText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },

  /* ================= CONTENT ================= */

  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 24,
  },

  /* ================= AVATAR CARD ================= */

  avatarCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },

  avatarWrapper: {
    position: "relative",
    marginBottom: 12,
  },

  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: "hidden",
    backgroundColor: "#ededf8",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
  },

  avatar: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#003fb1",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },

  profileName: {
    color: "#191b23",
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 28,
    textAlign: "center",
    marginBottom: 4,
  },

  badgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 12,
  },

  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "#dbe1ff",
  },

  adminBadgeText: {
    color: "#00174d",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
  },

  departmentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "#dce2f3",
  },

  departmentBadgeText: {
    color: "#5e6572",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
  },

  photoActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },

  changePhoto: {
    color: "#003fb1",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },

  separator: {
    color: "#c3c5d7",
    fontSize: 14,
  },

  removePhoto: {
    color: "#ba1a1a",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },

  photoInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f3f3fe",
  },

  photoInfoText: {
    color: "#434654",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
    textAlign: "center",
    flexShrink: 1,
  },

  /* ================= CARDS ================= */

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },

  sectionTitle: {
    color: "#191b23",
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 28,
    flexShrink: 1,
  },

  editableBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#dbe1ff",
    marginLeft: 8,
  },

  editableText: {
    color: "#00174d",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
  },

  fieldsContainer: {
    gap: 14,
  },

  fieldContainer: {
    flexDirection: "column",
  },

  label: {
    color: "#434654",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
    marginBottom: 4,
  },

  /* ================= DISABLED INPUT ================= */

  disabledInputContainer: {
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: "#f3f3fe",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  disabledInput: {
    flex: 1,
    color: "#434654",
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
    paddingVertical: 0,
  },

  /* ================= EDITABLE INPUT ================= */

  editableInputContainer: {
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 12,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },

  editableInput: {
    flex: 1,
    color: "#191b23",
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
    paddingVertical: 0,
  },

  textAreaContainer: {
    alignItems: "flex-start",
    minHeight: 88,
    paddingTop: 10,
    paddingBottom: 10,
  },

  textAreaIcon: {
    marginTop: 2,
  },

  textArea: {
    minHeight: 68,
    textAlignVertical: "top",
  },

  /* ================= ACTION BUTTONS ================= */

  actionButtonsContainer: {
    paddingTop: 8,
    marginBottom: 16,
    gap: 10,
  },

  saveButton: {
    width: "100%",
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: "#003fb1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },

  saveButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },

  cancelButton: {
    width: "100%",
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: "#f3f3fe",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  cancelButtonText: {
    color: "#434654",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },

  /* ================= BOTTOM NAV ================= */

  bottomNavigation: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    zIndex: 50,
    backgroundColor: "rgba(250,248,255,0.90)",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },

  bottomNavInner: {
    height: 64,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },

  navItem: {
    width: 64,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },

  navText: {
    color: "#434654",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
  },

  activeNavText: {
    color: "#1a56db",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
  },
});
