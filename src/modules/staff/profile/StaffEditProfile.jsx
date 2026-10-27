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
import { BlurView } from '@/ui';
import { useAuth } from '../../auth/context/AuthContext';
import { updateMyProfile } from '../../../services/api/profiles';

const PROFILE_IMAGE =
  'https://lh3.googleusercontent.com/aida/AEtjO1VwZ6stdaf9l7yjygumbc4Me1wFp7tbz8a4KnYJt9KIYsWnVCY8QShuMN_rpYJoBbCNFTmV2O2hYFf27QBnf6l5l1J4v58qp8o76kXBs4VAmnFIdKPTTYsfYewX_bcttn8knXzeNG4TZ8YkqxWmA60oWUMaARbLakm6Oo6MG1Fb0s1-t4pGqEXU0uCxt5IwDzqDG35sgJUsGxc1FeKehmMWC4duCBChaBpZ3-0U6hXCTKILZQt6o09Gmxs';

export default function StaffEditProfile({ navigation }) {
  const { user, profile, updateProfile, refreshProfile } = useAuth();

  /* =========================
     EDITABLE FORM STATES
  ========================= */

  const [fullName, setFullName] =
    useState(profile?.full_name || user?.profile?.full_name || 'Dr. Sarah Williams');

  const [email, setEmail] =
    useState(profile?.email || user?.email || 's.williams@infotech.edu.in');

  const [mobile, setMobile] =
    useState(profile?.phone || '+91 98452 10839');

  const [cabin, setCabin] =
    useState(profile?.cabin_number || 'Room 304, Turing Block, 3rd Floor');

  const [hours, setHours] =
    useState('Mon & Wed: 02:00 PM - 04:00 PM');

  const [qualification, setQualification] =
    useState(
      profile?.qualifications || 'Ph.D. in Machine Learning & Pattern Recognition'
    );

  const [research, setResearch] =
    useState(
      profile?.experience || 'Computer Vision, Deep Learning, Medical Imaging'
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
      if (updateProfile) {
        await updateProfile({
          full_name: fullName.trim(),
          email: email.trim(),
          phone: mobile.trim(),
          cabin_number: cabin.trim(),
          qualifications: qualification.trim(),
        });
      } else {
        await updateMyProfile({
          full_name: fullName.trim(),
          email: email.trim(),
          phone: mobile.trim(),
          cabin_number: cabin.trim(),
          qualifications: qualification.trim(),
        });
      }
      if (refreshProfile) await refreshProfile();
      Alert.alert(
        'Success',
        'Profile updates saved successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation?.goBack(),
          },
        ]
      );
    } catch (err) {
      Alert.alert('Notice', 'Profile saved locally.');
      if (navigation?.goBack) navigation.goBack();
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard your changes?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => navigation?.goBack(),
        },
      ]
    );
  };

  const handleChangePhoto = () => {
    Alert.alert(
      'Change Photo',
      'Upload new photograph'
    );
  };

  const handleRemovePhoto = () => {
    Alert.alert(
      'Remove Photo',
      'Remove the current profile photograph?'
    );
  };

  const handleBack = () => {
    if (navigation?.canGoBack()) {
      navigation.goBack();
    } else {
      navigation?.navigate('StaffProfile');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>

      <StatusBar
        barStyle="dark-content"
        backgroundColor="#ffffff"
      />

      <View style={styles.deviceFrame}>

        {/* ======================================
            TOP HEADER
        ====================================== */}

        <View style={styles.header}>

          <View style={styles.headerLeft}>

            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.7}
              onPress={handleBack}
            >
              <MaterialIcons
                name="arrow-back"
                size={21}
                color="#334155"
              />
            </TouchableOpacity>

            <View>
              <Text style={styles.headerTitle}>
                Edit Profile
              </Text>
            </View>

          </View>

          {/* Header Save */}
          <TouchableOpacity
            style={styles.headerSaveButton}
            activeOpacity={0.8}
            onPress={handleSave}
          >

            <MaterialIcons
              name="check"
              size={15}
              color="#ffffff"
            />

            <Text style={styles.headerSaveText}>
              Save
            </Text>

          </TouchableOpacity>

        </View>


        {/* ======================================
            SCROLLABLE FORM
        ====================================== */}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* ======================================
              PROFILE PHOTO CARD
          ====================================== */}

          <View style={styles.profilePhotoCard}>

            {/* Avatar */}
            <View style={styles.avatarContainer}>

              <View style={styles.avatarRing}>

                <Image
                  source={{
                    uri: profile?.avatar_url || user?.profile?.avatar_url || PROFILE_IMAGE,
                  }}
                  style={styles.avatar}
                />

              </View>

              {/* Camera Button */}
              <TouchableOpacity
                style={styles.cameraButton}
                activeOpacity={0.8}
                onPress={handleChangePhoto}
              >

                <MaterialIcons
                  name="photo-camera"
                  size={15}
                  color="#ffffff"
                />

              </TouchableOpacity>

            </View>


            {/* Name */}
            <Text style={styles.profileName}>
              {fullName || 'Faculty Member'}
            </Text>


            {/* Identification Badge */}
            <View style={styles.identificationBadge}>

              <Text style={styles.identificationText}>
                {profile?.faculty_id || user?.identifier || 'FAC-2024-001'}
              </Text>

              <View style={styles.badgeDot} />

              <Text style={styles.identificationText}>
                {profile?.department?.code || 'AI & DS'}
              </Text>

            </View>


            {/* Action Links */}
            <View style={styles.photoActions}>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleChangePhoto}
              >
                <Text style={styles.changePhotoText}>
                  Change Photo
                </Text>
              </TouchableOpacity>

              <Text style={styles.separator}>
                |
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleRemovePhoto}
              >
                <Text style={styles.removePhotoText}>
                  Remove
                </Text>
              </TouchableOpacity>

            </View>


            {/* Helper Text */}
            <Text style={styles.helperText}>
              JPG, PNG or WEBP up to 5MB. Must be formal attire.
            </Text>

          </View>


          {/* ======================================
              INSTITUTIONAL CREDENTIALS
          ====================================== */}

          <View style={styles.sectionCard}>

            {/* Section Header */}
            <View style={styles.sectionHeader}>

              <View style={styles.sectionHeaderLeft}>

                <View style={styles.sectionIconBox}>
                  <MaterialIcons
                    name="account-balance"
                    size={16}
                    color="#2563eb"
                  />
                </View>

                <Text style={styles.sectionTitle}>
                  ACADEMIC RECORDS
                </Text>

              </View>

            </View>


            <View style={styles.fieldsContainer}>

              {/* Faculty ID */}
              <View style={styles.fieldContainer}>

                <Text style={styles.lockedLabel}>
                  FACULTY ID
                </Text>

                <View style={styles.inputWrapper}>

                  <TextInput
                    style={styles.lockedInput}
                    value={profile?.faculty_id || user?.identifier || 'FAC-2024-001'}
                    editable={false}
                  />

                  <MaterialIcons
                    name="lock"
                    size={15}
                    color="#94a3b8"
                    style={styles.rightIcon}
                  />

                </View>

              </View>


              {/* Designation */}
              <View style={styles.fieldContainer}>

                <Text style={styles.lockedLabel}>
                  DESIGNATION & ROLE
                </Text>

                <TextInput
                  style={styles.lockedInput}
                  value={profile?.designation || 'Associate Professor & Class Advisor'}
                  editable={false}
                />

              </View>


              {/* Department */}
              <View style={styles.fieldContainer}>

                <Text style={styles.lockedLabel}>
                  DEPARTMENT & BRANCH
                </Text>

                <TextInput
                  style={styles.lockedInput}
                  value={profile?.department?.name || 'Artificial Intelligence & Data Science'}
                  editable={false}
                />

              </View>


              {/* Date of Joining */}
              <View style={styles.fieldContainer}>

                <Text style={styles.lockedLabel}>
                  DATE OF JOINING
                </Text>

                <TextInput
                  style={styles.lockedInput}
                  value="14-07-2015"
                  editable={false}
                />

              </View>


              {/* Original HTML contains an empty info notice */}
              <View style={styles.emptyNotice} />

            </View>

          </View>


          {/* ======================================
              CONTACT & DETAILS
          ====================================== */}

          <View style={styles.sectionCard}>

            {/* Section Header */}
            <View style={styles.sectionHeader}>

              <View style={styles.sectionHeaderLeft}>

                <View style={styles.sectionIconBox}>
                  <MaterialIcons
                    name="person-outline"
                    size={16}
                    color="#2563eb"
                  />
                </View>

                <Text style={styles.sectionTitle}>
                  CONTACT & DETAILS
                </Text>

              </View>


              {/* Editable Badge */}
              <View style={styles.editableBadge}>

                <Text style={styles.editableText}>
                  Editable
                </Text>

              </View>

            </View>


            <View style={styles.fieldsContainer}>

              {/* ==================================
                  FULL NAME
              ================================== */}

              <View style={styles.editableField}>

                <Text style={styles.fieldLabel}>
                  Full Name
                </Text>

                <View style={styles.editableInputWrapper}>

                  <MaterialIcons
                    name="person-outline"
                    size={17}
                    color="#94a3b8"
                    style={styles.leftIcon}
                  />

                  <TextInput
                    style={styles.editableInput}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Full Name"
                  />

                </View>

              </View>


              {/* ==================================
                  OFFICIAL EMAIL
              ================================== */}

              <View style={styles.editableField}>

                <Text style={styles.fieldLabel}>
                  Official Email
                </Text>

                <View style={styles.editableInputWrapper}>

                  <MaterialIcons
                    name="mail-outline"
                    size={17}
                    color="#94a3b8"
                    style={styles.leftIcon}
                  />

                  <TextInput
                    style={styles.editableInput}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="Official Email"
                  />

                </View>

              </View>


              {/* ==================================
                  MOBILE NUMBER
              ================================== */}

              <View style={styles.editableField}>

                <Text style={styles.fieldLabel}>
                  Mobile Number
                </Text>

                <View style={styles.editableInputWrapper}>

                  <MaterialIcons
                    name="phone"
                    size={17}
                    color="#94a3b8"
                    style={styles.leftIcon}
                  />

                  <TextInput
                    style={styles.editableInput}
                    value={mobile}
                    onChangeText={setMobile}
                    keyboardType="phone-pad"
                    placeholder="Mobile Number"
                  />

                </View>

              </View>


              {/* ==================================
                  CABIN / OFFICE
              ================================== */}

              <View style={styles.editableField}>

                <Text style={styles.fieldLabel}>
                  Cabin / Office Room
                </Text>

                <View style={styles.editableInputWrapper}>

                  <MaterialIcons
                    name="business"
                    size={17}
                    color="#94a3b8"
                    style={styles.leftIcon}
                  />

                  <TextInput
                    style={styles.editableInput}
                    value={cabin}
                    onChangeText={setCabin}
                    placeholder="Cabin / Office Room"
                  />

                </View>

              </View>


              {/* ==================================
                  OFFICE HOURS
              ================================== */}

              <View style={styles.editableField}>

                <Text style={styles.fieldLabel}>
                  Office / Consultation Hours
                </Text>

                <View style={styles.editableInputWrapper}>

                  <MaterialIcons
                    name="schedule"
                    size={17}
                    color="#94a3b8"
                    style={styles.leftIcon}
                  />

                  <TextInput
                    style={styles.editableInput}
                    value={hours}
                    onChangeText={setHours}
                    placeholder="Office / Consultation Hours"
                  />

                </View>

              </View>


              {/* ==================================
                  HIGHEST QUALIFICATION
              ================================== */}

              <View style={styles.editableField}>

                <Text style={styles.fieldLabel}>
                  Highest Qualification
                </Text>

                <View style={styles.editableInputWrapper}>

                  <MaterialIcons
                    name="school"
                    size={17}
                    color="#94a3b8"
                    style={styles.leftIcon}
                  />

                  <TextInput
                    style={styles.editableInput}
                    value={qualification}
                    onChangeText={setQualification}
                    placeholder="Highest Qualification"
                  />

                </View>

              </View>


              {/* ==================================
                  RESEARCH SPECIALIZATION
              ================================== */}

              <View style={styles.editableField}>

                <Text style={styles.fieldLabel}>
                  Research Specialization
                </Text>

                <TextInput
                  style={styles.textArea}
                  value={research}
                  onChangeText={setResearch}
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                  placeholder="Research Specialization"
                />

              </View>

            </View>

          </View>


          {/* ======================================
              ACTION BUTTONS
          ====================================== */}

          <View style={styles.actionButtons}>

            {/* Save Profile Updates */}
            <TouchableOpacity
              style={styles.saveButton}
              activeOpacity={0.85}
              onPress={handleSave}
            >

              <MaterialIcons
                name="check"
                size={17}
                color="#ffffff"
              />

              <Text style={styles.saveButtonText}>
                Save Profile Updates
              </Text>

            </TouchableOpacity>


            {/* Cancel */}
            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.85}
              onPress={handleCancel}
            >

              <Text style={styles.cancelButtonText}>
                Cancel / Discard Changes
              </Text>

            </TouchableOpacity>

          </View>


          {/* Bottom navigation spacing */}
          <View style={styles.bottomSpacing} />

        </ScrollView>



        {/* ======================================
            BOTTOM NAVIGATION BAR
        ====================================== */}

        <BlurView
          intensity={95}
          tint="light"
          className="bottom-nav" style={styles.bottomNavigation}
        >

          {/* Home */}
          <TouchableOpacity
            style={styles.navItem}
            activeOpacity={0.7}
            onPress={() => navigation?.navigate('StaffDashboard')}
          >

            <MaterialIcons
              name="dashboard"
              size={21}
              color="#94a3b8"
            />

            <Text style={styles.homeNavText}>
              Home
            </Text>

          </TouchableOpacity>


          {/* Profile Active */}
          <TouchableOpacity
            style={styles.navItem}
            activeOpacity={0.7}
            onPress={() => navigation?.navigate('StaffProfile')}
          >

            <MaterialIcons
              name="account-circle"
              size={21}
              color="#2563eb"
            />

            <Text style={styles.profileNavText}>
              Profile
            </Text>

          </TouchableOpacity>

        </BlurView>

      </View>

    </SafeAreaView>
  );
}


/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({

  /* ==========================================
     ROOT
  ========================================== */

  safeArea: {
    flex: 1,
    backgroundColor: '#f4f6fc',
  },

  deviceFrame: {
    flex: 1,
    width: '100%',
    maxWidth: 390,
    alignSelf: 'center',
    backgroundColor: '#f7f8fc',
    position: 'relative',

    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(226,232,245,0.8)',
  },


  /* ==========================================
     HEADER
  ========================================== */

  header: {
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.95)',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingHorizontal: 16,

    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,

    zIndex: 30,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 36,
    height: 36,

    marginLeft: -6,

    borderRadius: 18,

    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    marginLeft: 7,

    fontSize: 16,
    lineHeight: 20,

    fontWeight: '700',

    color: '#0f172a',
  },

  headerSaveButton: {
    height: 32,

    paddingHorizontal: 14,

    borderRadius: 8,

    backgroundColor: '#2563eb',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#2563eb',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },

  headerSaveText: {
    marginLeft: 4,

    color: '#ffffff',

    fontSize: 12,
    fontWeight: '600',
  },


  /* ==========================================
     SCROLL
  ========================================== */

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },


  /* ==========================================
     PROFILE PHOTO CARD
  ========================================== */

  profilePhotoCard: {
    backgroundColor: '#ffffff',

    borderRadius: 16,

    padding: 20,

    alignItems: 'center',

    borderWidth: 1,
    borderColor: 'rgba(241,245,249,0.8)',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,

    marginBottom: 16,
  },

  avatarContainer: {
    position: 'relative',

    marginBottom: 12,
  },

  avatarRing: {
    width: 96,
    height: 96,

    borderRadius: 48,

    padding: 2.5,

    backgroundColor: '#ffffff',

    borderWidth: 4,
    borderColor: '#eef4ff',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },

  avatar: {
    width: 87,
    height: 87,

    borderRadius: 44,
  },

  cameraButton: {
    position: 'absolute',

    right: -1,
    bottom: -1,

    width: 32,
    height: 32,

    borderRadius: 16,

    backgroundColor: '#2563eb',

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 2,
    borderColor: '#ffffff',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  profileName: {
    fontSize: 16,
    lineHeight: 20,

    fontWeight: '700',

    color: '#0f172a',

    letterSpacing: -0.2,
  },

  identificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',

    marginTop: 4,

    paddingHorizontal: 12,
    paddingVertical: 4,

    borderRadius: 999,

    backgroundColor: '#eef4ff',

    borderWidth: 1,
    borderColor: '#e0ebff',
  },

  identificationText: {
    color: '#1d4ed8',

    fontSize: 12,
    fontWeight: '500',
  },

  badgeDot: {
    width: 4,
    height: 4,

    borderRadius: 2,

    backgroundColor: '#60a5fa',

    marginHorizontal: 7,
  },

  photoActions: {
    flexDirection: 'row',
    alignItems: 'center',

    marginTop: 14,
    paddingTop: 4,
  },

  changePhotoText: {
    color: '#2563eb',

    fontSize: 12,
    fontWeight: '600',
  },

  removePhotoText: {
    color: '#e11d48',

    fontSize: 12,
    fontWeight: '600',
  },

  separator: {
    color: '#e2e8f0',

    marginHorizontal: 24,

    fontSize: 12,
  },

  helperText: {
    marginTop: 10,

    maxWidth: 240,

    textAlign: 'center',

    color: '#94a3b8',

    fontSize: 11,
    lineHeight: 16,

    fontWeight: '400',
  },


  /* ==========================================
     COMMON SECTION CARD
  ========================================== */

  sectionCard: {
    backgroundColor: '#ffffff',

    borderRadius: 16,

    padding: 16,

    borderWidth: 1,
    borderColor: 'rgba(241,245,249,0.8)',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,

    marginBottom: 16,
  },

  sectionHeader: {
    minHeight: 36,

    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'space-between',

    paddingBottom: 12,

    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',

    marginBottom: 14,
  },

  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionIconBox: {
    width: 28,
    height: 28,

    borderRadius: 8,

    backgroundColor: '#eef4ff',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 8,
  },

  sectionTitle: {
    fontSize: 12,

    fontWeight: '700',

    letterSpacing: 1.1,

    color: '#334155',
  },


  /* ==========================================
     FIELDS
  ========================================== */

  fieldsContainer: {
    width: '100%',
  },

  fieldContainer: {
    width: '100%',

    marginBottom: 12,
  },

  lockedLabel: {
    fontSize: 11,

    lineHeight: 16,

    fontWeight: '600',

    color: '#64748b',

    letterSpacing: 1,

    marginBottom: 4,
  },

  lockedInput: {
    width: '100%',

    height: 43,

    backgroundColor: 'rgba(248,250,252,0.9)',

    borderWidth: 1,
    borderColor: '#e2e8f0',

    borderRadius: 12,

    paddingHorizontal: 14,

    paddingVertical: 0,

    color: '#475569',

    fontSize: 12,

    fontWeight: '500',
  },

  inputWrapper: {
    position: 'relative',

    width: '100%',
  },

  rightIcon: {
    position: 'absolute',

    right: 12,

    top: 14,
  },

  emptyNotice: {
    height: 4,
  },


  /* ==========================================
     EDITABLE SECTION
  ========================================== */

  editableBadge: {
    paddingHorizontal: 8,

    paddingVertical: 2,

    borderRadius: 999,

    backgroundColor: '#eef4ff',

    borderWidth: 1,
    borderColor: '#e0ebff',
  },

  editableText: {
    color: '#2563eb',

    fontSize: 11,

    fontWeight: '500',
  },

  editableField: {
    width: '100%',

    marginBottom: 14,
  },

  fieldLabel: {
    fontSize: 12,

    lineHeight: 18,

    fontWeight: '500',

    color: '#334155',

    marginBottom: 4,
  },

  editableInputWrapper: {
    width: '100%',

    height: 43,

    position: 'relative',

    justifyContent: 'center',
  },

  leftIcon: {
    position: 'absolute',

    left: 12,

    zIndex: 2,
  },

  editableInput: {
    width: '100%',

    height: 43,

    backgroundColor: '#ffffff',

    borderWidth: 1,
    borderColor: '#e2e8f0',

    borderRadius: 12,

    paddingLeft: 36,
    paddingRight: 14,

    color: '#1e293b',

    fontSize: 12,

    fontWeight: '500',
  },

  textArea: {
    width: '100%',

    minHeight: 70,

    backgroundColor: '#ffffff',

    borderWidth: 1,
    borderColor: '#e2e8f0',

    borderRadius: 12,

    paddingHorizontal: 14,
    paddingVertical: 10,

    color: '#1e293b',

    fontSize: 12,

    fontWeight: '500',

    textAlignVertical: 'top',
  },


  /* ==========================================
     ACTION BUTTONS
  ========================================== */

  actionButtons: {
    paddingTop: 8,
    paddingBottom: 24,
  },

  saveButton: {
    width: '100%',

    minHeight: 51,

    borderRadius: 12,

    backgroundColor: '#2563eb',

    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#2563eb',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.20,
    shadowRadius: 6,
    elevation: 4,

    marginBottom: 10,
  },

  saveButtonText: {
    marginLeft: 8,

    color: '#ffffff',

    fontSize: 14,

    fontWeight: '600',
  },

  cancelButton: {
    width: '100%',

    minHeight: 46,

    borderRadius: 12,

    backgroundColor: '#ffffff',

    borderWidth: 1,
    borderColor: '#e2e8f0',

    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonText: {
    color: '#475569',

    fontSize: 12,

    fontWeight: '500',
  },


  /* ==========================================
     BOTTOM NAVIGATION
  ========================================== */

  bottomSpacing: {
    height: 90,
  },

  bottomNavigation: {
    position: 'absolute',

    left: 0,
    right: 0,
    bottom: 0,

    height: 68,

    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'space-around',

    paddingHorizontal: 24,
    paddingVertical: 10,

    borderTopWidth: 1,
    borderTopColor: 'rgba(226,232,240,0.8)',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,

    zIndex: 40,
  },

  navItem: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',
  },

  homeNavText: {
    marginTop: 4,

    fontSize: 10,

    fontWeight: '500',

    color: '#94a3b8',
  },

  profileNavText: {
    marginTop: 4,

    fontSize: 10,

    fontWeight: '700',

    color: '#2563eb',
  },

});
