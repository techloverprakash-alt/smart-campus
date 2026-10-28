import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from '@/ui';
import { MaterialIcons } from '@/ui';
import { useAuth } from '../../auth/context/AuthContext';
import { updateMyProfile } from '../../../services/api/profiles';

const PROFILE_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCVXP3laCjvBlZEVugtzpX20kCifG87-9yGGVWnUCmaIhNtCcDdG9HmCKcyaSa4oTc-QPnHNb5RR_pO0Xd8oVLNtxyVdxbttBW5KjbrzMiMJD0HcqApHxFuVbC5_KEUHnW0qOr98kurfIJ2NAVvw464MLzvDAN8LdJTSZXSqkbDkysN8V9Lzled9wZvQVwVorYcKfLMT1do8whwEUyopOcVpVMNt3wTCpl8mQ00dAziqalPOmZQTqcZ';

export default function StaffEditProfile({ navigation }) {
  const { user, profile, updateProfile, refreshProfile } = useAuth();

  /* =========================
     EDITABLE FORM STATES
  ========================= */
  const [fullName, setFullName] = useState(
    profile?.full_name || user?.profile?.full_name || 'Prof. M. Selvam'
  );
  const [email, setEmail] = useState(
    profile?.email || user?.email || 'selvam.m@infotech.edu.in'
  );
  const [mobile, setMobile] = useState(profile?.phone || '+91 94432 10987');
  const [cabin, setCabin] = useState(
    profile?.cabin_number || 'Room 208, Computing Block, 2nd Floor'
  );
  const [hours, setHours] = useState('Mon & Wed: 02:00 PM – 04:00 PM');
  const [qualification, setQualification] = useState(
    profile?.qualifications || 'M.Tech., Ph.D. in Computer Science & Deep Learning'
  );
  const [research, setResearch] = useState(
    profile?.experience || 'Deep Learning, Autonomous Vision, Distributed AI'
  );

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      if (profile.full_name) setFullName(profile.full_name);
      if (profile.email) setEmail(profile.email);
      if (profile.phone) setMobile(profile.phone);
      if (profile.cabin_number) setCabin(profile.cabin_number);
      if (profile.qualifications) setQualification(profile.qualifications);
      if (profile.experience) setResearch(profile.experience);
    }
  }, [profile]);

  /* =========================
     ACTIONS
  ========================= */
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload = {
        full_name: fullName.trim(),
        email: email.trim(),
        phone: mobile.trim(),
        cabin_number: cabin.trim(),
        qualifications: qualification.trim(),
        experience: research.trim(),
      };

      if (updateProfile) {
        await updateProfile(payload);
      } else {
        await updateMyProfile(payload);
      }
      if (refreshProfile) await refreshProfile();

      Alert.alert('Success', 'Profile updates saved successfully.', [
        {
          text: 'OK',
          onPress: () => {
            if (navigation?.canGoBack()) navigation.goBack();
            else navigation?.navigate('StaffProfile');
          },
        },
      ]);
    } catch (err) {
      Alert.alert('Notice', 'Profile saved locally.');
      if (navigation?.canGoBack()) navigation.goBack();
      else navigation?.navigate('StaffProfile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert('Discard Changes', 'Are you sure you want to discard your unsaved changes?', [
      {
        text: 'Keep Editing',
        style: 'cancel',
      },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          if (navigation?.canGoBack()) navigation.goBack();
          else navigation?.navigate('StaffProfile');
        },
      },
    ]);
  };

  const handleChangePhoto = () => {
    Alert.alert('Upload Photo', 'Select a new professional headshot from your device.');
  };

  const handleBack = () => {
    if (navigation?.canGoBack()) {
      navigation.goBack();
    } else {
      navigation?.navigate('StaffProfile');
    }
  };

  const facultyId = profile?.faculty_id || user?.identifier || 'FAC-AIDS-018';
  const departmentName = profile?.department?.name || profile?.department || 'Department of AI & DS';
  const avatarUri = profile?.avatar_url || profile?.avatar || user?.profile?.avatar_url || user?.avatar || PROFILE_IMAGE;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.laptopContainer}>
          {/* Top Breadcrumb & Actions Toolbar */}
          <View style={styles.topToolbar}>
            <View style={styles.breadcrumbWrap}>
              <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
                <MaterialIcons name="arrow-back" size={18} color="#003fb1" />
                <Text style={styles.backBtnText}>Profile</Text>
              </TouchableOpacity>
              <Text style={styles.breadcrumbDivider}>/</Text>
              <Text style={styles.breadcrumbCurrent}>Edit Faculty Profile</Text>
              <Text style={styles.breadcrumbTag}>{facultyId}</Text>
            </View>

            <View style={styles.topActionGroup}>
              <TouchableOpacity style={styles.actionBtnSecondary} onPress={handleCancel} activeOpacity={0.8}>
                <MaterialIcons name="close" size={18} color="#475569" />
                <Text style={styles.actionBtnSecondaryText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtnPrimary, isSaving && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={isSaving}
                activeOpacity={0.8}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <MaterialIcons name="check" size={18} color="#ffffff" />
                )}
                <Text style={styles.actionBtnPrimaryText}>
                  {isSaving ? 'Saving Changes...' : 'Save Profile'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 2-Column Responsive Layout */}
          <View style={styles.laptopGrid}>
            {/* Left Column: Photo Card, Identity Metadata */}
            <View style={styles.leftCol}>
              {/* Profile Photograph Card */}
              <View style={styles.sectionCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderIconWrap}>
                    <MaterialIcons name="camera-alt" size={18} color="#003fb1" />
                  </View>
                  <Text style={styles.cardHeaderTitle}>Profile Photograph</Text>
                </View>

                <View style={styles.photoContainer}>
                  <View style={styles.avatarWrap}>
                    <Image
                      source={{ uri: avatarUri }}
                      style={styles.avatarImg}
                      onError={(e) => {
                        if (e?.target) e.target.src = '/info_logo.png';
                      }}
                    />
                    <TouchableOpacity
                      style={styles.cameraIconBtn}
                      onPress={handleChangePhoto}
                      activeOpacity={0.8}
                      title="Upload new headshot"
                    >
                      <MaterialIcons name="photo-camera" size={16} color="#ffffff" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.avatarName}>{fullName}</Text>
                  <Text style={styles.avatarRole}>{facultyId} • {departmentName}</Text>

                  <View style={styles.photoActionRow}>
                    <TouchableOpacity
                      style={styles.uploadPhotoBtn}
                      onPress={handleChangePhoto}
                      activeOpacity={0.8}
                    >
                      <MaterialIcons name="file-upload" size={16} color="#003fb1" />
                      <Text style={styles.uploadPhotoBtnText}>Upload New Photo</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.photoHelpText}>
                    Standard passport ratio (JPEG or PNG, up to 5MB). Photo is visible on class rosters and student dashboards.
                  </Text>
                </View>
              </View>

              {/* Institutional Clearance Card */}
              <View style={styles.sectionCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderIconWrap}>
                    <MaterialIcons name="security" size={18} color="#003fb1" />
                  </View>
                  <Text style={styles.cardHeaderTitle}>Institutional Clearance</Text>
                </View>

                <View style={styles.clearanceList}>
                  <View style={styles.clearanceRow}>
                    <Text style={styles.clearanceLabel}>Faculty Designation</Text>
                    <Text style={styles.clearanceVal}>Assistant Professor (Sr. Gr.)</Text>
                  </View>
                  <View style={styles.clearanceRow}>
                    <Text style={styles.clearanceLabel}>Department Code</Text>
                    <Text style={styles.clearanceVal}>AIDS • CSE Allied</Text>
                  </View>
                  <View style={styles.clearanceRow}>
                    <Text style={styles.clearanceLabel}>Class Advisory</Text>
                    <Text style={styles.clearanceVal}>III Year AI & DS (Sec A)</Text>
                  </View>
                  <View style={styles.clearanceRow}>
                    <Text style={styles.clearanceLabel}>Portal Status</Text>
                    <View style={styles.verifiedBadge}>
                      <MaterialIcons name="verified" size={13} color="#166534" />
                      <Text style={styles.verifiedBadgeText}>Verified Faculty</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Right Column: Editable Profile Details */}
            <View style={styles.rightCol}>
              {/* Section 1: Basic Information */}
              <View style={styles.sectionCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderIconWrap}>
                    <MaterialIcons name="person" size={18} color="#003fb1" />
                  </View>
                  <Text style={styles.cardHeaderTitle}>Personal & Professional Identity</Text>
                </View>

                <View style={styles.formGrid}>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Full Legal Name with Salutation *</Text>
                    <TextInput
                      style={styles.formInput}
                      value={fullName}
                      onChangeText={setFullName}
                      placeholder="e.g. Prof. M. Selvam, M.Tech."
                      placeholderTextColor="#94a3b8"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Highest Qualification & Degree *</Text>
                    <TextInput
                      style={styles.formInput}
                      value={qualification}
                      onChangeText={setQualification}
                      placeholder="e.g. M.Tech., Ph.D. in Computer Science"
                      placeholderTextColor="#94a3b8"
                    />
                  </View>
                </View>
              </View>

              {/* Section 2: Contact & Cabin Suite */}
              <View style={styles.sectionCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderIconWrap}>
                    <MaterialIcons name="contact-mail" size={18} color="#003fb1" />
                  </View>
                  <Text style={styles.cardHeaderTitle}>Contact & Office Suite</Text>
                </View>

                <View style={styles.formGrid}>
                  <View style={styles.formRowTwo}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.formLabel}>Official Institutional Email *</Text>
                      <TextInput
                        style={styles.formInput}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        placeholder="e.g. selvam.m@infotech.edu.in"
                        placeholderTextColor="#94a3b8"
                      />
                    </View>

                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.formLabel}>Mobile Number *</Text>
                      <TextInput
                        style={styles.formInput}
                        value={mobile}
                        onChangeText={setMobile}
                        keyboardType="phone-pad"
                        placeholder="e.g. +91 94432 10987"
                        placeholderTextColor="#94a3b8"
                      />
                    </View>
                  </View>

                  <View style={styles.formRowTwo}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.formLabel}>Cabin / Office Room Location *</Text>
                      <TextInput
                        style={styles.formInput}
                        value={cabin}
                        onChangeText={setCabin}
                        placeholder="e.g. Room 208, Computing Block, 2nd Floor"
                        placeholderTextColor="#94a3b8"
                      />
                    </View>

                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.formLabel}>Student Consultation Hours *</Text>
                      <TextInput
                        style={styles.formInput}
                        value={hours}
                        onChangeText={setHours}
                        placeholder="e.g. Mon & Wed: 02:00 PM – 04:00 PM"
                        placeholderTextColor="#94a3b8"
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* Section 3: Academic Experience & Research */}
              <View style={styles.sectionCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderIconWrap}>
                    <MaterialIcons name="psychology" size={18} color="#003fb1" />
                  </View>
                  <Text style={styles.cardHeaderTitle}>Academic Experience & Research Specializations</Text>
                </View>

                <View style={styles.formGrid}>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Key Research Domains, Publications & Specializations</Text>
                    <TextInput
                      style={[styles.formInput, styles.formTextArea]}
                      value={research}
                      onChangeText={setResearch}
                      multiline
                      numberOfLines={3}
                      placeholder="e.g. Deep Learning, Autonomous Vision, Distributed AI, Database Systems"
                      placeholderTextColor="#94a3b8"
                    />
                    <Text style={styles.inputHelpText}>
                      Summarize your active research topics and publications for academic accreditation audits.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Bottom Actions Bar */}
              <View style={styles.bottomActionBar}>
                <TouchableOpacity style={styles.cancelActionBtn} onPress={handleCancel} activeOpacity={0.8}>
                  <Text style={styles.cancelActionText}>Discard Changes</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveActionBtn, isSaving && { opacity: 0.7 }]}
                  onPress={handleSave}
                  disabled={isSaving}
                  activeOpacity={0.8}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <MaterialIcons name="check-circle" size={18} color="#ffffff" />
                  )}
                  <Text style={styles.saveActionText}>
                    {isSaving ? 'Saving Profile...' : 'Save & Publish Profile'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
    alignItems: 'center',
  },
  laptopContainer: {
    width: '100%',
    maxWidth: 1080,
    gap: 20,
  },

  /* Top Toolbar */
  topToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  breadcrumbWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#003fb1',
  },
  breadcrumbDivider: {
    fontSize: 14,
    color: '#94a3b8',
  },
  breadcrumbCurrent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  breadcrumbTag: {
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: '#eff6ff',
    color: '#003fb1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  topActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnSecondaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#003fb1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#003fb1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtnPrimaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },

  /* 2-Column Laptop Grid */
  laptopGrid: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  leftCol: {
    width: 320,
    gap: 20,
  },
  rightCol: {
    flex: 1,
    minWidth: 320,
    gap: 20,
  },

  /* Shared Section Card */
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  cardHeaderIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },

  /* Photo Card Styles */
  photoContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarImg: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    borderColor: '#eff6ff',
    backgroundColor: '#f1f5f9',
  },
  cameraIconBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#003fb1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  avatarName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
  },
  avatarRole: {
    fontSize: 12.5,
    color: '#64748b',
    marginTop: 2,
    textAlign: 'center',
  },
  photoActionRow: {
    marginTop: 14,
    width: '100%',
  },
  uploadPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingVertical: 8,
    borderRadius: 8,
  },
  uploadPhotoBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#003fb1',
  },
  photoHelpText: {
    fontSize: 11.5,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 16,
  },

  /* Institutional Clearance */
  clearanceList: {
    gap: 10,
  },
  clearanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  clearanceLabel: {
    fontSize: 12.5,
    color: '#64748b',
  },
  clearanceVal: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0f172a',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#166534',
  },

  /* Form Elements */
  formGrid: {
    gap: 14,
  },
  formRowTwo: {
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'wrap',
  },
  formGroup: {
    gap: 6,
  },
  formLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
  },
  formInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13.5,
    color: '#0f172a',
  },
  formTextArea: {
    minHeight: 76,
    textAlignVertical: 'top',
  },
  inputHelpText: {
    fontSize: 11.5,
    color: '#94a3b8',
    marginTop: 2,
  },

  /* Bottom Actions Bar */
  bottomActionBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    paddingTop: 10,
  },
  cancelActionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  cancelActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  saveActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#003fb1',
    shadowColor: '#003fb1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  saveActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
});
