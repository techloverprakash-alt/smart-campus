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
} from '@/ui';
import { MaterialIcons } from '@/ui';
import { useAuth } from '../../auth/context/AuthContext';
import { getMyProfile } from '../../../services/api/profiles';

const PROFILE_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCVXP3laCjvBlZEVugtzpX20kCifG87-9yGGVWnUCmaIhNtCcDdG9HmCKcyaSa4oTc-QPnHNb5RR_pO0Xd8oVLNtxyVdxbttBW5KjbrzMiMJD0HcqApHxFuVbC5_KEUHnW0qOr98kurfIJ2NAVvw464MLzvDAN8LdJTSZXSqkbDkysN8V9Lzled9wZvQVwVorYcKfLMT1do8whwEUyopOcVpVMNt3wTCpl8mQ00dAziqalPOmZQTqcZ';

export default function StaffProfile({ navigation }) {
  const { user, profile: authProfile, signOut } = useAuth();
  const [profile, setProfile] = useState(authProfile || null);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const toastOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isMounted = true;
    if (authProfile) {
      setProfile(authProfile);
    } else {
      getMyProfile()
        .then((res) => {
          if (isMounted && res) {
            const data = res.data || res;
            setProfile(data);
          }
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [authProfile]);

  const triggerToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setToastVisible(false);
      });
    }, 2400);
  };

  const handleLogout = async () => {
    if (signOut) await signOut();
    navigation?.navigate('Login');
  };

  const facultyName = profile?.full_name || profile?.name || user?.profile?.full_name || user?.name || 'Prof. M. Selvam';
  const facultyId = profile?.faculty_id || user?.identifier || 'FAC-AIDS-018';
  const departmentName = profile?.department?.name || profile?.department || 'Department of AI & DS';
  const designation = profile?.designation || 'Assistant Professor (Sr. Gr.)';
  const emailText = profile?.email || user?.email || 'selvam.m@infotech.edu.in';
  const phoneText = profile?.phone || '+91 94432 10987';
  const cabinText = profile?.cabin_number || 'Room 208, Computing Block, 2nd Floor';
  const experienceText = profile?.experience || '9+ Years Academic, Research & Industry';
  const qualificationText = profile?.qualifications || 'M.Tech., Ph.D. in Computer Science & Deep Learning';
  const officeHoursText = 'Mon & Wed: 02:00 PM – 04:00 PM • Open Door';
  const avatarUri = profile?.avatar_url || profile?.avatar || user?.profile?.avatar_url || user?.avatar || PROFILE_IMAGE;

  const openEmail = () => {
    Linking.openURL(`mailto:${emailText}`);
  };

  const openPhone = () => {
    Linking.openURL(`tel:${phoneText}`);
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
                onPress={() => {
                  if (navigation && navigation.canGoBack()) navigation.goBack();
                  else navigation?.navigate('StaffDashboard');
                }}
                activeOpacity={0.7}
              >
                <MaterialIcons name="arrow-back" size={18} color="#003fb1" />
                <Text style={styles.backBtnText}>Dashboard</Text>
              </TouchableOpacity>
              <Text style={styles.breadcrumbDivider}>/</Text>
              <Text style={styles.breadcrumbCurrent}>Faculty Profile & Academic Portfolio</Text>
              <Text style={styles.breadcrumbTag}>{facultyId}</Text>
            </View>

            <View style={styles.topActionGroup}>
              <TouchableOpacity
                style={styles.actionBtnSecondary}
                onPress={() => navigation?.navigate('StaffTimetable')}
                activeOpacity={0.8}
              >
                <MaterialIcons name="calendar-month" size={18} color="#003fb1" />
                <Text style={styles.actionBtnSecondaryText}>View Timetable</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtnPrimary}
                onPress={() => navigation?.navigate('StaffEditProfile')}
                activeOpacity={0.8}
              >
                <MaterialIcons name="edit" size={18} color="#ffffff" />
                <Text style={styles.actionBtnPrimaryText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Hero Faculty Executive Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroBannerBackground}>
              <View style={styles.bannerCircleOne} />
              <View style={styles.bannerCircleTwo} />
            </View>

            <View style={styles.heroBody}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={{ uri: avatarUri }}
                  style={styles.avatarImage}
                  onError={(e) => {
                    if (e?.target) e.target.src = '/info_logo.png';
                  }}
                />
                <View style={styles.avatarStatusBadge} title="Active Faculty">
                  <View style={styles.avatarPulseDot} />
                </View>
              </View>

              <View style={styles.heroMeta}>
                <View style={styles.heroBadgeRow}>
                  <View style={styles.facultyIdBadge}>
                    <MaterialIcons name="badge" size={13} color="#ffffff" />
                    <Text style={styles.facultyIdText}>{facultyId}</Text>
                  </View>
                  <View style={styles.deptBadge}>
                    <Text style={styles.deptBadgeText}>{departmentName}</Text>
                  </View>
                  <View style={styles.advisorBadge}>
                    <MaterialIcons name="stars" size={13} color="#fef08a" />
                    <Text style={styles.advisorBadgeText}>Class Advisor • III Year AI & DS (Sec A)</Text>
                  </View>
                </View>

                <Text style={styles.heroName}>{facultyName}</Text>
                <Text style={styles.heroDesignation}>
                  {designation} • Specialization in Deep Learning & Autonomous Systems
                </Text>
              </View>

              <View style={styles.heroActionArea}>
                <TouchableOpacity
                  style={styles.heroLogoutBtn}
                  onPress={handleLogout}
                  activeOpacity={0.8}
                  title="Sign out of faculty session"
                >
                  <MaterialIcons name="logout" size={16} color="#ef4444" />
                  <Text style={styles.heroLogoutText}>Sign Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* 2-Column Responsive Laptop Grid */}
          <View style={styles.laptopGrid}>
            {/* Left Column: Communications, Credentials, Verification */}
            <View style={styles.leftCol}>
              {/* Card 1: Official Communications & Office */}
              <View style={styles.sectionCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderIconWrap}>
                    <MaterialIcons name="contact-mail" size={18} color="#003fb1" />
                  </View>
                  <Text style={styles.cardHeaderTitle}>Official Communication</Text>
                </View>

                <View style={styles.contactList}>
                  {/* Official Email */}
                  <TouchableOpacity
                    style={styles.contactItem}
                    onPress={openEmail}
                    activeOpacity={0.7}
                  >
                    <View style={styles.contactIconCircle}>
                      <MaterialIcons name="email" size={18} color="#003fb1" />
                    </View>
                    <View style={styles.contactDetails}>
                      <Text style={styles.contactLabel}>Official Institutional Email</Text>
                      <Text style={styles.contactValue}>{emailText}</Text>
                    </View>
                    <MaterialIcons name="open-in-new" size={16} color="#94a3b8" />
                  </TouchableOpacity>

                  {/* Mobile & Intercom */}
                  <TouchableOpacity
                    style={styles.contactItem}
                    onPress={openPhone}
                    activeOpacity={0.7}
                  >
                    <View style={styles.contactIconCircle}>
                      <MaterialIcons name="phone" size={18} color="#003fb1" />
                    </View>
                    <View style={styles.contactDetails}>
                      <Text style={styles.contactLabel}>Mobile & Desk Extension</Text>
                      <Text style={styles.contactValue}>{phoneText}</Text>
                    </View>
                    <MaterialIcons name="call" size={16} color="#94a3b8" />
                  </TouchableOpacity>

                  {/* Cabin Location */}
                  <View style={styles.contactItem}>
                    <View style={styles.contactIconCircle}>
                      <MaterialIcons name="business" size={18} color="#003fb1" />
                    </View>
                    <View style={styles.contactDetails}>
                      <Text style={styles.contactLabel}>Cabin & Office Suite</Text>
                      <Text style={styles.contactValue}>{cabinText}</Text>
                    </View>
                  </View>

                  {/* Consulting Office Hours */}
                  <View style={styles.contactItem}>
                    <View style={styles.contactIconCircle}>
                      <MaterialIcons name="schedule" size={18} color="#003fb1" />
                    </View>
                    <View style={styles.contactDetails}>
                      <Text style={styles.contactLabel}>Student Consulting Hours</Text>
                      <Text style={styles.contactValue}>{officeHoursText}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Card 2: Academic Credentials & Specialization */}
              <View style={styles.sectionCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderIconWrap}>
                    <MaterialIcons name="school" size={18} color="#003fb1" />
                  </View>
                  <Text style={styles.cardHeaderTitle}>Academic Credentials</Text>
                </View>

                <View style={styles.credentialList}>
                  <View style={styles.credentialBlock}>
                    <Text style={styles.credentialHeading}>Highest Degree</Text>
                    <Text style={styles.credentialBody}>{qualificationText}</Text>
                  </View>

                  <View style={styles.credentialBlock}>
                    <Text style={styles.credentialHeading}>Academic & Industry Experience</Text>
                    <Text style={styles.credentialBody}>{experienceText}</Text>
                  </View>

                  <View style={styles.credentialBlock}>
                    <Text style={styles.credentialHeading}>Research Domains & Specializations</Text>
                    <View style={styles.skillPillRow}>
                      <View style={styles.skillPill}>
                        <Text style={styles.skillPillText}>Deep Learning</Text>
                      </View>
                      <View style={styles.skillPill}>
                        <Text style={styles.skillPillText}>DBMS & Big Data</Text>
                      </View>
                      <View style={styles.skillPill}>
                        <Text style={styles.skillPillText}>Autonomous Vision</Text>
                      </View>
                      <View style={styles.skillPill}>
                        <Text style={styles.skillPillText}>Neural Architectures</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Card 3: Faculty Identity & Governance */}
              <View style={styles.sectionCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderIconWrap}>
                    <MaterialIcons name="verified-user" size={18} color="#003fb1" />
                  </View>
                  <Text style={styles.cardHeaderTitle}>Institutional Verification</Text>
                </View>

                <View style={styles.verifyStrip}>
                  <View style={styles.verifyRow}>
                    <Text style={styles.verifyLabel}>Biometric Access Tag</Text>
                    <Text style={styles.verifyVal}>BIO-AIDS-9021</Text>
                  </View>
                  <View style={styles.verifyRow}>
                    <Text style={styles.verifyLabel}>Institutional Role</Text>
                    <Text style={styles.verifyVal}>Academic Staff (Grade 1)</Text>
                  </View>
                  <View style={styles.verifyRow}>
                    <Text style={styles.verifyLabel}>Academic Year</Text>
                    <Text style={styles.verifyVal}>2026–2027 (Odd & Even Semesters)</Text>
                  </View>
                  <View style={styles.verifyRow}>
                    <Text style={styles.verifyLabel}>Profile Verification</Text>
                    <View style={styles.statusPillActive}>
                      <MaterialIcons name="check-circle" size={13} color="#166534" />
                      <Text style={styles.statusPillActiveText}>Active & Verified</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Right Column: Workload KPIs, Current Teaching, Portfolios, Quick Launch */}
            <View style={styles.rightCol}>
              {/* Card 1: 4-Tile Workload KPI Strip */}
              <View style={styles.kpiGrid}>
                <View style={styles.kpiTile}>
                  <View style={styles.kpiTileTop}>
                    <Text style={styles.kpiValue}>22</Text>
                    <View style={[styles.kpiIconWrap, { backgroundColor: '#dbeafe' }]}>
                      <MaterialIcons name="groups" size={20} color="#003fb1" />
                    </View>
                  </View>
                  <Text style={styles.kpiLabel}>Assigned Mentees</Text>
                  <Text style={styles.kpiSub}>Proctor Wards • Capacity: 25</Text>
                </View>

                <View style={styles.kpiTile}>
                  <View style={styles.kpiTileTop}>
                    <Text style={styles.kpiValue}>3</Text>
                    <View style={[styles.kpiIconWrap, { backgroundColor: '#e0e7ff' }]}>
                      <MaterialIcons name="library-books" size={20} color="#4338ca" />
                    </View>
                  </View>
                  <Text style={styles.kpiLabel}>Subjects Taken</Text>
                  <Text style={styles.kpiSub}>2 Theory + 1 Lab Course</Text>
                </View>

                <View style={styles.kpiTile}>
                  <View style={styles.kpiTileTop}>
                    <Text style={styles.kpiValue}>18</Text>
                    <View style={[styles.kpiIconWrap, { backgroundColor: '#fef3c7' }]}>
                      <MaterialIcons name="schedule" size={20} color="#92400e" />
                    </View>
                  </View>
                  <Text style={styles.kpiLabel}>Teaching Hours / Wk</Text>
                  <Text style={styles.kpiSub}>Lecture & Lab Periods</Text>
                </View>

                <View style={styles.kpiTile}>
                  <View style={styles.kpiTileTop}>
                    <Text style={styles.kpiValue}>98.4%</Text>
                    <View style={[styles.kpiIconWrap, { backgroundColor: '#dcfce7' }]}>
                      <MaterialIcons name="task-alt" size={20} color="#166534" />
                    </View>
                  </View>
                  <Text style={styles.kpiLabel}>Attendance Compliance</Text>
                  <Text style={styles.kpiSub}>Timely Session Submissions</Text>
                </View>
              </View>

              {/* Card 2: Current Teaching Allocations & Course Offerings */}
              <View style={styles.sectionCard}>
                <View style={styles.cardHeaderWithAction}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={styles.cardHeaderIconWrap}>
                      <MaterialIcons name="assignment" size={18} color="#003fb1" />
                    </View>
                    <View>
                      <Text style={styles.cardHeaderTitle}>Current Teaching Allocations</Text>
                      <Text style={styles.cardHeaderSub}>Active semester lecture courses & laboratory sessions</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.cardHeaderBtn}
                    onPress={() => navigation?.navigate('StaffTimetable')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cardHeaderBtnText}>Full Timetable</Text>
                    <MaterialIcons name="arrow-forward" size={14} color="#003fb1" />
                  </TouchableOpacity>
                </View>

                <View style={styles.courseList}>
                  {/* Subject 1 */}
                  <View style={styles.courseItem}>
                    <View style={styles.courseItemHeader}>
                      <View style={styles.courseCodeBadge}>
                        <Text style={styles.courseCodeText}>CS3352</Text>
                      </View>
                      <Text style={styles.courseTitle}>Database Management Systems</Text>
                      <View style={styles.theoryPill}>
                        <Text style={styles.theoryPillText}>Core Theory</Text>
                      </View>
                    </View>
                    <View style={styles.courseItemMeta}>
                      <View style={styles.metaItem}>
                        <MaterialIcons name="groups" size={13} color="#64748b" />
                        <Text style={styles.metaText}>III Year AI & DS • Section A</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <MaterialIcons name="room" size={13} color="#64748b" />
                        <Text style={styles.metaText}>Central Block LH-204</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <MaterialIcons name="schedule" size={13} color="#64748b" />
                        <Text style={styles.metaText}>4 Hours / Week • 3 Credits</Text>
                      </View>
                    </View>
                  </View>

                  {/* Subject 2 */}
                  <View style={styles.courseItem}>
                    <View style={styles.courseItemHeader}>
                      <View style={styles.courseCodeBadge}>
                        <Text style={styles.courseCodeText}>CS3361</Text>
                      </View>
                      <Text style={styles.courseTitle}>Database Management Systems Laboratory</Text>
                      <View style={styles.labPill}>
                        <Text style={styles.labPillText}>Practical Lab</Text>
                      </View>
                    </View>
                    <View style={styles.courseItemMeta}>
                      <View style={styles.metaItem}>
                        <MaterialIcons name="groups" size={13} color="#64748b" />
                        <Text style={styles.metaText}>III Year AI & DS • Batch 1 & 2</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <MaterialIcons name="computer" size={13} color="#64748b" />
                        <Text style={styles.metaText}>Computing Center 1 (CC-1)</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <MaterialIcons name="schedule" size={13} color="#64748b" />
                        <Text style={styles.metaText}>3 Hours / Week • 2 Credits</Text>
                      </View>
                    </View>
                  </View>

                  {/* Subject 3 */}
                  <View style={styles.courseItem}>
                    <View style={styles.courseItemHeader}>
                      <View style={styles.courseCodeBadge}>
                        <Text style={styles.courseCodeText}>AD3501</Text>
                      </View>
                      <Text style={styles.courseTitle}>Deep Learning Architectures</Text>
                      <View style={styles.theoryPill}>
                        <Text style={styles.theoryPillText}>Core Theory</Text>
                      </View>
                    </View>
                    <View style={styles.courseItemMeta}>
                      <View style={styles.metaItem}>
                        <MaterialIcons name="groups" size={13} color="#64748b" />
                        <Text style={styles.metaText}>III Year AI & DS • Section A</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <MaterialIcons name="room" size={13} color="#64748b" />
                        <Text style={styles.metaText}>Turing Hall (LH-302)</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <MaterialIcons name="schedule" size={13} color="#64748b" />
                        <Text style={styles.metaText}>4 Hours / Week • 4 Credits</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Card 3: Institutional & Mentorship Portfolios */}
              <View style={styles.sectionCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderIconWrap}>
                    <MaterialIcons name="corporate-fare" size={18} color="#003fb1" />
                  </View>
                  <Text style={styles.cardHeaderTitle}>Institutional & Mentorship Portfolios</Text>
                </View>

                <View style={styles.portfolioGrid}>
                  <View style={styles.portfolioCard}>
                    <View style={styles.portfolioTop}>
                      <MaterialIcons name="supervised-user-circle" size={20} color="#003fb1" />
                      <Text style={styles.portfolioRole}>Class Advisor</Text>
                    </View>
                    <Text style={styles.portfolioTitle}>III Year AI & DS • Section A</Text>
                    <Text style={styles.portfolioDesc}>
                      Supervising 54 students on attendance compliance, leave requisitions, and academic progress.
                    </Text>
                  </View>

                  <View style={styles.portfolioCard}>
                    <View style={styles.portfolioTop}>
                      <MaterialIcons name="psychology" size={20} color="#166534" />
                      <Text style={styles.portfolioRole}>Faculty Proctor</Text>
                    </View>
                    <Text style={styles.portfolioTitle}>Proctorial Mentee Circle (22 Wards)</Text>
                    <Text style={styles.portfolioDesc}>
                      Personal academic mentor guiding student semester GPA, attendance, and campus internships.
                    </Text>
                  </View>

                  <View style={styles.portfolioCard}>
                    <View style={styles.portfolioTop}>
                      <MaterialIcons name="policy" size={20} color="#4338ca" />
                      <Text style={styles.portfolioRole}>Committee Member</Text>
                    </View>
                    <Text style={styles.portfolioTitle}>NBA & NAAC Accreditation Team</Text>
                    <Text style={styles.portfolioDesc}>
                      Department Criteria 3 (Teaching & Learning Processes) and Course Outcomes portfolio custodian.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Card 4: Faculty Quick Launch Console */}
              <View style={styles.sectionCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderIconWrap}>
                    <MaterialIcons name="bolt" size={18} color="#003fb1" />
                  </View>
                  <Text style={styles.cardHeaderTitle}>Faculty Quick Launch Console</Text>
                </View>

                <View style={styles.quickLaunchGrid}>
                  <TouchableOpacity
                    style={styles.quickLaunchTile}
                    onPress={() => navigation?.navigate('MarkAttendance')}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.quickLaunchIcon, { backgroundColor: '#eff6ff' }]}>
                      <MaterialIcons name="how-to-reg" size={22} color="#003fb1" />
                    </View>
                    <Text style={styles.quickLaunchTitle}>Mark Attendance</Text>
                    <Text style={styles.quickLaunchSub}>Live period roster marking</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickLaunchTile}
                    onPress={() => navigation?.navigate('StaffNotes')}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.quickLaunchIcon, { backgroundColor: '#f0fdf4' }]}>
                      <MaterialIcons name="menu-book" size={22} color="#166534" />
                    </View>
                    <Text style={styles.quickLaunchTitle}>Notes & QP Bank</Text>
                    <Text style={styles.quickLaunchSub}>Upload syllabus materials</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickLaunchTile}
                    onPress={() => navigation?.navigate('AttendanceReview')}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.quickLaunchIcon, { backgroundColor: '#fef3c7' }]}>
                      <MaterialIcons name="fact-check" size={22} color="#92400e" />
                    </View>
                    <Text style={styles.quickLaunchTitle}>Attendance Review</Text>
                    <Text style={styles.quickLaunchSub}>Audit submitted records</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickLaunchTile}
                    onPress={() => navigation?.navigate('StaffTimetable')}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.quickLaunchIcon, { backgroundColor: '#f5f3ff' }]}>
                      <MaterialIcons name="calendar-view-week" size={22} color="#7c3aed" />
                    </View>
                    <Text style={styles.quickLaunchTitle}>Timetable Matrix</Text>
                    <Text style={styles.quickLaunchSub}>Weekly teaching grid</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Toast Notification */}
      {toastVisible && (
        <Animated.View style={[styles.toastContainer, { opacity: toastOpacity }]}>
          <MaterialIcons name="check-circle" size={18} color="#22c55e" />
          <Text style={styles.toastMessage}>{toastMessage}</Text>
        </Animated.View>
      )}
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
    maxWidth: 1200,
    gap: 20,
  },

  /* Top Toolbar & Breadcrumb */
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
    color: '#003fb1',
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

  /* Hero Faculty Executive Card */
  heroCard: {
    backgroundColor: '#003fb1',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#003fb1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 4,
  },
  heroBannerBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  bannerCircleOne: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    top: -120,
    right: -40,
  },
  bannerCircleTwo: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    bottom: -60,
    left: 120,
  },
  heroBody: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    gap: 24,
    flexWrap: 'wrap',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#ffffff',
    backgroundColor: '#ffffff',
  },
  avatarStatusBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  avatarPulseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
  },
  heroMeta: {
    flex: 1,
    minWidth: 260,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  facultyIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  facultyIdText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  deptBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  deptBadgeText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#ffffff',
  },
  advisorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(254, 240, 138, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(254, 240, 138, 0.4)',
  },
  advisorBadgeText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#fef08a',
  },
  heroName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  heroDesignation: {
    fontSize: 13.5,
    color: 'rgba(255, 255, 255, 0.88)',
    marginTop: 4,
    lineHeight: 20,
  },
  heroActionArea: {
    alignSelf: 'center',
  },
  heroLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  heroLogoutText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#dc2626',
  },

  /* 2-Column Laptop Grid */
  laptopGrid: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  leftCol: {
    width: 360,
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
  cardHeaderWithAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
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
  cardHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  cardHeaderBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#003fb1',
  },

  /* Contacts List */
  contactList: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  contactIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactDetails: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  contactValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 2,
  },

  /* Credentials */
  credentialList: {
    gap: 14,
  },
  credentialBlock: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  credentialHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  credentialBody: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: 18,
  },
  skillPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  skillPill: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  skillPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#334155',
  },

  /* Verification */
  verifyStrip: {
    gap: 10,
  },
  verifyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  verifyLabel: {
    fontSize: 12.5,
    color: '#64748b',
  },
  verifyVal: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0f172a',
  },
  statusPillActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillActiveText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#166534',
  },

  /* KPI Grid (4 Tiles) */
  kpiGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  kpiTile: {
    flex: 1,
    minWidth: 170,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  kpiTileTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
  },
  kpiIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 8,
  },
  kpiSub: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 2,
  },

  /* Course Offerings List */
  courseList: {
    gap: 10,
  },
  courseItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
  },
  courseItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  courseCodeBadge: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  courseCodeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  courseTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
  },
  theoryPill: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  theoryPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#003fb1',
  },
  labPill: {
    backgroundColor: '#f5f3ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  labPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7c3aed',
  },
  courseItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#64748b',
  },

  /* Portfolio Grid */
  portfolioGrid: {
    gap: 10,
  },
  portfolioCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
  },
  portfolioTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  portfolioRole: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
  },
  portfolioTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  portfolioDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 3,
    lineHeight: 17,
  },

  /* Quick Launch Grid */
  quickLaunchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickLaunchTile: {
    flex: 1,
    minWidth: 180,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    alignItems: 'center',
    textAlign: 'center',
  },
  quickLaunchIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickLaunchTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
  },
  quickLaunchSub: {
    fontSize: 11.5,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 2,
  },

  /* Toast Notification */
  toastContainer: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 9999,
  },
  toastMessage: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
});
