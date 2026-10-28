import React, { useState, useEffect } from 'react';
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
} from '@/ui';

import { BlurView } from '@/ui';
import { MaterialIcons } from '@/ui';
import BottomNavBar from '../../../components/common/BottomNavBar';
import { useAuth } from '../../auth/context/AuthContext';
import { getMyProfile } from '../../../services/api/profiles';

const NEXUS_LOGO = '/info_logo.png';

const PROFILE_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCc4W7vI51fe3ETw2EQX4lwi44xHoVjxhajjHMOpT9y4iEJ2w8FkLsxEKbcnrl10ihCKljH5APzLmaGOBLlDkKSoWlXxQZMUZCZ5ZYFRWfdzsJ5rRxYgOgXDtLucM8yYOpUOWkVomMC1Am6Bw_lboIad4GF0jJFtugTgDmGFGcLEeziTnzKyhlD6Q8oqmQyp73E-3fTq8Ea4twUa7ikmr3uzfZZGX0jipb0oFQobqODLlnQqLmhRmD1';

export default function AdminProfile({ navigation }) {
  const { user, profile: authProfile, signOut } = useAuth();
  const [profile, setProfile] = useState(authProfile || null);

  useEffect(() => {
    let isMounted = true;
    if (authProfile) {
      setProfile(authProfile);
    } else {
      getMyProfile()
        .then((res) => {
          if (isMounted && res?.data) {
            setProfile(res.data);
          }
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [authProfile]);

  const adminName = profile?.full_name || user?.profile?.full_name || 'Dr. Rajesh Sharma';
  const adminEmail = profile?.email || user?.email || 'r.sharma@infotech.edu.in';
  const adminPhone = profile?.phone || '+91 98450 11223';
  const adminRole = profile?.designation || (user?.role === 'ADMIN' ? 'Senior Administrator & Academic Governance' : 'Senior Administrator');
  const adminOffice = profile?.office_location || 'Office of Academic Governance • Suite 101';
  const avatarUrl = profile?.avatar_url || profile?.avatar || user?.profile?.avatar_url || user?.avatar || PROFILE_IMAGE;

  const openEmail = () => {
    Linking.openURL(`mailto:${adminEmail}`);
  };

  const openPhone = () => {
    Linking.openURL(`tel:${adminPhone}`);
  };

  const handleLogout = async () => {
    try {
      if (signOut) await signOut();
    } catch (e) {
      // ignore
    }
    navigation?.navigate('Login');
  };

  const handleEdit = () => {
    navigation?.navigate('AdminEditProfile');
  };

  return (
    <SafeAreaView style={styles.safeArea}>

      <StatusBar
        barStyle="dark-content"
        backgroundColor="#faf8ff"
      />

      <View style={styles.appContainer}>

        {/* ==================================================
            TOP HEADER
        ================================================== */}

        <BlurView
          intensity={85}
          tint="light"
          style={styles.header}
        >

          <View style={styles.headerInner}>

            {/* NEXUS Logo */}
            <View style={[styles.logoSection, { flexDirection: 'row', alignItems: 'center' }]}>

              <TouchableOpacity
                style={{ marginRight: 8, padding: 4 }}
                onPress={() => {
                  if (navigation && navigation.canGoBack()) navigation.goBack();
                  else navigation?.navigate('AdminDashboard');
                }}
                activeOpacity={0.7}
              >
                <MaterialIcons name="arrow-back" size={24} color="#1a56db" />
              </TouchableOpacity>

              <Image
                source={{ uri: NEXUS_LOGO }}
                style={styles.logoImage}
              />

              <View style={styles.logoTextContainer}>

                <Text style={styles.nexusText}>
                  NEXUS
                </Text>

              </View>

            </View>


            {/* Logout / Notification */}
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

            </View>

          </View>

        </BlurView>


        {/* ==================================================
            MAIN CONTENT
        ================================================== */}

        <View style={styles.main}>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >

            {/* ==================================================
                CONTENT HEADER
            ================================================== */}

            <View style={styles.contentHeader}>

              <View>
                <Text style={styles.pageTitle}>
                  Admin Profile
                </Text>
              </View>


              {/* Edit Button */}
              <TouchableOpacity
                style={styles.editButton}
                activeOpacity={0.8}
                onPress={handleEdit}
              >

                <MaterialIcons
                  name="edit"
                  size={18}
                  color="#1a56db"
                />

                <Text style={styles.editText}>
                  Edit
                </Text>

              </TouchableOpacity>

            </View>


            {/* ==================================================
                CONTENT GAP
            ================================================== */}

            <View style={styles.cardsContainer}>


              {/* ==================================================
                  HERO PROFILE CARD
              ================================================== */}

              <View style={styles.heroCard}>

                {/* Royal Blue Banner */}
                <View style={styles.heroBanner}>

                  {/* Decorative Circle */}
                  <View style={styles.bannerCircleOne} />

                  <View style={styles.bannerCircleTwo} />


                  {/* Authorized Text */}
                  <View style={styles.authorizedContainer}>

                    <MaterialIcons
                      name="verified-user"
                      size={16}
                      color="#ffdbcf"
                    />

                    <Text style={styles.authorizedText}>
                      AUTHORIZED SENIOR GOVERNANCE
                    </Text>

                  </View>

                </View>


                {/* Avatar + Identity */}
                <View style={styles.identityContainer}>

                  <View style={styles.avatarTopRow}>

                    {/* Avatar */}
                    <View style={styles.avatarContainer}>

                      <Image
                        source={{ uri: avatarUrl }}
                        style={styles.avatar}
                      />

                      {/* Online indicator */}
                      <View style={styles.onlineIndicator} />

                    </View>


                    {/* Original HTML contains empty badge area */}
                    <View style={styles.emptyBadgeArea} />

                  </View>


                  {/* Identity Details */}
                  <View style={styles.identityDetails}>

                    <Text style={styles.adminName}>
                      {adminName}
                    </Text>

                    <Text style={styles.adminRole}>
                      {adminRole}
                    </Text>


                    {/* Office */}
                    <View style={styles.officeRow}>

                      <MaterialIcons
                        name="domain"
                        size={16}
                        color="#003fb1"
                      />

                      <Text style={styles.officeText}>
                        {adminOffice}
                      </Text>

                    </View>

                  </View>

                </View>

              </View>


              {/* ==================================================
                  GOVERNANCE & DEPARTMENT OVERSIGHT SUMMARY
                  ORIGINAL HTML SECTION EMPTY
              ================================================== */}

              <View />


              {/* ==================================================
                  INSTITUTIONAL CREDENTIALS CARD
              ================================================== */}

              <View style={styles.credentialsCard}>

                {/* Card Header */}
                <View style={styles.credentialsHeader}>

                  <MaterialIcons
                    name="badge"
                    size={20}
                    color="#1a56db"
                  />

                  <Text style={styles.credentialsTitle}>
                    Institutional Credentials
                  </Text>

                </View>


                {/* Credentials Inner Card */}
                <View style={styles.credentialsInner}>


                  {/* ==========================================
                      EMAIL
                  ========================================== */}

                  <TouchableOpacity
                    style={styles.credentialItem}
                    activeOpacity={0.7}
                    onPress={openEmail}
                  >

                    <View style={styles.credentialIcon}>
                      <MaterialIcons
                        name="mail"
                        size={18}
                        color="#003fb1"
                      />
                    </View>

                    <View style={styles.credentialContent}>

                      <Text style={styles.credentialLabel}>
                        Official University Email
                      </Text>

                      <Text style={styles.emailText}>
                        {adminEmail}
                      </Text>

                    </View>

                  </TouchableOpacity>


                  {/* ==========================================
                      PHONE
                  ========================================== */}

                  <TouchableOpacity
                    style={styles.credentialItem}
                    activeOpacity={0.7}
                    onPress={openPhone}
                  >

                    <View style={styles.credentialIcon}>
                      <MaterialIcons
                        name="call"
                        size={18}
                        color="#003fb1"
                      />
                    </View>

                    <View style={styles.credentialContent}>

                      <Text style={styles.credentialLabel}>
                        Direct Telephony / Intercom
                      </Text>

                      <Text style={styles.credentialValue}>
                        {adminPhone}
                      </Text>

                    </View>

                  </TouchableOpacity>


                  {/* ==========================================
                       CHAMBER
                  ========================================== */}

                  <View style={styles.credentialItem}>

                    <View style={styles.credentialIcon}>
                      <MaterialIcons
                        name="corporate-fare"
                        size={18}
                        color="#003fb1"
                      />
                    </View>

                    <View style={styles.credentialContent}>

                      <Text style={styles.credentialLabel}>
                        Executive Chamber
                      </Text>

                      <Text style={styles.credentialValue}>
                        {adminOffice}
                      </Text>

                    </View>

                  </View>


                  {/* ==========================================
                      DESIGNATION
                  ========================================== */}

                  <View style={styles.credentialItem}>

                    <View style={styles.credentialIcon}>
                      <MaterialIcons
                        name="account-balance"
                        size={18}
                        color="#003fb1"
                      />
                    </View>

                    <View style={styles.credentialContent}>

                      <Text style={styles.credentialLabel}>
                        Key Designation
                      </Text>

                      <Text style={styles.credentialValue}>
                        {adminRole}
                      </Text>

                    </View>

                  </View>


                  {/* ==========================================
                      QUALIFICATION
                  ========================================== */}

                  <View style={styles.credentialItem}>

                    <View style={styles.credentialIcon}>
                      <MaterialIcons
                        name="school"
                        size={18}
                        color="#003fb1"
                      />
                    </View>

                    <View style={styles.credentialContent}>

                      <Text style={styles.credentialLabel}>
                        Academic Qualification
                      </Text>

                      <Text style={styles.credentialValue}>
                        Ph.D. in High-Performance Computing (IIT Madras)
                      </Text>

                    </View>

                  </View>


                  {/* ==========================================
                      TENURE
                  ========================================== */}

                  <View style={styles.credentialItem}>

                    <View style={styles.credentialIcon}>
                      <MaterialIcons
                        name="military-tech"
                        size={18}
                        color="#003fb1"
                      />
                    </View>

                    <View style={styles.credentialContent}>

                      <Text style={styles.credentialLabel}>
                        Tenure & Academic Experience
                      </Text>

                      <Text style={styles.credentialValue}>
                        18+ Years in Academic Administration & Leadership
                      </Text>

                    </View>

                  </View>

                </View>

              </View>


              {/* ==================================================
                  ADMINISTRATIVE RESPONSIBILITIES & COMMITTEES
                  ORIGINAL HTML SECTION EMPTY
              ================================================== */}

              <View />


              {/* ==================================================
                  QUICK MANAGEMENT ACTIONS
                  ORIGINAL HTML SECTION EMPTY
              ================================================== */}

              <View />


              {/* Bottom spacing */}
              <View style={styles.bottomContentSpace} />

            </View>

          </ScrollView>

        </View>


        {/* ==================================================
            BOTTOM NAVIGATION
        ================================================== */}
        <BottomNavBar
          items={[
            { key: 'home', label: 'Home', icon: 'dashboard', screen: 'AdminDashboard' },
            { key: 'attendance', label: 'Attendance', icon: 'how-to-reg', screen: 'ReportManagement' },
            { key: 'timetable', label: 'Timetable', icon: 'calendar-month', screen: 'AdminTimetable' },
            { key: 'history', label: 'History', icon: 'history', screen: 'AttendanceHistory' },
            { key: 'profile', label: 'Profile', icon: 'person', screen: 'AdminProfile' },
          ]}
          activeItem="profile"
          navigation={navigation}
        />
      </View>

    </SafeAreaView>
  );
}


/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({

  /* ==========================================================
     ROOT
  ========================================================== */

  safeArea: {
    flex: 1,
    backgroundColor: '#faf8ff',
  },

  appContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 390,
    alignSelf: 'center',
    backgroundColor: '#faf8ff',
    position: 'relative',
  },


  /* ==========================================================
     HEADER
  ========================================================== */

  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,

    height: 64,

    zIndex: 50,

    backgroundColor: 'rgba(250,248,255,0.85)',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },

  headerInner: {
    height: 64,

    paddingHorizontal: 16,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoImage: {
    width: 36,
    height: 36,

    borderRadius: 8,

    backgroundColor: '#ffffff',

    padding: 2,
  },

  logoTextContainer: {
    marginLeft: 8,
  },

  nexusText: {
    fontSize: 20,
    lineHeight: 22,

    fontWeight: '600',

    color: '#1a56db',

    letterSpacing: -0.5,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  notificationButton: {
    width: 44,
    height: 44,

    borderRadius: 22,

    alignItems: 'center',
    justifyContent: 'center',

    position: 'relative',
  },

  notificationDot: {
    position: 'absolute',

    top: 10,
    right: 10,

    width: 8,
    height: 8,

    borderRadius: 4,

    backgroundColor: '#ba1a1a',

    borderWidth: 2,
    borderColor: '#faf8ff',
  },


  /* ==========================================================
     MAIN
  ========================================================== */

  main: {
    flex: 1,

    backgroundColor: '#faf8ff',

    paddingTop: 64,
    paddingBottom: 64,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 20,
  },


  /* ==========================================================
     CONTENT HEADER
  ========================================================== */

  contentHeader: {
    minHeight: 69,

    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,

    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'space-between',
  },

  pageTitle: {
    fontSize: 24,
    lineHeight: 32,

    fontWeight: '600',

    color: '#191b23',

    letterSpacing: -0.25,
  },

  editButton: {
    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'center',

    gap: 6,

    paddingHorizontal: 14,
    paddingVertical: 8,

    borderRadius: 12,

    backgroundColor: '#f3f3fe',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },

  editText: {
    fontSize: 14,
    lineHeight: 20,

    fontWeight: '500',

    color: '#1a56db',
  },


  /* ==========================================================
     CARDS CONTAINER
  ========================================================== */

  cardsContainer: {
    width: '100%',

    paddingHorizontal: 16,

    gap: 16,
  },


  /* ==========================================================
     HERO CARD
  ========================================================== */

  heroCard: {
    width: '100%',

    backgroundColor: '#ffffff',

    borderRadius: 16,

    overflow: 'hidden',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  heroBanner: {
    width: '100%',

    height: 112,

    backgroundColor: '#003fb1',

    position: 'relative',

    justifyContent: 'flex-end',

    paddingHorizontal: 20,
    paddingBottom: 12,
  },

  bannerCircleOne: {
    position: 'absolute',

    width: 128,
    height: 128,

    borderRadius: 64,

    right: -24,
    top: -40,

    backgroundColor: 'rgba(255,255,255,0.10)',
  },

  bannerCircleTwo: {
    position: 'absolute',

    width: 64,
    height: 64,

    borderRadius: 32,

    right: 48,
    bottom: 4,

    backgroundColor: 'rgba(219,225,255,0.20)',
  },

  authorizedContainer: {
    flexDirection: 'row',

    alignItems: 'center',

    gap: 8,
  },

  authorizedText: {
    color: 'rgba(255,255,255,0.80)',

    fontSize: 11,

    lineHeight: 16,

    fontWeight: '600',

    letterSpacing: 0.7,
  },


  /* ==========================================================
     IDENTITY
  ========================================================== */

  identityContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,

    position: 'relative',
  },

  avatarTopRow: {
    height: 64,

    flexDirection: 'row',

    alignItems: 'flex-end',
    justifyContent: 'space-between',

    marginTop: -48,

    marginBottom: 12,
  },

  avatarContainer: {
    width: 96,
    height: 96,

    position: 'relative',
  },

  avatar: {
    width: 96,
    height: 96,

    borderRadius: 48,

    backgroundColor: '#ededf8',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },

  onlineIndicator: {
    position: 'absolute',

    width: 16,
    height: 16,

    borderRadius: 8,

    right: 4,
    bottom: 4,

    backgroundColor: '#10b981',

    borderWidth: 3,
    borderColor: '#ffffff',
  },

  emptyBadgeArea: {
    width: '55%',
  },

  identityDetails: {
    flexDirection: 'column',
  },

  adminName: {
    fontSize: 24,
    lineHeight: 32,

    fontWeight: '600',

    color: '#191b23',

    letterSpacing: -0.25,
  },

  adminRole: {
    marginTop: 2,

    fontSize: 14,
    lineHeight: 20,

    fontWeight: '500',

    color: '#434654',
  },

  officeRow: {
    flexDirection: 'row',

    alignItems: 'center',

    gap: 8,

    marginTop: 8,
  },

  officeText: {
    flex: 1,

    fontSize: 12,
    lineHeight: 16,

    fontWeight: '600',

    color: '#003fb1',
  },


  /* ==========================================================
     INSTITUTIONAL CREDENTIALS
  ========================================================== */

  credentialsCard: {
    width: '100%',

    backgroundColor: '#f3f3fe',

    borderRadius: 16,

    padding: 16,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },

  credentialsHeader: {
    flexDirection: 'row',

    alignItems: 'center',

    gap: 8,

    marginBottom: 14,
  },

  credentialsTitle: {
    fontSize: 20,
    lineHeight: 28,

    fontWeight: '600',

    color: '#191b23',

    flexShrink: 1,
  },

  credentialsInner: {
    width: '100%',

    backgroundColor: '#ffffff',

    borderRadius: 12,

    padding: 14,

    gap: 12,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },


  /* ==========================================================
     CREDENTIAL ITEMS
  ========================================================== */

  credentialItem: {
    width: '100%',

    flexDirection: 'row',

    alignItems: 'flex-start',

    gap: 12,
  },

  credentialIcon: {
    width: 32,
    height: 32,

    borderRadius: 8,

    backgroundColor: '#ededf8',

    alignItems: 'center',
    justifyContent: 'center',

    flexShrink: 0,
  },

  credentialContent: {
    flex: 1,

    minWidth: 0,
  },

  credentialLabel: {
    fontSize: 12,
    lineHeight: 16,

    fontWeight: '600',

    color: '#434654',

    marginBottom: 2,
  },

  credentialValue: {
    fontSize: 14,
    lineHeight: 20,

    fontWeight: '500',

    color: '#191b23',
  },

  emailText: {
    fontSize: 14,
    lineHeight: 20,

    fontWeight: '500',

    color: '#1a56db',
  },


  /* ==========================================================
     BOTTOM CONTENT SPACE
  ========================================================== */

  bottomContentSpace: {
    height: 30,
  },


  /* ==========================================================
     BOTTOM NAVIGATION
  ========================================================== */

  bottomNavigation: {
    position: 'absolute',

    left: 0,
    right: 0,
    bottom: 0,

    height: 64,

    zIndex: 50,

    backgroundColor: 'rgba(250,248,255,0.90)',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 8,
  },

  bottomNavInner: {
    height: 64,

    paddingHorizontal: 8,

    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'space-around',
  },

  navItem: {
    width: 64,
    height: 48,

    alignItems: 'center',
    justifyContent: 'center',

    gap: 2,
  },

  navText: {
    fontSize: 12,
    lineHeight: 16,

    fontWeight: '500',

    color: '#434654',
  },

  activeNavText: {
    fontSize: 12,
    lineHeight: 16,

    fontWeight: '600',

    color: '#1a56db',
  },

});
