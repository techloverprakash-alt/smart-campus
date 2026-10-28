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
import { MaterialIcons } from '@/ui';
import { useAuth } from '../../auth/context/AuthContext';
import { getMyProfile } from '../../../services/api/profiles';

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

  const adminName = profile?.full_name || profile?.name || user?.profile?.full_name || user?.name || 'Dr. K. Arulmozhi';
  const adminEmail = profile?.email || user?.email || 'dean.academic@infotech.edu.in';
  const adminPhone = profile?.phone || user?.phone || '+91 98422 55667';
  const adminRole = profile?.designation || (user?.role === 'ADMIN' ? 'Academic Dean & Controller of Examinations' : 'Senior Administrator');
  const adminOffice = profile?.office_location || 'Office of Academic Governance • Suite 101, Executive Wing';
  const avatarUrl = profile?.avatar_url || profile?.avatar || user?.profile?.avatar_url || user?.avatar || PROFILE_IMAGE;

  const openEmail = () => {
    Linking.openURL(`mailto:${adminEmail}`);
  };

  const openPhone = () => {
    Linking.openURL(`tel:${adminPhone}`);
  };

  const handleEdit = () => {
    navigation?.navigate('AdminEditProfile');
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
                  else navigation?.navigate('AdminDashboard');
                }}
                activeOpacity={0.7}
              >
                <MaterialIcons name="arrow-back" size={18} color="#003fb1" />
                <Text style={styles.backBtnText}>Dashboard</Text>
              </TouchableOpacity>
              <Text style={styles.breadcrumbDivider}>/</Text>
              <Text style={styles.breadcrumbCurrent}>Institutional Profile & Governance</Text>
            </View>

            <View style={styles.topActionGroup}>
              <TouchableOpacity
                style={styles.actionBtnSecondary}
                onPress={() => navigation?.navigate('ReportManagement')}
                activeOpacity={0.8}
              >
                <MaterialIcons name="assessment" size={18} color="#003fb1" />
                <Text style={styles.actionBtnSecondaryText}>Reports Console</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtnPrimary}
                onPress={handleEdit}
                activeOpacity={0.8}
              >
                <MaterialIcons name="edit" size={18} color="#ffffff" />
                <Text style={styles.actionBtnPrimaryText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Hero Executive Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroBannerBackground}>
              <View style={styles.bannerCircleOne} />
              <View style={styles.bannerCircleTwo} />
            </View>
            <View style={styles.heroBody}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.avatarImage}
                  onError={(e) => {
                    if (e?.target) e.target.src = '/info_logo.png';
                  }}
                />
                <View style={styles.onlineBadge} />
              </View>

              <View style={styles.heroIdentity}>
                <View style={styles.authBadgeRow}>
                  <View style={styles.authBadge}>
                    <MaterialIcons name="verified-user" size={14} color="#ffffff" />
                    <Text style={styles.authBadgeText}>AUTHORIZED SENIOR GOVERNANCE</Text>
                  </View>
                  <View style={[styles.authBadge, { backgroundColor: 'rgba(34, 197, 94, 0.25)', borderColor: 'rgba(34, 197, 94, 0.5)' }]}>
                    <MaterialIcons name="security" size={14} color="#bbf7d0" />
                    <Text style={[styles.authBadgeText, { color: '#ffffff' }]}>TIER-1 MASTER CLEARANCE</Text>
                  </View>
                </View>

                <Text style={styles.heroName}>{adminName}</Text>
                <Text style={styles.heroRole}>{adminRole}</Text>

                <View style={styles.heroMetaRow}>
                  <View style={styles.metaItem}>
                    <MaterialIcons name="business" size={16} color="#dbeafe" />
                    <Text style={styles.metaItemText}>Academic Administration & Institutional Senate</Text>
                  </View>
                  <View style={styles.metaDivider} />
                  <View style={styles.metaItem}>
                    <MaterialIcons name="location-on" size={16} color="#dbeafe" />
                    <Text style={styles.metaItemText}>{adminOffice}</Text>
                  </View>
                  <View style={styles.metaDivider} />
                  <View style={styles.metaItem}>
                    <MaterialIcons name="workspace-premium" size={16} color="#dbeafe" />
                    <Text style={styles.metaItemText}>18+ Years Leadership</Text>
                  </View>
                </View>
              </View>

              <View style={styles.heroActions}>
                <TouchableOpacity
                  style={styles.heroEditBtn}
                  onPress={handleEdit}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="edit" size={16} color="#003fb1" />
                  <Text style={styles.heroEditBtnText}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.heroContactBtn}
                  onPress={openEmail}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="mail-outline" size={16} color="#ffffff" />
                  <Text style={styles.heroContactBtnText}>Direct Email</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Two-Column Laptop Layout */}
          <View style={styles.laptopGrid}>
            {/* Left Column: Official Communications & Security Profile */}
            <View style={styles.leftCol}>
              {/* Official Communication Channels Card */}
              <View style={styles.panelCard}>
                <View style={styles.panelHeader}>
                  <View style={styles.panelHeaderLeft}>
                    <MaterialIcons name="contact-phone" size={20} color="#003fb1" />
                    <Text style={styles.panelTitle}>Official Communication</Text>
                  </View>
                  <Text style={styles.panelBadge}>DIRECT</Text>
                </View>

                <View style={styles.commItemList}>
                  <View style={styles.commItem}>
                    <View style={styles.commIconWrap}>
                      <MaterialIcons name="mail" size={18} color="#003fb1" />
                    </View>
                    <View style={styles.commContent}>
                      <Text style={styles.commLabel}>Official University Email</Text>
                      <Text style={styles.commValue}>{adminEmail}</Text>
                    </View>
                    <TouchableOpacity style={styles.commActionPill} onPress={openEmail}>
                      <MaterialIcons name="send" size={13} color="#003fb1" />
                      <Text style={styles.commActionPillText}>Send</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.commItem}>
                    <View style={styles.commIconWrap}>
                      <MaterialIcons name="phone" size={18} color="#003fb1" />
                    </View>
                    <View style={styles.commContent}>
                      <Text style={styles.commLabel}>Direct Line / Telephony</Text>
                      <Text style={styles.commValue}>{adminPhone}</Text>
                    </View>
                    <TouchableOpacity style={styles.commActionPill} onPress={openPhone}>
                      <MaterialIcons name="call" size={13} color="#003fb1" />
                      <Text style={styles.commActionPillText}>Call</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.commItem}>
                    <View style={styles.commIconWrap}>
                      <MaterialIcons name="corporate-fare" size={18} color="#003fb1" />
                    </View>
                    <View style={styles.commContent}>
                      <Text style={styles.commLabel}>Executive Chamber</Text>
                      <Text style={styles.commValue}>{adminOffice}</Text>
                    </View>
                  </View>

                  <View style={styles.commItem}>
                    <View style={styles.commIconWrap}>
                      <MaterialIcons name="schedule" size={18} color="#003fb1" />
                    </View>
                    <View style={styles.commContent}>
                      <Text style={styles.commLabel}>Consultation & Senate Hours</Text>
                      <Text style={styles.commValue}>Mon – Fri • 09:30 AM – 04:30 PM</Text>
                    </View>
                  </View>

                  <View style={styles.commItem}>
                    <View style={styles.commIconWrap}>
                      <MaterialIcons name="dialer-sip" size={18} color="#003fb1" />
                    </View>
                    <View style={styles.commContent}>
                      <Text style={styles.commLabel}>Intercom Routing</Text>
                      <Text style={styles.commValue}>Extension: 4010 • Executive Line 1</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Security & Access Clearance Card */}
              <View style={styles.panelCard}>
                <View style={styles.panelHeader}>
                  <View style={styles.panelHeaderLeft}>
                    <MaterialIcons name="security" size={20} color="#003fb1" />
                    <Text style={styles.panelTitle}>System Security Clearance</Text>
                  </View>
                  <Text style={[styles.panelBadge, { backgroundColor: '#f0fdf4', color: '#166534', borderColor: '#bbf7d0' }]}>
                    VERIFIED
                  </Text>
                </View>

                <View style={styles.securityList}>
                  <View style={styles.secRow}>
                    <Text style={styles.secLabel}>System Role Level</Text>
                    <Text style={styles.secVal}>Master Administrator (Role: ADMIN)</Text>
                  </View>
                  <View style={styles.secRow}>
                    <Text style={styles.secLabel}>Authentication Protocol</Text>
                    <Text style={styles.secVal}>Token & Biometric 2FA Active</Text>
                  </View>
                  <View style={styles.secRow}>
                    <Text style={styles.secLabel}>Session Encryption</Text>
                    <Text style={styles.secVal}>TLS 1.3 End-to-End Encrypted</Text>
                  </View>
                  <View style={styles.secRow}>
                    <Text style={styles.secLabel}>Database Authority</Text>
                    <Text style={styles.secVal}>Full Read / Write / Timetable & Attendance Signoff</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Right Column: Institutional Scope, Qualifications & Statutory Roles */}
            <View style={styles.rightCol}>
              {/* Institutional Overview KPI Cards (4 Tiles) */}
              <View style={styles.kpiGrid}>
                <View style={styles.kpiCard}>
                  <View style={styles.kpiTop}>
                    <Text style={styles.kpiLabel}>Academic Depts</Text>
                    <MaterialIcons name="account-balance" size={20} color="#003fb1" />
                  </View>
                  <Text style={styles.kpiValue}>7</Text>
                  <Text style={styles.kpiSub}>Under Administrative Oversight</Text>
                </View>

                <View style={styles.kpiCard}>
                  <View style={styles.kpiTop}>
                    <Text style={styles.kpiLabel}>Teaching Faculty</Text>
                    <MaterialIcons name="badge" size={20} color="#0284c7" />
                  </View>
                  <Text style={styles.kpiValue}>98</Text>
                  <Text style={styles.kpiSub}>Appointed Academic Staff</Text>
                </View>

                <View style={styles.kpiCard}>
                  <View style={styles.kpiTop}>
                    <Text style={styles.kpiLabel}>Student Cohort</Text>
                    <MaterialIcons name="school" size={20} color="#16a34a" />
                  </View>
                  <Text style={styles.kpiValue}>1,420</Text>
                  <Text style={styles.kpiSub}>UG & PG Enrolled</Text>
                </View>

                <View style={styles.kpiCard}>
                  <View style={styles.kpiTop}>
                    <Text style={styles.kpiLabel}>Institutional SLA</Text>
                    <MaterialIcons name="verified" size={20} color="#7c3aed" />
                  </View>
                  <Text style={styles.kpiValue}>98.4%</Text>
                  <Text style={styles.kpiSub}>Governance Compliance</Text>
                </View>
              </View>

              {/* Academic & Professional Credentials Card */}
              <View style={styles.panelCard}>
                <View style={styles.panelHeader}>
                  <View style={styles.panelHeaderLeft}>
                    <MaterialIcons name="school" size={20} color="#003fb1" />
                    <Text style={styles.panelTitle}>Academic Qualifications & Specializations</Text>
                  </View>
                </View>

                <View style={styles.credDetails}>
                  <View style={styles.credRow}>
                    <Text style={styles.credKey}>Highest Degree</Text>
                    <Text style={styles.credVal}>Doctor of Philosophy (Ph.D.) in High-Performance Computing, IIT Madras (2008)</Text>
                  </View>
                  <View style={styles.credRow}>
                    <Text style={styles.credKey}>Postgraduate Degree</Text>
                    <Text style={styles.credVal}>Master of Engineering (M.E.) in Computer Science & Engineering, Anna University</Text>
                  </View>
                  <View style={styles.credRow}>
                    <Text style={styles.credKey}>Research & Expertise</Text>
                    <Text style={styles.credVal}>Distributed Systems, Autonomous Curriculum Governance, Educational Analytics, Accreditation Standards</Text>
                  </View>
                  <View style={styles.credRow}>
                    <Text style={styles.credKey}>Academic Portfolio</Text>
                    <Text style={styles.credVal}>42+ Peer-Reviewed Journal Articles, 6 Granted Patents in Educational Management</Text>
                  </View>
                </View>
              </View>

              {/* Statutory Committees & Leadership Responsibilities */}
              <View style={styles.panelCard}>
                <View style={styles.panelHeader}>
                  <View style={styles.panelHeaderLeft}>
                    <MaterialIcons name="gavel" size={20} color="#003fb1" />
                    <Text style={styles.panelTitle}>Statutory Committees & Governance Responsibilities</Text>
                  </View>
                </View>

                <View style={styles.rolesGrid}>
                  <View style={styles.roleCardItem}>
                    <View style={styles.roleIconBox}>
                      <MaterialIcons name="rule" size={20} color="#003fb1" />
                    </View>
                    <View style={styles.roleTextBox}>
                      <Text style={styles.roleTitle}>Chairman, Board of Studies (BoS)</Text>
                      <Text style={styles.roleDesc}>Directs annual curriculum revamps, syllabus compliance, and autonomous course offerings across all departments.</Text>
                    </View>
                  </View>

                  <View style={styles.roleCardItem}>
                    <View style={styles.roleIconBox}>
                      <MaterialIcons name="fact-check" size={20} color="#003fb1" />
                    </View>
                    <View style={styles.roleTextBox}>
                      <Text style={styles.roleTitle}>Controller of Examinations (CoE)</Text>
                      <Text style={styles.roleDesc}>Oversees semester evaluation schedules, central valuation confidential boards, and continuous internal assessments.</Text>
                    </View>
                  </View>

                  <View style={styles.roleCardItem}>
                    <View style={styles.roleIconBox}>
                      <MaterialIcons name="groups" size={20} color="#003fb1" />
                    </View>
                    <View style={styles.roleTextBox}>
                      <Text style={styles.roleTitle}>Member Secretary, Governing Council</Text>
                      <Text style={styles.roleDesc}>Facilitates institutional compliance reports, accreditation self-study audits (NAAC & NBA), and senate resolutions.</Text>
                    </View>
                  </View>

                  <View style={styles.roleCardItem}>
                    <View style={styles.roleIconBox}>
                      <MaterialIcons name="psychology" size={20} color="#003fb1" />
                    </View>
                    <View style={styles.roleTextBox}>
                      <Text style={styles.roleTitle}>Head, Mentor-Proctor Oversight Panel</Text>
                      <Text style={styles.roleDesc}>Supervises faculty proctor allocations, student quota balancing, and academic intervention for low attendance cohorts.</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Quick Launch Console Shortcuts */}
              <View style={styles.quickLaunchCard}>
                <Text style={styles.quickLaunchTitle}>Administrative Quick Launch</Text>
                <View style={styles.quickLaunchGrid}>
                  <TouchableOpacity
                    style={styles.quickLaunchItem}
                    onPress={() => navigation?.navigate('ReportManagement')}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="analytics" size={22} color="#003fb1" />
                    <Text style={styles.quickLaunchItemLabel}>Institutional Reports</Text>
                    <Text style={styles.quickLaunchItemSub}>Attendance & Defaulters</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickLaunchItem}
                    onPress={() => navigation?.navigate('AdminTimetable')}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="schedule" size={22} color="#003fb1" />
                    <Text style={styles.quickLaunchItemLabel}>Master Timetable</Text>
                    <Text style={styles.quickLaunchItemSub}>Classroom Schedules</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickLaunchItem}
                    onPress={() => navigation?.navigate('CampusAdminControlCenter')}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="admin-panel-settings" size={22} color="#003fb1" />
                    <Text style={styles.quickLaunchItemLabel}>Control Center</Text>
                    <Text style={styles.quickLaunchItemSub}>Operations & Alerts</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickLaunchItem}
                    onPress={() => navigation?.navigate('MentorProctorAllocation')}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="supervisor-account" size={22} color="#003fb1" />
                    <Text style={styles.quickLaunchItemLabel}>Mentor Allocations</Text>
                    <Text style={styles.quickLaunchItemSub}>Faculty Mentorship</Text>
                  </TouchableOpacity>
                </View>
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
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 48,
  },
  laptopContainer: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 20,
  },

  /* Top Breadcrumb Toolbar */
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
    gap: 8,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#e0e7ff',
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
    color: '#334155',
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
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#003fb1',
    shadowColor: '#003fb1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtnPrimaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },

  /* Hero Executive Card */
  heroCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#003fb1',
    position: 'relative',
    shadowColor: '#003fb1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  heroBannerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#003fb1',
  },
  bannerCircleOne: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  bannerCircleTwo: {
    position: 'absolute',
    bottom: -60,
    right: 140,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  heroBody: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    gap: 24,
    flexWrap: 'wrap',
    position: 'relative',
    zIndex: 2,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#ffffff',
    backgroundColor: '#e2e8f0',
    objectFit: 'cover',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#22c55e',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  heroIdentity: {
    flex: 1,
    minWidth: 280,
    gap: 6,
  },
  authBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  authBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  authBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  heroName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  heroRole: {
    fontSize: 15,
    fontWeight: '500',
    color: '#dbeafe',
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaItemText: {
    fontSize: 13,
    color: '#e0e7ff',
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  heroActions: {
    flexDirection: 'column',
    gap: 8,
    minWidth: 140,
  },
  heroEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  heroEditBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#003fb1',
  },
  heroContactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  heroContactBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },

  /* Laptop Two-Column Layout */
  laptopGrid: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  leftCol: {
    flex: 1,
    minWidth: 320,
    gap: 20,
  },
  rightCol: {
    flex: 2,
    minWidth: 460,
    gap: 20,
  },

  /* Panel Card Styles */
  panelCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 20,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    gap: 16,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 12,
  },
  panelHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  panelBadge: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    backgroundColor: '#eff6ff',
    color: '#003fb1',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },

  /* Communication Items */
  commItemList: {
    gap: 14,
  },
  commItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  commIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commContent: {
    flex: 1,
  },
  commLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 2,
  },
  commValue: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '600',
  },
  commActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  commActionPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#003fb1',
  },

  /* Security Clearance Rows */
  securityList: {
    gap: 10,
  },
  secRow: {
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  secLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 2,
  },
  secVal: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '600',
  },

  /* KPI Grid (4 Tiles) */
  kpiGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  kpiCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  kpiTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  kpiLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
  },
  kpiSub: {
    fontSize: 11,
    color: '#94a3b8',
  },

  /* Credentials */
  credDetails: {
    gap: 12,
  },
  credRow: {
    gap: 3,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  credKey: {
    fontSize: 11,
    fontWeight: '600',
    color: '#003fb1',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  credVal: {
    fontSize: 13.5,
    color: '#1e293b',
    lineHeight: 20,
    fontWeight: '500',
  },

  /* Statutory Committee Grid */
  rolesGrid: {
    gap: 12,
  },
  roleCardItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  roleIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  roleTextBox: {
    flex: 1,
    gap: 3,
  },
  roleTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  roleDesc: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },

  /* Quick Launch Card */
  quickLaunchCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 20,
    gap: 14,
  },
  quickLaunchTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  quickLaunchGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  quickLaunchItem: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    gap: 4,
  },
  quickLaunchItemLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 4,
  },
  quickLaunchItemSub: {
    fontSize: 11,
    color: '#64748b',
  },
});
