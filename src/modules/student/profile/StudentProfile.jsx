import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from '@/ui';
import { LinearGradient } from '@/ui';
import { MaterialIcons } from '@/ui';
import StudentBottomNav from '../../../components/common/StudentBottomNav';
import { useAuth } from '../../auth/context/AuthContext';
import { getMyProfile } from '../../../services/api/profiles';

const COLLEGE_LOGO =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuANdWs9FsNCaoAEBH-d9jjOGNGHTECsPM5IBwpJZ8hGqWi5BU4XLsXoaZhn9Oj3Tl9ZiK4tWrjXASrpYcWSeB-4H5TuTOP_3_F-HFZDDAoTANGqXUs9Itaneg-eQUPrdgkpGTGMcJaBp7mFQkmNSlvLN2wHxfwOnW9oLojQsVvmLjPbV7DiGhYaNHNlHp7CWp-TtswVdW5UDM4P9f_lTYd9BTzywk-v6kHE3bO2smiq3IZsLXaiXBlsChR7BG6NiYKgDw';

const PROFILE_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDLMCP8yRlQ0t64bRrmg74ykXVPvsr5Wu0pe7d2NwkXvOlBpvA58cOJaOBG8D9JPBGrg_FO6IWfBxlmEhjWNog-DbQlGX8msgQzxS28oUSjAhY3VkBbDcgFXYKq1NRwZONhHCa7TxdG6fS0f5qgDmtkmdJm9Y44DczH3-ggueFzDOZxl-xDxq0xoUhGVzciGNRHiWjScT0R9LdaDgmLGkWeo-AfeTuo6h1b7CmaX0klr3Ni11bzQYqV';

const BRAND = '#1a56db';

const DetailRow = ({ icon, label, value }) => {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailLeft}>
        <MaterialIcons name={icon} size={18} color={BRAND} />
        <Text style={styles.detailLabel}>{label}</Text>
      </View>

      <Text
        style={styles.detailValue}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {value}
      </Text>
    </View>
  );
};

const StudentProfile = ({ navigation }) => {
  const { user, profile: authProfile, signOut } = useAuth();
  const [profile, setProfile] = useState(authProfile || null);

  useEffect(() => {
    if (authProfile) {
      setProfile(authProfile);
    } else {
      getMyProfile()
        .then((data) => {
          if (data) setProfile(data);
        })
        .catch(() => {});
    }
  }, [authProfile]);

  const studentName = profile?.full_name || user?.profile?.full_name || 'Student';
  const registerNo = profile?.register_number || user?.identifier || 'N/A';
  const departmentName = profile?.department?.name || 'Department of AI & DS';
  const departmentCode = profile?.department?.code || 'B.Tech';
  const semesterText = profile?.semester ? `Semester ${profile.semester}` : '3rd Year';
  const sectionText = profile?.section ? `Sec ${profile.section}` : 'Section A';
  const batchText = profile?.batch ? `Batch ${profile.batch}` : 'Batch 2022–2026';
  const emailText = profile?.email || user?.email || `${registerNo.toLowerCase()}@infotech.edu.in`;
  const phoneText = profile?.phone || '+91 98765 43210';
  const mentorText = profile?.faculty_mentor?.full_name || 'Dr. Sarah Williams';
  const dobBloodText = `${profile?.date_of_birth || '14 Aug 2003'} • ${profile?.blood_group || 'O+ve'}`;
  const avatarUri = profile?.avatar_url || user?.profile?.avatar_url || PROFILE_IMAGE;

  const handleLogout = async () => {
    await signOut();
    navigation?.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fafbff"
      />

      <View style={styles.appContainer}>
        {/* ================= TOP BAR ================= */}
        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <TouchableOpacity
              style={{ marginRight: 8, padding: 4 }}
              onPress={() => {
                if (navigation && navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation?.navigate('StudentDashboard');
                }
              }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="arrow-back" size={24} color="#1e293b" />
            </TouchableOpacity>

            <Text style={{ fontSize: 18, fontWeight: '700', color: '#1e293b' }}>Student Profile</Text>
          </View>
        </View>

        {/* ================= MAIN CONTENT ================= */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Section Title */}
          <View style={styles.titleSection}>
            <Text style={styles.pageTitle}>Student Profile</Text>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.editButton}
              onPress={() => navigation?.navigate('StudentEditProfile')}
            >
              <MaterialIcons
                name="edit"
                size={16}
                color={BRAND}
              />

              <Text style={styles.editText}>
                Edit Profile
              </Text>
            </TouchableOpacity>
          </View>

          {/* ================= STUDENT CARD ================= */}
          <View style={styles.studentCard}>
            {/* Blue Cover */}
            <LinearGradient
              colors={['#1a56db', '#3b82f6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.cover}
            >
              {/* Profile Image */}
              <View style={styles.profileImageContainer}>
                <View style={styles.profileImageBorder}>
                  <Image
                    source={{ uri: avatarUri }}
                    style={styles.profileImage}
                    resizeMode="cover"
                  />
                </View>

                {/* Active Indicator */}
                <View style={styles.activeIndicator}>
                  <View style={styles.activeIndicatorInner} />
                </View>
              </View>
            </LinearGradient>

            {/* Student Info */}
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>{studentName}</Text>
              <Text style={styles.registerNumber}>{registerNo}</Text>

              <View style={styles.departmentPill}>
                <Text style={styles.departmentText}>
                  {departmentName}
                </Text>
              </View>

              <Text style={styles.studentMeta}>
                {departmentCode} • {semesterText} • {sectionText} • {batchText}
              </Text>

              <View style={styles.divider} />

              {/* Details */}
              <View style={styles.detailsContainer}>
                <DetailRow
                  icon="mail"
                  label="Email"
                  value={emailText}
                />

                <DetailRow
                  icon="call"
                  label="Phone"
                  value={phoneText}
                />

                <DetailRow
                  icon="school"
                  label="Faculty Mentor"
                  value={mentorText}
                />

                <DetailRow
                  icon="calendar-today"
                  label="DOB / Blood Group"
                  value={dobBloodText}
                />
              </View>
            </View>
          </View>

          {/* Extra bottom spacing to avoid bottom nav overlay */}
          <View style={{ height: 80 }} />
        </ScrollView>

        <StudentBottomNav activeTab="profile" navigation={navigation} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fafbff',
  },

  appContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fafbff',
  },

  header: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fafbff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    zIndex: 30,
  },

  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    padding: 2,
    borderWidth: 2,
    borderColor: 'rgba(37, 99, 235, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  logo: {
    width: '100%',
    height: '100%',
  },

  nexusText: {
    marginLeft: 10,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: '#2563eb',
  },

  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },

  titleSection: {
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.5,
  },

  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },

  editText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },

  studentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },

  cover: {
    height: 96,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  profileImageContainer: {
    position: 'absolute',
    bottom: -40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileImageBorder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    padding: 3,
    backgroundColor: '#ffffff',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
  },

  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },

  activeIndicator: {
    position: 'absolute',
    right: 2,
    bottom: 3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeIndicatorInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
  },

  studentInfo: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 20,
    alignItems: 'center',
  },

  studentName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 25,
    textAlign: 'center',
  },

  registerNumber: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '700',
    color: '#2563eb',
    letterSpacing: 0.7,
  },

  departmentPill: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#e8ecf8',
  },

  departmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a56db',
  },

  studentMeta: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b',
    textAlign: 'center',
  },

  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 16,
  },

  detailsContainer: {
    width: '100%',
  },

  detailRow: {
    width: '100%',
    minHeight: 38,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#f3f3fe',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },

  detailLabel: {
    marginLeft: 10,
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },

  detailValue: {
    marginLeft: 10,
    flexShrink: 1,
    maxWidth: 190,
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'right',
  },
});

export default StudentProfile;
