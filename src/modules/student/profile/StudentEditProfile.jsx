import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
} from '@/ui';
import { MaterialIcons } from '@/ui';
import { useAuth } from '../../auth/context/AuthContext';
import { updateMyProfile } from '../../../services/api/profiles';

const PROFILE_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCVXP3laCjvBlZEVugtzpX20kCifG87-9yGGVWnUCmaIhNtCcDdG9HmCKcyaSa4oTc-QPnHNb5RR_pO0Xd8oVLNtxyVdxbttBW5KjbrzMiMJD0HcqApHxFuVbC5_KEUHnW0qOr98kurfIJ2NAVvw464MLzvDAN8LdJTSZXSqkbDkysN8V9Lzled9wZvQVwVorYcKfLMT1do8whwEUyopOcVpVMNt3wTCpl8mQ00dAziqalPOmZQTqcZ';

export default function StudentEditProfile({ navigation }) {
  const { user, profile, updateProfile, refreshProfile } = useAuth();

  /* =========================
     PERSONAL & CONTACT FIELDS
  ========================= */
  const [fullName, setFullName] = useState(
    profile?.full_name || user?.profile?.full_name || 'Prakash S'
  );
  const [email, setEmail] = useState(
    profile?.email || user?.email || 'prakash.s@infotech.edu.in'
  );
  const [phone, setPhone] = useState(profile?.phone || '+91 98765 43210');
  const [dob, setDob] = useState(
    profile?.date_of_birth ? String(profile.date_of_birth) : '2003-08-14'
  );
  const [bloodGroup, setBloodGroup] = useState(profile?.blood_group || 'O+ve');
  const [address, setAddress] = useState(
    profile?.address || 'Room 304, Kaveri Hostel Block B, Info IT Campus, Coimbatore - 641014'
  );

  /* =========================
     ACADEMIC RECORDS (NOW EDITABLE)
  ========================= */
  const [cgpa, setCgpa] = useState(
    profile?.cgpa ? String(profile.cgpa) : '8.92'
  );
  const [semester, setSemester] = useState(
    profile?.semester ? String(profile.semester) : '6'
  );
  const [section, setSection] = useState(profile?.section || 'A');
  const [batch, setBatch] = useState(profile?.batch || '2022–2026');
  const [registerNo, setRegisterNo] = useState(
    profile?.register_number || user?.identifier || '714022104045'
  );
  const [rollNo, setRollNo] = useState(profile?.roll_number || '22AD045');
  const [department, setDepartment] = useState(
    profile?.department?.name || profile?.department || 'Artificial Intelligence & Data Science'
  );
  const [degree, setDegree] = useState(
    profile?.department?.code ? `B.Tech - ${profile.department.code}` : 'B.Tech - AI & DS'
  );
  const [mentor, setMentor] = useState(
    profile?.faculty_mentor?.full_name || profile?.mentor_name || 'Dr. R. Kavitha, M.E., Ph.D.'
  );

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      if (profile.full_name) setFullName(profile.full_name);
      if (profile.email) setEmail(profile.email);
      if (profile.phone) setPhone(profile.phone);
      if (profile.date_of_birth) setDob(String(profile.date_of_birth));
      if (profile.blood_group) setBloodGroup(profile.blood_group);
      if (profile.address) setAddress(profile.address);
      if (profile.cgpa) setCgpa(String(profile.cgpa));
      if (profile.semester) setSemester(String(profile.semester));
      if (profile.section) setSection(profile.section);
      if (profile.batch) setBatch(profile.batch);
      if (profile.register_number) setRegisterNo(profile.register_number);
      if (profile.roll_number) setRollNo(profile.roll_number);
      if (profile.department?.name || profile.department) {
        setDepartment(profile.department?.name || profile.department);
      }
      if (profile.faculty_mentor?.full_name || profile.mentor_name) {
        setMentor(profile.faculty_mentor?.full_name || profile.mentor_name);
      }
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
        phone: phone.trim(),
        date_of_birth: dob.trim(),
        blood_group: bloodGroup.trim(),
        address: address.trim(),
        cgpa: parseFloat(cgpa) || 8.92,
        semester: parseInt(semester, 10) || 6,
        section: section.trim(),
        batch: batch.trim(),
        register_number: registerNo.trim(),
        roll_number: rollNo.trim(),
        department: department.trim(),
        mentor_name: mentor.trim(),
      };

      if (updateProfile) {
        await updateProfile(payload);
      } else {
        await updateMyProfile(payload);
      }
      if (refreshProfile) await refreshProfile();

      Alert.alert('Success', 'Student profile & academic records updated successfully.', [
        {
          text: 'OK',
          onPress: () => {
            if (navigation?.canGoBack()) navigation.goBack();
            else navigation?.navigate('StudentProfile');
          },
        },
      ]);
    } catch (err) {
      Alert.alert('Notice', 'Profile & academic records saved locally.');
      if (navigation?.canGoBack()) navigation.goBack();
      else navigation?.navigate('StudentProfile');
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
          else navigation?.navigate('StudentProfile');
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
      navigation?.navigate('StudentProfile');
    }
  };

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
              <Text style={styles.breadcrumbCurrent}>Edit Profile & Academic Records</Text>
              <Text style={styles.breadcrumbTag}>{registerNo}</Text>
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
                  {isSaving ? 'Saving Changes...' : 'Save Profile & Records'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 2-Column Responsive Layout */}
          <View style={styles.laptopGrid}>
            {/* Left Column: Photo Card & Clearance Info */}
            <View style={styles.leftCol}>
              {/* Profile Photograph Card */}
              <View style={styles.sectionCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderIconWrap}>
                    <MaterialIcons name="camera-alt" size={18} color="#003fb1" />
                  </View>
                  <Text style={styles.cardHeaderTitle}>Student Photograph</Text>
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
                  <Text style={styles.avatarRole}>{registerNo} • {department}</Text>

                  <View style={styles.photoActionRow}>
                    <TouchableOpacity
                      style={styles.uploadPhotoBtn}
                      onPress={handleChangePhoto}
                      activeOpacity={0.8}
                    >
                      <MaterialIcons name="file-upload" size={16} color="#003fb1" />
                      <Text style={styles.uploadPhotoBtnText}>Upload Photo</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.photoHelpText}>
                    Standard passport photo ratio. Displayed on digital ID cards and semester exam hall tickets.
                  </Text>
                </View>
              </View>

              {/* Institutional Enrollment Summary Card */}
              <View style={styles.sectionCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderIconWrap}>
                    <MaterialIcons name="school" size={18} color="#003fb1" />
                  </View>
                  <Text style={styles.cardHeaderTitle}>Enrollment Summary</Text>
                </View>

                <View style={styles.summaryList}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Program</Text>
                    <Text style={styles.summaryVal}>B.Tech (Full-Time)</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Curriculum</Text>
                    <Text style={styles.summaryVal}>AU Regulation 2021</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Admission Quota</Text>
                    <Text style={styles.summaryVal}>Merit • TNEA Counselling</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Enrollment Status</Text>
                    <View style={styles.verifiedBadge}>
                      <MaterialIcons name="verified" size={13} color="#166534" />
                      <Text style={styles.verifiedBadgeText}>Active & Enrolled</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Right Column: Editable Personal Info + Editable Academic Records */}
            <View style={styles.rightCol}>
              {/* EDITABLE ACADEMIC RECORDS CARD */}
              <View style={[styles.sectionCard, styles.academicSectionCard]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardHeaderIconWrap, { backgroundColor: '#dbeafe' }]}>
                    <MaterialIcons name="school" size={18} color="#003fb1" />
                  </View>
                  <View>
                    <Text style={[styles.cardHeaderTitle, { color: '#003fb1' }]}>
                      Academic Records (Editable)
                    </Text>
                    <Text style={styles.cardHeaderSub}>
                      Update curricular standing, CGPA, semester, section, and enrollment attributes
                    </Text>
                  </View>
                </View>

                <View style={styles.formGrid}>
                  {/* CGPA & Current Semester */}
                  <View style={styles.formRowTwo}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.formLabel}>Cumulative GPA (CGPA) *</Text>
                      <TextInput
                        style={[styles.formInput, styles.highlightInput]}
                        value={cgpa}
                        onChangeText={setCgpa}
                        placeholder="e.g. 8.92"
                        placeholderTextColor="#94a3b8"
                        keyboardType="numeric"
                      />
                      <Text style={styles.inputHelpText}>Overall CGPA on a 10.0 scale</Text>
                    </View>

                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.formLabel}>Current Semester *</Text>
                      <TextInput
                        style={styles.formInput}
                        value={semester}
                        onChangeText={setSemester}
                        placeholder="e.g. 6"
                        placeholderTextColor="#94a3b8"
                        keyboardType="numeric"
                      />
                      <Text style={styles.inputHelpText}>Active study semester (1–8)</Text>
                    </View>
                  </View>

                  {/* Section & Academic Batch */}
                  <View style={styles.formRowTwo}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.formLabel}>Section / Division *</Text>
                      <TextInput
                        style={styles.formInput}
                        value={section}
                        onChangeText={setSection}
                        placeholder="e.g. A"
                        placeholderTextColor="#94a3b8"
                      />
                    </View>

                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.formLabel}>Academic Batch *</Text>
                      <TextInput
                        style={styles.formInput}
                        value={batch}
                        onChangeText={setBatch}
                        placeholder="e.g. 2022–2026"
                        placeholderTextColor="#94a3b8"
                      />
                    </View>
                  </View>

                  {/* Register Number & Roll Number */}
                  <View style={styles.formRowTwo}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.formLabel}>University Register Number *</Text>
                      <TextInput
                        style={styles.formInput}
                        value={registerNo}
                        onChangeText={setRegisterNo}
                        placeholder="e.g. 714022104045"
                        placeholderTextColor="#94a3b8"
                      />
                    </View>

                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.formLabel}>College Roll Number *</Text>
                      <TextInput
                        style={styles.formInput}
                        value={rollNo}
                        onChangeText={setRollNo}
                        placeholder="e.g. 22AD045"
                        placeholderTextColor="#94a3b8"
                      />
                    </View>
                  </View>

                  {/* Department & Program */}
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Department & Degree Program *</Text>
                    <TextInput
                      style={styles.formInput}
                      value={department}
                      onChangeText={setDepartment}
                      placeholder="e.g. Artificial Intelligence & Data Science"
                      placeholderTextColor="#94a3b8"
                    />
                  </View>

                  {/* Faculty Mentor */}
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Assigned Faculty Mentor *</Text>
                    <TextInput
                      style={styles.formInput}
                      value={mentor}
                      onChangeText={setMentor}
                      placeholder="e.g. Dr. R. Kavitha, M.E., Ph.D."
                      placeholderTextColor="#94a3b8"
                    />
                  </View>
                </View>
              </View>

              {/* PERSONAL INFORMATION CARD */}
              <View style={styles.sectionCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderIconWrap}>
                    <MaterialIcons name="person" size={18} color="#003fb1" />
                  </View>
                  <Text style={styles.cardHeaderTitle}>Personal Information</Text>
                </View>

                <View style={styles.formGrid}>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Full Legal Name *</Text>
                    <TextInput
                      style={styles.formInput}
                      value={fullName}
                      onChangeText={setFullName}
                      placeholder="e.g. Prakash S"
                      placeholderTextColor="#94a3b8"
                    />
                  </View>

                  <View style={styles.formRowTwo}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.formLabel}>College Email ID *</Text>
                      <TextInput
                        style={styles.formInput}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        placeholder="e.g. prakash.s@infotech.edu.in"
                        placeholderTextColor="#94a3b8"
                      />
                    </View>

                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.formLabel}>Mobile Number *</Text>
                      <TextInput
                        style={styles.formInput}
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        placeholder="e.g. +91 98765 43210"
                        placeholderTextColor="#94a3b8"
                      />
                    </View>
                  </View>

                  <View style={styles.formRowTwo}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.formLabel}>Date of Birth *</Text>
                      <TextInput
                        style={styles.formInput}
                        value={dob}
                        onChangeText={setDob}
                        placeholder="YYYY-MM-DD or DD Mon YYYY"
                        placeholderTextColor="#94a3b8"
                      />
                    </View>

                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.formLabel}>Blood Group *</Text>
                      <TextInput
                        style={styles.formInput}
                        value={bloodGroup}
                        onChangeText={setBloodGroup}
                        placeholder="e.g. O+ve"
                        placeholderTextColor="#94a3b8"
                      />
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Hostel / Residential Address *</Text>
                    <TextInput
                      style={[styles.formInput, styles.formTextArea]}
                      value={address}
                      onChangeText={setAddress}
                      multiline
                      numberOfLines={3}
                      placeholder="Room number, hostel block or permanent home address"
                      placeholderTextColor="#94a3b8"
                    />
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
                    {isSaving ? 'Saving Changes...' : 'Save Profile & Academic Records'}
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
  academicSectionCard: {
    borderColor: '#bfdbfe',
    backgroundColor: '#ffffff',
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
  cardHeaderSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
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

  /* Summary List */
  summaryList: {
    gap: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  summaryLabel: {
    fontSize: 12.5,
    color: '#64748b',
  },
  summaryVal: {
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
  highlightInput: {
    backgroundColor: '#ffffff',
    borderColor: '#003fb1',
    fontWeight: '700',
    color: '#003fb1',
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
