import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Linking,
  Animated,
  Dimensions,
} from '@/ui';
import { LinearGradient } from '@/ui';
import { BlurView } from '@/ui';
import { MaterialIcons } from '@/ui';
import BottomNavBar from '../../../components/common/BottomNavBar';
import { useAuth } from '../../auth/context/AuthContext';
import { getMyProfile } from '../../../services/api/profiles';


const PROFILE_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCFCWJmMFftvFSe_dVzaVatl38lmMQcC979nZqmU1rofsfwQ9Mzk29w2_kvc5wV_4bNfid8yrKMsbLTPXeHWxzgRQcvtyygts-sZbdB7nzT8soo5dvPRDsMpr63ssi2_IDh5P3SwWNtLg5Ef7vvBV_yA_OJJD48bJjnNKtIgUmZehtvRebV7P1LlIiKzPXIcMiDxR3nMP0Mu7PGNbxMT4vL0YQ6mY8enlygltYEjWS2Cbi1drBPlJAo';

const HEADER_IMAGE =
  'https://lh3.googleusercontent.com/aida/AEtjO1WRuLxZa5rUExj5uvFAAptIPRQPx3VSH-CFu1Z299WmQtTvwqYJifoUdcsJCDmnTW6QvoAhQXMaTRVU8aha-M4zq03I8V9CiK3MAk6sbdV43_ZsHqc7er2JB1sYlKp2vfLj02NYUyIaysk_OSJbBgHf09SB76dqDdK-cu1ACe1GdlHz9JidvJaNiI4Nbj_wgrWk4860W-qMYJyezf5JZOksBVr1CxFq3SrDmoHiwh5CiRkA2XeqWwUopbQEYQ3f4sZPLvdZRYWMYg';

export default function StaffProfile({ navigation }) {
  const { user, profile: authProfile, signOut } = useAuth();
  const [profile, setProfile] = useState(authProfile || null);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslate = useRef(new Animated.Value(-20)).current;

  const pulseAnim = useRef(new Animated.Value(1)).current;

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

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.45,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const triggerToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);

    Animated.parallel([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(toastTranslate, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(toastTranslate, {
          toValue: -20,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setToastVisible(false);
      });
    }, 2600);
  };

  const handleLogout = async () => {
    if (signOut) await signOut();
    navigation?.navigate('Login');
  };

  const openEmail = () => {
    Linking.openURL(`mailto:${profile?.email || 's.williams@infotech.edu.in'}`);
  };

  const openPhone = () => {
    Linking.openURL(`tel:${profile?.phone || '+919845210839'}`);
  };

  const facultyName = profile?.full_name || user?.profile?.full_name || 'Dr. Sarah Williams';
  const facultyId = profile?.faculty_id || user?.identifier || 'FAC-2024-001';
  const departmentName = profile?.department?.name || 'Department of AI & DS';
  const designation = profile?.designation || 'Associate Professor & Class Advisor';
  const emailText = profile?.email || user?.email || 's.williams@infotech.edu.in';
  const phoneText = profile?.phone || '+91 98452 10839';
  const cabinText = profile?.cabin_number || 'Room 304, Turing Block, 3rd Floor';
  const experienceText = profile?.experience || '9+ Years Academic & Research';
  const qualificationText = profile?.qualifications || 'Ph.D. in Machine Learning & Pattern Recognition';
  const avatarUri = profile?.avatar_url || user?.profile?.avatar_url || PROFILE_IMAGE;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#faf8ff"
      />

      <View style={styles.container}>

        {/* ================= HEADER ================= */}
        <View style={styles.header}>
          <View style={[styles.headerLeft, { flexDirection: 'row', alignItems: 'center' }]}>
            <TouchableOpacity
              style={{ marginRight: 8, padding: 4 }}
              onPress={() => {
                if (navigation && navigation.canGoBack()) navigation.goBack();
                else navigation?.navigate('StaffDashboard');
              }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="arrow-back" size={24} color="#003fb1" />
            </TouchableOpacity>

            <Text style={styles.nexusText}>
              NEXUS College
            </Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.notificationButton}
              activeOpacity={0.7}
              onPress={handleLogout}
            >
              <MaterialIcons
                name="logout"
                size={22}
                color="#dc2626"
              />
            </TouchableOpacity>

            <View style={styles.headerProfileRing}>
              <Image
                source={{ uri: avatarUri }}
                style={styles.headerProfileImage}
              />
            </View>
          </View>
        </View>

        {/* ================= MAIN CONTENT ================= */}
        <View style={styles.mainWrapper}>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >

            {/* ================= TOAST ================= */}
            {toastVisible && (
              <Animated.View
                style={[
                  styles.toast,
                  {
                    opacity: toastOpacity,
                    transform: [
                      {
                        translateY: toastTranslate,
                      },
                    ],
                  },
                ]}
              >
                <MaterialIcons
                  name="check-circle"
                  size={22}
                  color="#003fb1"
                />

                <Text style={styles.toastText}>
                  {toastMessage}
                </Text>
              </Animated.View>
            )}

            {/* ================= SUB BAR ================= */}
            <View style={styles.subBar}>

              <View style={styles.subBarText}>
                <Text style={styles.pageTitle}>
                  Staff Profile
                </Text>

                <Text style={styles.pageSubtitle}>
                  Academic credentials & workload overview
                </Text>
              </View>

              <TouchableOpacity
                style={styles.editButton}
                activeOpacity={0.8}
                onPress={() => navigation?.navigate('StaffEditProfile')}
              >
                <MaterialIcons
                  name="edit"
                  size={18}
                  color="#003fb1"
                />

                <Text style={styles.editButtonText}>
                  Edit
                </Text>
              </TouchableOpacity>

            </View>

            {/* ================= FACULTY PROFILE CARD ================= */}
            <View style={styles.profileCard}>

              {/* Gradient Banner */}
              <LinearGradient
                colors={[
                  '#003fb1',
                  '#1a56db',
                  '#dce2f3',
                ]}
                start={{
                  x: 0,
                  y: 0,
                }}
                end={{
                  x: 1,
                  y: 0,
                }}
                style={styles.profileBanner}
              />

              {/* Profile Information */}
              <View style={styles.profileContent}>

                {/* Avatar */}
                <View style={styles.avatarWrapper}>
                  <Image
                    source={{ uri: avatarUri }}
                    style={styles.avatar}
                  />

                  <View style={styles.activeOuter}>
                    <Animated.View
                      style={[
                        styles.activeInner,
                        {
                          opacity: pulseAnim,
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* Name */}
                <Text style={styles.profileName}>
                  {facultyName}
                </Text>

                {/* Badges */}
                <View style={styles.badgeRow}>

                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {facultyId}
                    </Text>
                  </View>

                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {departmentName}
                    </Text>
                  </View>

                </View>

                {/* Role */}
                <Text style={styles.profileRole}>
                  {designation}
                </Text>

                {/* ================= CREDENTIALS ================= */}
                <View style={styles.credentialsCard}>

                  {/* Official Email */}
                  <TouchableOpacity
                    style={styles.credentialRow}
                    onPress={openEmail}
                    activeOpacity={0.7}
                  >
                    <View style={styles.iconContainer}>
                      <MaterialIcons
                        name="mail-outline"
                        size={21}
                        color="#003fb1"
                      />
                    </View>

                    <View style={styles.credentialText}>
                      <Text style={styles.credentialLabel}>
                        Official Email
                      </Text>

                      <Text style={styles.credentialValue}>
                        {emailText}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Mobile */}
                  <TouchableOpacity
                    style={styles.credentialRow}
                    onPress={openPhone}
                    activeOpacity={0.7}
                  >
                    <View style={styles.iconContainer}>
                      <MaterialIcons
                        name="call"
                        size={21}
                        color="#003fb1"
                      />
                    </View>

                    <View style={styles.credentialText}>
                      <Text style={styles.credentialLabel}>
                        Mobile
                      </Text>

                      <Text style={styles.credentialValue}>
                        {phoneText}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Cabin */}
                  <View style={styles.credentialRow}>
                    <View style={styles.iconContainer}>
                      <MaterialIcons
                        name="business"
                        size={21}
                        color="#003fb1"
                      />
                    </View>

                    <View style={styles.credentialText}>
                      <Text style={styles.credentialLabel}>
                        Cabin / Office
                      </Text>

                      <Text style={styles.credentialValue}>
                        {cabinText}
                      </Text>
                    </View>
                  </View>

                  {/* Experience */}
                  <View style={styles.credentialRow}>
                    <View style={styles.iconContainer}>
                      <MaterialIcons
                        name="history-edu"
                        size={21}
                        color="#003fb1"
                      />
                    </View>

                    <View style={styles.credentialText}>
                      <Text style={styles.credentialLabel}>
                        Academic Experience
                      </Text>

                      <Text style={styles.credentialValue}>
                        {experienceText}
                      </Text>
                    </View>
                  </View>

                  {/* Qualification */}
                  <View style={styles.credentialRow}>
                    <View style={styles.iconContainer}>
                      <MaterialIcons
                        name="school"
                        size={21}
                        color="#003fb1"
                      />
                    </View>

                    <View style={styles.credentialText}>
                      <Text style={styles.credentialLabel}>
                        Highest Qualification
                      </Text>

                      <Text style={styles.credentialValue}>
                        {qualificationText}
                      </Text>
                    </View>
                  </View>

                </View>
              </View>
            </View>

            {/* ================= TEACHING & WORKLOAD ================= */}
            <View style={styles.emptySection}>
              {/* Original HTML section intentionally empty */}
            </View>

            {/* ================= ASSIGNED SUBJECTS ================= */}
            <View style={styles.emptySection}>
              {/* Original HTML section intentionally empty */}
            </View>

            {/* ================= ADMINISTRATIVE ROLES ================= */}
            <View style={styles.emptySection}>
              {/* Original HTML section intentionally empty */}
            </View>

            {/* ================= QUICK ACTIONS ================= */}
            <View style={styles.emptySection}>
              {/* Original HTML section intentionally empty */}
            </View>

            {/* Space for bottom navigation */}
            <View style={styles.bottomSpace} />

          </ScrollView>
        </View>

        {/* ================= BOTTOM NAVIGATION ================= */}
        <BottomNavBar activeItem="profile" navigation={navigation} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  /* ================= GLOBAL ================= */

  safeArea: {
    flex: 1,
    backgroundColor: '#faf8ff',
  },

  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#faf8ff',
  },

  /* ================= HEADER ================= */

  header: {
    height: 64,
    width: '100%',
    backgroundColor: '#faf8ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeF8',
    zIndex: 20,
  },

  headerLeft: {
    flex: 1,
  },

  nexusText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: '#003fb1',
    textTransform: 'uppercase',
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  notificationDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#dc2626',
    right: 7,
    top: 7,
  },

  headerProfileRing: {
    width: 39,
    height: 39,
    borderRadius: 20,
    padding: 2,
    borderWidth: 2,
    borderColor: '#003fb1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerProfileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  /* ================= MAIN ================= */

  mainWrapper: {
    flex: 1,
    backgroundColor: '#faf8ff',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 20,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },

  /* ================= TOAST ================= */

  toast: {
    minHeight: 48,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },

  toastText: {
    flex: 1,
    color: '#222222',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },

  /* ================= SUB BAR ================= */

  subBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  subBarText: {
    flex: 1,
    paddingRight: 12,
  },

  pageTitle: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
    color: '#111111',
  },

  pageSubtitle: {
    marginTop: 3,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: '#666666',
  },

  editButton: {
    height: 40,
    paddingHorizontal: 13,
    borderRadius: 8,
    backgroundColor: '#dce2f3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  editButtonText: {
    color: '#003fb1',
    fontSize: 14,
    fontWeight: '600',
  },

  /* ================= PROFILE CARD ================= */

  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  profileBanner: {
    height: 80,
    width: '100%',
  },

  profileContent: {
    paddingHorizontal: 16,
    paddingBottom: 18,
    alignItems: 'center',
  },

  /* ================= AVATAR ================= */

  avatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#ffffff',
    padding: 4,
    marginTop: -48,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 7,
    elevation: 5,

    position: 'relative',
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },

  activeOuter: {
    position: 'absolute',
    right: 0,
    bottom: 3,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeInner: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#16a34a',
  },

  /* ================= PROFILE TEXT ================= */

  profileName: {
    marginTop: 12,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    color: '#111111',
    textAlign: 'center',
  },

  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    marginTop: 9,
  },

  badge: {
    backgroundColor: '#dce2f3',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  badgeText: {
    color: '#003fb1',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },

  profileRole: {
    marginTop: 10,
    paddingHorizontal: 10,
    color: '#555555',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    textAlign: 'center',
  },

  /* ================= CREDENTIALS ================= */

  credentialsCard: {
    width: '100%',
    marginTop: 18,
    backgroundColor: '#f3f3fe',
    borderRadius: 12,
    padding: 14,
  },

  credentialRow: {
    width: '100%',
    minHeight: 55,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },

  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  credentialText: {
    flex: 1,
  },

  credentialLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: '#6a6a6a',
    marginBottom: 2,
  },

  credentialValue: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: '#222222',
  },

  /* ================= EMPTY SECTIONS ================= */

  emptySection: {
    width: '100%',
  },

  /* ================= BOTTOM SPACE ================= */

  bottomSpace: {
    height: 90,
  },

  /* ================= BOTTOM NAV ================= */

  bottomNavWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 64,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 10,
    zIndex: 100,
  },

  bottomNav: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },

  navItem: {
    minWidth: 64,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navText: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '500',
    color: '#585f6c',
  },

  navTextActive: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    color: '#003fb1',
  },
});
