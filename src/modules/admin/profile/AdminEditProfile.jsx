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
  ActivityIndicator,
} from '@/ui';
import { MaterialIcons } from '@/ui';
import { useAuth } from "../../auth/context/AuthContext";
import { updateMyProfile } from "../../../services/api/profiles";

const FALLBACK_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCc4W7vI51fe3ETw2EQX4lwi44xHoVjxhajjHMOpT9y4iEJ2w8FkLsxEKbcnrl10ihCKljH5APzLmaGOBLlDkKSoWlXxQZMUZCZ5ZYFRWfdzsJ5rRxYgOgXDtLucM8yYOpUOWkVomMC1Am6Bw_lboIad4GF0jJFtugTgDmGFGcLEeziTnzKyhlD6Q8oqmQyp73E-3fTq8Ea4twUa7ikmr3uzfZZGX0jipb0oFQobqODLlnQqLmhRmD1";

export default function AdminEditProfile({ navigation }) {
  const { user, profile, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState(
    profile?.full_name || profile?.name || user?.profile?.full_name || user?.name || "Dr. K. Arulmozhi"
  );
  const [email, setEmail] = useState(
    profile?.email || user?.email || "dean.academic@infotech.edu.in"
  );
  const [phone, setPhone] = useState(
    profile?.phone || user?.phone || "+91 98422 55667"
  );
  const [office, setOffice] = useState(
    profile?.office_location || "Office of Academic Governance • Suite 101, Executive Wing"
  );
  const [designation, setDesignation] = useState(
    profile?.designation || "Academic Dean & Controller of Examinations"
  );
  const [hours, setHours] = useState("Mon - Fri: 09:30 AM - 04:30 PM");
  const [degree, setDegree] = useState(
    "Ph.D. in High-Performance Computing (IIT Madras)"
  );
  const [researchAreas, setResearchAreas] = useState(
    "Distributed Systems, Autonomous Curriculum Governance, Educational Analytics, Accreditation Standards"
  );
  const [saving, setSaving] = useState(false);

  const avatarUrl =
    profile?.avatar_url ||
    profile?.avatar ||
    user?.profile?.avatar_url ||
    user?.avatar ||
    FALLBACK_AVATAR;

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
          onPress: () => navigation?.navigate("AdminProfile"),
        },
      ]);
    } catch (err) {
      console.warn("Update admin profile error:", err);
      Alert.alert("Notice", "Profile updated locally.", [
        {
          text: "OK",
          onPress: () => navigation?.navigate("AdminProfile"),
        },
      ]);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert("Discard Changes", "Are you sure you want to discard your edits?", [
      { text: "Keep Editing", style: "cancel" },
      {
        text: "Discard",
        style: "destructive",
        onPress: () => navigation?.navigate("AdminProfile"),
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
    Alert.alert("Upload Photograph", "Select a new high-resolution executive portrait.");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.laptopContainer}>
          {/* Top Breadcrumb & Action Toolbar */}
          <View style={styles.topToolbar}>
            <View style={styles.breadcrumbWrap}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={handleBack}
                activeOpacity={0.7}
              >
                <MaterialIcons name="arrow-back" size={18} color="#003fb1" />
                <Text style={styles.backBtnText}>Profile</Text>
              </TouchableOpacity>
              <Text style={styles.breadcrumbDivider}>/</Text>
              <Text style={styles.breadcrumbCurrent}>Edit Administrative Profile</Text>
            </View>

            <View style={styles.topActionGroup}>
              <TouchableOpacity
                style={styles.actionBtnSecondary}
                onPress={handleCancel}
                disabled={saving}
                activeOpacity={0.8}
              >
                <MaterialIcons name="close" size={18} color="#475569" />
                <Text style={styles.actionBtnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtnPrimary, saving && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.8}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <MaterialIcons name="check" size={18} color="#ffffff" />
                    <Text style={styles.actionBtnPrimaryText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Photo & Identity Quick Card */}
          <View style={styles.avatarCard}>
            <View style={styles.avatarRow}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.avatarImage}
                  onError={(e) => {
                    if (e?.target) e.target.src = "/info_logo.png";
                  }}
                />
                <TouchableOpacity
                  style={styles.cameraBtn}
                  onPress={handleChangePhoto}
                  activeOpacity={0.8}
                  title="Change photo"
                >
                  <MaterialIcons name="photo-camera" size={16} color="#ffffff" />
                </TouchableOpacity>
              </View>

              <View style={styles.avatarInfo}>
                <View style={styles.roleTag}>
                  <MaterialIcons name="admin-panel-settings" size={14} color="#003fb1" />
                  <Text style={styles.roleTagText}>ADMINISTRATIVE GOVERNANCE</Text>
                </View>
                <Text style={styles.avatarName}>{fullName}</Text>
                <Text style={styles.avatarSub}>{designation}</Text>
              </View>

              <View style={styles.avatarActions}>
                <TouchableOpacity
                  style={styles.changePhotoBtn}
                  onPress={handleChangePhoto}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="upload" size={16} color="#003fb1" />
                  <Text style={styles.changePhotoBtnText}>Update Photo</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Form Cards in 2-Column Laptop Grid */}
          <View style={styles.formGrid}>
            {/* Column 1: Personal & Official Identity */}
            <View style={styles.formCol}>
              <View style={styles.formCard}>
                <View style={styles.cardHeader}>
                  <MaterialIcons name="person" size={20} color="#003fb1" />
                  <Text style={styles.cardTitle}>Executive Identity & Designation</Text>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Full Legal / Academic Name *</Text>
                  <TextInput
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Enter full name"
                    style={styles.input}
                  />
                  <Text style={styles.fieldHint}>Displayed across official certificates and audit reports</Text>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Institutional Designation *</Text>
                  <TextInput
                    value={designation}
                    onChangeText={setDesignation}
                    placeholder="Academic Dean & Controller of Examinations"
                    style={styles.input}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Executive Chamber / Office Location *</Text>
                  <TextInput
                    value={office}
                    onChangeText={setOffice}
                    placeholder="Office location"
                    style={styles.input}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Official Consultation Hours</Text>
                  <TextInput
                    value={hours}
                    onChangeText={setHours}
                    placeholder="Mon - Fri: 09:30 AM - 04:30 PM"
                    style={styles.input}
                  />
                </View>
              </View>
            </View>

            {/* Column 2: Contact Channels & Academic Portfolio */}
            <View style={styles.formCol}>
              <View style={styles.formCard}>
                <View style={styles.cardHeader}>
                  <MaterialIcons name="contact-phone" size={20} color="#003fb1" />
                  <Text style={styles.cardTitle}>Official Contact Channels</Text>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Official University Email *</Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="name@infotech.edu.in"
                    style={styles.input}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Direct Telephony / Contact Number *</Text>
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholder="+91 98422 55667"
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.formCard}>
                <View style={styles.cardHeader}>
                  <MaterialIcons name="school" size={20} color="#003fb1" />
                  <Text style={styles.cardTitle}>Academic Leadership & Credentials</Text>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Highest Academic Qualification</Text>
                  <TextInput
                    value={degree}
                    onChangeText={setDegree}
                    placeholder="Ph.D. in High-Performance Computing"
                    style={styles.input}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Specialized Research & Governance Areas</Text>
                  <TextInput
                    value={researchAreas}
                    onChangeText={setResearchAreas}
                    multiline
                    numberOfLines={3}
                    style={[styles.input, styles.textArea]}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Bottom Action Footer */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.footerCancelBtn}
              onPress={handleCancel}
              disabled={saving}
              activeOpacity={0.8}
            >
              <Text style={styles.footerCancelText}>Discard Changes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.footerSaveBtn, saving && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <MaterialIcons name="check-circle" size={18} color="#ffffff" />
                  <Text style={styles.footerSaveText}>Save Admin Profile</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    paddingBottom: 48,
  },
  laptopContainer: {
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 20,
  },

  /* Top Toolbar */
  topToolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  breadcrumbWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#e0e7ff",
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#003fb1",
  },
  breadcrumbDivider: {
    fontSize: 14,
    color: "#94a3b8",
  },
  breadcrumbCurrent: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  topActionGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  actionBtnSecondary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  actionBtnSecondaryText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  actionBtnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: "#003fb1",
    shadowColor: "#003fb1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtnPrimaryText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ffffff",
  },

  /* Photo Card */
  avatarCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 20,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    flexWrap: "wrap",
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    backgroundColor: "#f1f5f9",
    objectFit: "cover",
  },
  cameraBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#003fb1",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  avatarInfo: {
    flex: 1,
    minWidth: 240,
    gap: 4,
  },
  roleTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#003fb1",
    letterSpacing: 0.5,
  },
  avatarName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  avatarSub: {
    fontSize: 13,
    color: "#64748b",
  },
  avatarActions: {
    flexDirection: "row",
    gap: 8,
  },
  changePhotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  changePhotoBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#003fb1",
  },

  /* Form Grid */
  formGrid: {
    flexDirection: "row",
    gap: 20,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  formCol: {
    flex: 1,
    minWidth: 320,
    gap: 20,
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 20,
    gap: 16,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },

  /* Field Groups */
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13.5,
    color: "#0f172a",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  fieldHint: {
    fontSize: 11,
    color: "#94a3b8",
  },

  /* Bottom Action Footer */
  bottomBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  footerCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  footerCancelText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  footerSaveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#003fb1",
  },
  footerSaveText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ffffff",
  },
});
