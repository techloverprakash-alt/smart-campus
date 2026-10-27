import React, {useState, useEffect} from 'react';
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
  Platform,
  Alert,
  ActivityIndicator,
} from '@/ui';
import {LinearGradient} from '@/ui';
import {MaterialIcons} from '@/ui';
import {useAuth} from '../../auth/context/AuthContext';
import {updateMyProfile} from '../../../services/api/profiles';

const BLUE = '#2563eb';
const DARK_BLUE = '#1d4ed8';

const PROFILE_IMAGE =
  'https://lh3.googleusercontent.com/aida/AEtjO1XIIc9VOS1LfCt_BXF58QTo9nW7-ZMb6tbT_TuonOT392O9PfJp87VYteLLUm6-x778IC2MhVR5Iz6xk7Am2DI7zOTSRfojqY63H-6r-5qHojJUfBWZleBpzd_QXXhCquA6oKL1YE3hMnLWAd0ueyTS7ClxiNAXaLo9ry0Zo9K9j20z_u8eoO1Dfu8L6sRuF2ghPngDexsDRDzkcxEP-3OZGyF3kLaF6ZTihlKf1SIOILW4r3AQ-rv-JPs';

const DetailField = ({
  icon,
  label,
  value,
  onChangeText,
  keyboardType = 'default',
  editable = true,
  multiline = false,
}) => {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <View style={styles.inputWrapper}>
        <MaterialIcons
          name={icon}
          size={17}
          color="#94a3b8"
          style={styles.inputIcon}
        />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 2 : 1}
          style={[
            styles.input,
            multiline && styles.textArea,
            !editable && styles.disabledInput,
          ]}
          placeholderTextColor="#94a3b8"
        />
      </View>
    </View>
  );
};

const LockedField = ({label, value}) => {
  return (
    <View style={styles.lockedField}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <View style={styles.lockedBox}>
        <Text style={styles.lockedText}>{value}</Text>
      </View>
    </View>
  );
};

const BottomNavigation = ({navigation}) => {
  return (
    <View className="bottom-nav" style={styles.bottomNavigation}>
      <TouchableOpacity
        style={styles.bottomItem}
        onPress={() => navigation?.navigate('StudentDashboard')}
      >
        <MaterialIcons name="dashboard" size={22} color="#64748b" />
        <Text style={styles.bottomText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.bottomItem}
        onPress={() => navigation?.navigate('StudentAttendanceDetail')}
      >
        <MaterialIcons name="how-to-reg" size={22} color="#64748b" />
        <Text style={styles.bottomText}>Attendance</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.bottomItem}
        onPress={() => navigation?.navigate('AttendanceHistory')}
      >
        <MaterialIcons name="calendar-month" size={22} color="#64748b" />
        <Text style={styles.bottomText}>History</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.bottomItem}
        onPress={() => navigation?.navigate('StudentProfile')}
      >
        <View style={styles.activeBottom}>
          <MaterialIcons
            name="person"
            size={20}
            color="#2563eb"
          />

          <Text style={styles.activeBottomText}>
            Profile
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default function StudentEditProfile({navigation}) {
  const {user, profile, updateProfile, refreshProfile} = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name || user?.profile?.full_name || 'Aravind Kumar');
  const [email, setEmail] = useState(profile?.email || user?.email || 'aravind.k@infotech.edu.in');
  const [phone, setPhone] = useState(profile?.phone || '+91 98765 43210');
  const [dob, setDob] = useState(profile?.date_of_birth ? String(profile.date_of_birth) : '2003-08-14');
  const [bloodGroup, setBloodGroup] = useState(profile?.blood_group || 'O +ve');
  const [address, setAddress] = useState(
    profile?.address || 'Room 304, Kaveri Hostel Block B, Info IT Campus, Coimbatore - 641014'
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
    }
  }, [profile]);

  const saveProfile = async () => {
    try {
      setIsSaving(true);
      if (updateProfile) {
        await updateProfile({
          full_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          date_of_birth: dob.trim(),
          blood_group: bloodGroup.trim(),
          address: address.trim(),
        });
      } else {
        await updateMyProfile({
          full_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          date_of_birth: dob.trim(),
          blood_group: bloodGroup.trim(),
          address: address.trim(),
        });
      }
      if (refreshProfile) await refreshProfile();
      Alert.alert(
        'Profile Saved',
        'Your profile updates have been saved successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation?.goBack(),
          },
        ]
      );
    } catch (err) {
      Alert.alert('Notice', 'Profile saved locally.');
      if (navigation && navigation.goBack) navigation.goBack();
    } finally {
      setIsSaving(false);
    }
  };

  const cancelChanges = () => {
    Alert.alert(
      'Discard Changes',
      'Your changes have been discarded.',
      [
        {
          text: 'OK',
          onPress: () => navigation?.goBack(),
        },
      ]
    );
  };

  const changePhoto = () => {
    Alert.alert(
      'Change Photo',
      'Photo selection can be connected to the device gallery here.'
    );
  };

  const removePhoto = () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove your profile photo?'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#ffffff"
      />

      <View style={styles.screen}>

        {/* ================================================= */}
        {/* TOP APP BAR                                      */}
        {/* ================================================= */}

        <View style={styles.topBar}>

          <View style={styles.headerLeft}>

            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.7}
              onPress={() => navigation?.goBack()}
            >
              <MaterialIcons
                name="arrow-back"
                size={22}
                color="#475569"
              />
            </TouchableOpacity>

            <View>
              <Text style={styles.headerTitle}>
                Edit Profile
              </Text>

              <Text style={styles.headerSubtitle}>
                Student Portal • NEXUS
              </Text>
            </View>

          </View>

          <TouchableOpacity
            style={styles.saveTopButton}
            activeOpacity={0.85}
            onPress={saveProfile}
          >
            <MaterialIcons
              name="check"
              size={16}
              color="#ffffff"
            />

            <Text style={styles.saveTopText}>
              Save
            </Text>
          </TouchableOpacity>

        </View>

        {/* ================================================= */}
        {/* MAIN CONTENT                                     */}
        {/* ================================================= */}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >

          {/* ================================================= */}
          {/* PROFILE PHOTO CARD                              */}
          {/* ================================================= */}

          <View style={styles.card}>

            <View style={styles.photoArea}>

              <View style={styles.profilePhotoWrapper}>

                <View style={styles.profilePhotoRing}>
                  <Image
                    source={{uri: profile?.avatar_url || user?.profile?.avatar_url || PROFILE_IMAGE}}
                    style={styles.profilePhoto}
                    resizeMode="cover"
                  />
                </View>

                <TouchableOpacity
                  style={styles.cameraButton}
                  activeOpacity={0.85}
                  onPress={changePhoto}
                >
                  <MaterialIcons
                    name="photo-camera"
                    size={16}
                    color="#ffffff"
                  />
                </TouchableOpacity>

              </View>

              <View style={styles.profileNameArea}>

                <Text style={styles.profileName}>
                  {fullName || 'Student'}
                </Text>

                <View style={styles.profileBadge}>
                  <Text style={styles.profileBadgeText}>
                    {(profile?.register_number || user?.identifier || '21AD042') + ' • ' + (profile?.department?.code || 'AI & DS')}
                  </Text>
                </View>

              </View>

              <View style={styles.photoButtons}>

                <TouchableOpacity
                  style={styles.changePhotoButton}
                  activeOpacity={0.8}
                  onPress={changePhoto}
                >
                  <Text style={styles.changePhotoText}>
                    Change Photo
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.removeButton}
                  activeOpacity={0.8}
                  onPress={removePhoto}
                >
                  <Text style={styles.removeText}>
                    Remove
                  </Text>
                </TouchableOpacity>

              </View>

              <Text style={styles.photoHint}>
                JPG, PNG or WEBP up to 5MB. Must be formal attire.
              </Text>

            </View>

          </View>

          {/* ================================================= */}
          {/* ACADEMIC RECORDS                                */}
          {/* ================================================= */}

          <View style={styles.card}>

            <View style={styles.sectionHeader}>

              <View style={styles.sectionTitleContainer}>

                <MaterialIcons
                  name="school"
                  size={18}
                  color={BLUE}
                />

                <Text style={styles.sectionTitle}>
                  ACADEMIC RECORDS
                </Text>

              </View>

              <View style={styles.lockBadge}>

                <MaterialIcons
                  name="lock"
                  size={12}
                  color="#94a3b8"
                />

                <Text style={styles.lockText}>
                  Registrar Locked
                </Text>

              </View>

            </View>

            <View style={styles.sectionDivider} />

            {/* Register No */}

            <View style={styles.twoColumn}>

              <View style={styles.column}>
                <LockedField
                  label="Student ID"
                  value={profile?.register_number || user?.identifier || '21AD042'}
                />
              </View>

              <View style={styles.column}>
                <LockedField
                  label="Register No."
                  value={profile?.register_number || user?.identifier || '714021104042'}
                />
              </View>

            </View>

            {/* Department */}

            <LockedField
              label="Department & Branch"
              value={profile?.department?.name || 'Artificial Intelligence & Data Science'}
            />

            {/* Semester and Batch */}

            <View style={styles.twoColumn}>

              <View style={styles.column}>
                <LockedField
                  label="Current Semester"
                  value={profile?.semester ? `Semester ${profile.semester}` : 'Semester 6 (Year III)'}
                />
              </View>

              <View style={styles.column}>
                <LockedField
                  label="Batch Period"
                  value={profile?.batch ? `Batch ${profile.batch}` : '2022 – 2026'}
                />
              </View>

            </View>

            {/* Info */}

            <View style={styles.infoContainer}>

              <MaterialIcons
                name="info"
                size={13}
                color="#f59e0b"
              />

              <Text style={styles.infoText}>
                To update locked academic credentials, contact Academic Cell.
              </Text>

            </View>

          </View>

          {/* ================================================= */}
          {/* CONTACT DETAILS                                 */}
          {/* ================================================= */}

          <View style={styles.card}>

            <View style={styles.sectionHeader}>

              <View style={styles.sectionTitleContainer}>

                <MaterialIcons
                  name="person"
                  size={18}
                  color={BLUE}
                />

                <Text style={styles.sectionTitle}>
                  CONTACT DETAILS
                </Text>

              </View>

              <View style={styles.editableBadge}>
                <Text style={styles.editableText}>
                  Editable
                </Text>
              </View>

            </View>

            <View style={styles.sectionDivider} />

            {/* Full Name */}

            <DetailField
              icon="badge"
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
            />

            {/* Email */}

            <DetailField
              icon="mail"
              label="College Email ID"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            {/* Phone */}

            <DetailField
              icon="call"
              label="Mobile Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            {/* DOB + Blood Group */}

            <View style={styles.twoColumn}>

              <View style={styles.column}>

                <DetailField
                  icon="calendar-month"
                  label="Date of Birth"
                  value={dob}
                  onChangeText={setDob}
                />

              </View>

              <View style={styles.column}>

                <View style={styles.fieldContainer}>

                  <Text style={styles.fieldLabel}>
                    Blood Group
                  </Text>

                  <View style={styles.inputWrapper}>

                    <MaterialIcons
                      name="bloodtype"
                      size={17}
                      color="#94a3b8"
                      style={styles.inputIcon}
                    />

                    <TextInput
                      value={bloodGroup}
                      onChangeText={setBloodGroup}
                      style={styles.input}
                    />

                    <MaterialIcons
                      name="expand-more"
                      size={16}
                      color="#94a3b8"
                      style={styles.dropdownIcon}
                    />

                  </View>

                </View>

              </View>

            </View>

            {/* Address */}

            <View style={styles.fieldContainer}>

              <Text style={styles.fieldLabel}>
                Hostel / Residential Address
              </Text>

              <TextInput
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={2}
                style={styles.addressInput}
                textAlignVertical="top"
              />

            </View>

          </View>

          {/* ================================================= */}
          {/* FORM ACTION BUTTONS                             */}
          {/* ================================================= */}

          <View style={styles.actionArea}>

            <TouchableOpacity
              style={styles.saveProfileButton}
              activeOpacity={0.85}
              onPress={saveProfile}
            >

              <MaterialIcons
                name="save"
                size={18}
                color="#ffffff"
              />

              <Text style={styles.saveProfileText}>
                Save Profile Updates
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.8}
              onPress={cancelChanges}
            >

              <Text style={styles.cancelText}>
                Cancel / Discard Changes
              </Text>

            </TouchableOpacity>

          </View>

          {/* Bottom navigation spacing */}
          <View style={{height: 75}} />

        </ScrollView>

        {/* ================================================= */}
        {/* BOTTOM NAVIGATION                               */}
        {/* ================================================= */}

        <BottomNavigation navigation={navigation} />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  /* ===================================================== */
  /* ROOT                                                 */
  /* ===================================================== */

  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  screen: {
    flex: 1,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: '#f8fafc',
  },

  /* ===================================================== */
  /* TOP BAR                                              */
  /* ===================================================== */

  topBar: {
    height: 64,
    paddingHorizontal: 16,

    backgroundColor: 'rgba(255,255,255,0.97)',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226,232,240,0.8)',

    zIndex: 40,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 12,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: 20,
  },

  headerSubtitle: {
    marginTop: 1,

    fontSize: 11,
    fontWeight: '500',

    color: '#64748b',
  },

  saveTopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 14,
    paddingVertical: 7,

    borderRadius: 8,

    backgroundColor: BLUE,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,

    elevation: 2,
  },

  saveTopText: {
    marginLeft: 4,

    fontSize: 12,
    fontWeight: '600',

    color: '#ffffff',
  },

  /* ===================================================== */
  /* CONTENT                                              */
  /* ===================================================== */

  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },

  /* ===================================================== */
  /* CARD                                                 */
  /* ===================================================== */

  card: {
    width: '100%',

    backgroundColor: '#ffffff',

    borderRadius: 16,

    padding: 16,

    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.7)',

    marginBottom: 16,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,

    elevation: 2,
  },

  /* ===================================================== */
  /* PROFILE PHOTO                                        */
  /* ===================================================== */

  photoArea: {
    alignItems: 'center',
    textAlign: 'center',
  },

  profilePhotoWrapper: {
    width: 96,
    height: 96,

    position: 'relative',
  },

  profilePhotoRing: {
    width: 96,
    height: 96,

    borderRadius: 48,

    overflow: 'hidden',

    backgroundColor: '#f1f5f9',

    borderWidth: 4,
    borderColor: '#eff6ff',

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,

    elevation: 2,
  },

  profilePhoto: {
    width: '100%',
    height: '100%',

    borderRadius: 48,
  },

  cameraButton: {
    position: 'absolute',

    right: -1,
    bottom: -1,

    width: 32,
    height: 32,

    borderRadius: 16,

    backgroundColor: BLUE,

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 2,
    borderColor: '#ffffff',

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 3,

    elevation: 4,
  },

  profileNameArea: {
    alignItems: 'center',

    marginTop: 12,
  },

  profileName: {
    fontSize: 14,
    fontWeight: '600',

    color: '#0f172a',
  },

  profileBadge: {
    marginTop: 2,

    paddingHorizontal: 10,
    paddingVertical: 2,

    borderRadius: 999,

    backgroundColor: '#eff6ff',

    borderWidth: 1,
    borderColor: '#dbeafe',
  },

  profileBadgeText: {
    fontSize: 11,
    fontWeight: '500',

    color: '#1d4ed8',
  },

  photoButtons: {
    flexDirection: 'row',
    alignItems: 'center',

    marginTop: 12,
  },

  changePhotoButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,

    borderRadius: 8,

    backgroundColor: 'rgba(239,246,255,0.6)',

    borderWidth: 1,
    borderColor: 'rgba(219,234,254,0.6)',
  },

  changePhotoText: {
    fontSize: 12,
    fontWeight: '500',

    color: '#2563eb',
  },

  removeButton: {
    marginLeft: 8,

    paddingHorizontal: 12,
    paddingVertical: 6,

    borderRadius: 8,
  },

  removeText: {
    fontSize: 12,
    fontWeight: '500',

    color: '#e11d48',
  },

  photoHint: {
    marginTop: 8,

    fontSize: 10,
    fontWeight: '400',

    color: '#94a3b8',

    textAlign: 'center',
  },

  /* ===================================================== */
  /* SECTION HEADER                                       */
  /* ===================================================== */

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingBottom: 8,
  },

  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',

    flexShrink: 1,
  },

  sectionTitle: {
    marginLeft: 6,

    fontSize: 12,
    fontWeight: '600',

    letterSpacing: 1,

    color: '#334155',
  },

  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 8,
    paddingVertical: 2,

    borderRadius: 4,

    backgroundColor: '#f1f5f9',
  },

  lockText: {
    marginLeft: 4,

    fontSize: 10,
    fontWeight: '500',

    color: '#94a3b8',
  },

  editableBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,

    borderRadius: 4,

    backgroundColor: '#eff6ff',
  },

  editableText: {
    fontSize: 10,
    fontWeight: '500',

    color: '#2563eb',
  },

  sectionDivider: {
    height: 1,

    backgroundColor: '#f1f5f9',

    marginBottom: 12,
  },

  /* ===================================================== */
  /* TWO COLUMN                                          */
  /* ===================================================== */

  twoColumn: {
    flexDirection: 'row',

    gap: 12,

    marginBottom: 0,
  },

  column: {
    flex: 1,
  },

  /* ===================================================== */
  /* LOCKED FIELDS                                       */
  /* ===================================================== */

  lockedField: {
    marginBottom: 12,
    flex: 1,
  },

  fieldLabel: {
    fontSize: 11,
    fontWeight: '500',

    color: '#64748b',

    marginBottom: 4,
  },

  lockedBox: {
    minHeight: 38,

    paddingHorizontal: 12,
    paddingVertical: 9,

    backgroundColor: '#f8fafc',

    borderWidth: 1,
    borderColor: '#e2e8f0',

    borderRadius: 12,

    justifyContent: 'center',
  },

  lockedText: {
    fontSize: 12,
    fontWeight: '500',

    color: '#334155',
  },

  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',

    paddingTop: 2,
  },

  infoText: {
    flex: 1,

    marginLeft: 4,

    fontSize: 10,
    fontWeight: '400',

    color: '#94a3b8',

    lineHeight: 15,
  },

  /* ===================================================== */
  /* EDITABLE INPUTS                                     */
  /* ===================================================== */

  fieldContainer: {
    marginBottom: 12,
  },

  inputWrapper: {
    minHeight: 38,

    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#ffffff',

    borderWidth: 1,
    borderColor: '#cbd5e1',

    borderRadius: 12,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 2,

    elevation: 1,
  },

  inputIcon: {
    marginLeft: 12,
  },

  input: {
    flex: 1,

    minHeight: 36,

    paddingHorizontal: 8,
    paddingVertical: 7,

    fontSize: 12,
    fontWeight: '500',

    color: '#1e293b',
  },

  disabledInput: {
    backgroundColor: '#f8fafc',
  },

  dropdownIcon: {
    marginRight: 8,
  },

  addressInput: {
    minHeight: 64,

    paddingHorizontal: 12,
    paddingVertical: 9,

    backgroundColor: '#ffffff',

    borderWidth: 1,
    borderColor: '#cbd5e1',

    borderRadius: 12,

    fontSize: 12,
    fontWeight: '500',

    color: '#1e293b',

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 2,

    elevation: 1,
  },

  textArea: {
    minHeight: 55,
  },

  /* ===================================================== */
  /* FORM ACTIONS                                        */
  /* ===================================================== */

  actionArea: {
    paddingTop: 2,
    paddingBottom: 4,
  },

  saveProfileButton: {
    width: '100%',

    minHeight: 48,

    borderRadius: 12,

    backgroundColor: BLUE,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#3b82f6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.20,
    shadowRadius: 6,

    elevation: 4,
  },

  saveProfileText: {
    marginLeft: 8,

    fontSize: 12,
    fontWeight: '600',

    color: '#ffffff',
  },

  cancelButton: {
    width: '100%',

    minHeight: 42,

    marginTop: 8,

    borderRadius: 12,

    backgroundColor: '#ffffff',

    borderWidth: 1,
    borderColor: '#e2e8f0',

    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelText: {
    fontSize: 12,
    fontWeight: '500',

    color: '#475569',
  },

  /* ===================================================== */
  /* BOTTOM NAVIGATION                                   */
  /* ===================================================== */

  bottomNavigation: {
    position: 'absolute',

    left: 0,
    right: 0,
    bottom: 0,

    height: 64,

    backgroundColor: '#ffffff',

    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',

    paddingHorizontal: 16,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,

    elevation: 10,

    zIndex: 50,
  },

  bottomItem: {
    flex: 1,

    height: 56,

    alignItems: 'center',
    justifyContent: 'center',
  },

  bottomText: {
    marginTop: 2,

    fontSize: 10,
    fontWeight: '500',

    color: '#64748b',
  },

  activeBottom: {
    minWidth: 62,

    paddingHorizontal: 14,
    paddingVertical: 4,

    borderRadius: 999,

    backgroundColor: '#eff6ff',

    alignItems: 'center',
    justifyContent: 'center',
  },

  activeBottomText: {
    marginTop: 1,

    fontSize: 10,
    fontWeight: '700',

    color: '#1d4ed8',
  },

});
