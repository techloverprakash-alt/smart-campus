import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Share,
} from '@/ui';
import { MaterialIcons } from '@/ui';
import { LinearGradient } from '@/ui';
import Colors from '../../../constants/colors';
import BottomNavBar from '../../../components/common/BottomNavBar';

export default function EnrollmentSuccess({ route, navigation }) {
  const params = route?.params || {};
  const isBulk = params.type === 'bulk';

  // State
  const [showPassword, setShowPassword] = useState(true);
  const [copiedKey, setCopiedKey] = useState(null); // 'password' | 'credentials' | 'all'

  // Admin Bottom Nav items
  const adminNavItems = [
    { key: 'home', label: 'Home', icon: 'dashboard', screen: 'AdminDashboard' },
    { key: 'attendance', label: 'Attendance', icon: 'how-to-reg', screen: 'ReportManagement' },
    { key: 'timetable', label: 'Timetable', icon: 'calendar-month', screen: 'AdminTimetable' },
    { key: 'history', label: 'History', icon: 'history', screen: 'AttendanceHistory' },
    { key: 'profile', label: 'Profile', icon: 'person', screen: 'AdminProfile' },
  ];

  // Single student fields
  const studentName = params.name || 'Abishek R K';
  const registerNumber = params.registerNumber || '24AD012';
  const password = params.generatedPassword || 'abi012';
  const email = params.email || 'abishek.24ad012@infotech.edu.in';
  const phone = params.phone || '+91 98421 77310';
  const department = params.department || 'Artificial Intelligence & Data Science';
  const departmentCode = params.departmentCode || 'AIDS';
  const batch = params.batch || '2024–2028';
  const section = params.section || 'Section A';
  const category = params.admissionCategory || 'Regular';
  const mentor = params.mentor || 'Dr. Arulprakash P';
  const dob = params.dob || '2005-04-18';
  const gender = params.gender || 'Male';

  // Bulk student fields
  const totalProcessed = params.totalProcessed || 0;
  const enrolledCount = params.enrolledCount || 0;
  const skippedCount = params.skippedCount || 0;
  const fileName = params.fileName || 'student_roster.xlsx';
  const results = params.results || [];

  // Formatted date string
  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleCopy = (text, key) => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    } else {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  const handleShareReceipt = async () => {
    const summary = isBulk
      ? `Nexus CMS Enrollment Report:\nTarget: ${departmentCode} - ${section} (${batch})\nTotal: ${totalProcessed} | Enrolled: ${enrolledCount} | Skipped: ${skippedCount}\nFile: ${fileName}\nCompleted: ${formattedDate}`
      : `Nexus CMS Student Credentials:\nName: ${studentName}\nReg No: ${registerNumber}\nUsername: ${registerNumber}\nPassword: ${password}\nEmail: ${email}\nDept: ${department} (${batch} ${section})\nCompleted: ${formattedDate}`;

    if (Platform.OS === 'web') {
      handleCopy(summary, 'all');
    } else {
      try {
        await Share.share({ message: summary, title: 'Student Enrollment Credentials' });
      } catch (err) {
        console.log('Share err:', err);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ================= FIXED TOP HEADER ================= */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation?.navigate('AdminDashboard')}
            activeOpacity={0.7}
            accessibilityLabel="Go to Dashboard"
          >
            <MaterialIcons name="arrow-back" size={22} color={Colors.onSurface} />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <View style={styles.badgeRow}>
              <Text style={styles.collegeNameBadge}>INFO INSTITUTE OF TECHNOLOGY</Text>
              <View style={styles.badgeDot} />
              <Text style={styles.cmsBadge}>NEXUS CMS</Text>
            </View>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Enrollment Status
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            activeOpacity={0.7}
            onPress={handleShareReceipt}
            accessibilityLabel="Share / Copy summary"
          >
            <MaterialIcons name="share" size={20} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ================= SCROLLABLE CONTENT ================= */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= HERO CELEBRATION CARD ================= */}
        <LinearGradient
          colors={['#059669', '#047857', '#065f46']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          {/* Glowing Status Pill */}
          <View style={styles.heroBadgePill}>
            <MaterialIcons name="verified" size={14} color="#ffffff" />
            <Text style={styles.heroBadgePillText}>PROCESS COMPLETED</Text>
          </View>

          {/* Central Success Icon with Ripple Ring */}
          <View style={styles.successIconOuterRing}>
            <View style={styles.successIconInnerRing}>
              <MaterialIcons name="check" size={38} color="#059669" />
            </View>
          </View>

          <Text style={styles.heroTitle}>
            {isBulk ? 'Bulk Import Completed!' : 'Student Enrolled Successfully!'}
          </Text>

          <Text style={styles.heroSubtitle}>
            {isBulk
              ? `Successfully processed ${totalProcessed} student records. All credentials and class profiles have been generated and activated.`
              : `${studentName} has been enrolled into ${departmentCode} (${section}) and initial portal credentials have been generated.`}
          </Text>

          {/* Meta Details Row */}
          <View style={styles.heroMetaRow}>
            <View style={styles.heroMetaItem}>
              <MaterialIcons name="schedule" size={14} color="rgba(255, 255, 255, 0.85)" />
              <Text style={styles.heroMetaText}>{formattedDate}</Text>
            </View>
            <View style={styles.heroMetaDivider} />
            <View style={styles.heroMetaItem}>
              <MaterialIcons name="lock" size={14} color="rgba(255, 255, 255, 0.85)" />
              <Text style={styles.heroMetaText}>Rule: name[:3] + reg[-3:]</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ================= SUMMARY DETAILS SECTION ================= */}
        {!isBulk ? (
          /* ================= SINGLE STUDENT RECEIPT ================= */
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.rowAlign}>
                <View style={styles.cardIconBox}>
                  <MaterialIcons name="badge" size={20} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.cardTitle}>Student Account Credentials</Text>
                  <Text style={styles.cardSubtitle}>Verified portal login & academic record</Text>
                </View>
              </View>
              <View style={styles.activeTag}>
                <View style={styles.activeDot} />
                <Text style={styles.activeTagText}>Active</Text>
              </View>
            </View>

            {/* Student Identity Tile */}
            <View style={styles.studentIdentTile}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitials}>
                  {studentName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.studentNameText}>{studentName}</Text>
                <Text style={styles.regNoBadgeText}>REG NO: {registerNumber}</Text>
                <Text style={styles.deptDegreeText} numberOfLines={1}>
                  {department} • {batch}
                </Text>
              </View>
            </View>

            {/* Key-Value Credentials Box */}
            <View style={styles.credentialsBox}>
              <View style={styles.credRow}>
                <Text style={styles.credLabel}>Portal Username</Text>
                <View style={styles.rowAlign}>
                  <Text style={styles.credValueBold}>{registerNumber}</Text>
                  <TouchableOpacity
                    style={styles.copyMiniBtn}
                    onPress={() => handleCopy(registerNumber, 'username')}
                  >
                    <MaterialIcons
                      name={copiedKey === 'username' ? 'check' : 'content-copy'}
                      size={14}
                      color={copiedKey === 'username' ? '#059669' : Colors.primary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.credDivider} />

              <View style={styles.credRow}>
                <View>
                  <Text style={styles.credLabel}>Predefined Password</Text>
                  <Text style={styles.credSubHint}>[first 3 chars of name + last 3 digits of reg no]</Text>
                </View>
                <View style={styles.rowAlign}>
                  <Text style={styles.passwordValueText}>
                    {showPassword ? password : '••••••••'}
                  </Text>
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <MaterialIcons
                      name={showPassword ? 'visibility-off' : 'visibility'}
                      size={16}
                      color="#b45309"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.copyMiniBtn}
                    onPress={() => handleCopy(password, 'password')}
                  >
                    <MaterialIcons
                      name={copiedKey === 'password' ? 'check' : 'content-copy'}
                      size={14}
                      color={copiedKey === 'password' ? '#059669' : Colors.primary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.credDivider} />

              <View style={styles.credRow}>
                <Text style={styles.credLabel}>Institutional Email</Text>
                <View style={styles.rowAlign}>
                  <Text style={styles.credValue} numberOfLines={1}>{email}</Text>
                  <TouchableOpacity
                    style={styles.copyMiniBtn}
                    onPress={() => handleCopy(email, 'email')}
                  >
                    <MaterialIcons
                      name={copiedKey === 'email' ? 'check' : 'content-copy'}
                      size={14}
                      color={copiedKey === 'email' ? '#059669' : Colors.primary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Academic Placement Details Grid */}
            <View style={styles.specsGrid}>
              <View style={styles.specTile}>
                <Text style={styles.specLabel}>Department</Text>
                <Text style={styles.specValue}>{departmentCode}</Text>
              </View>
              <View style={styles.specTile}>
                <Text style={styles.specLabel}>Admitted Batch</Text>
                <Text style={styles.specValue}>{batch}</Text>
              </View>
              <View style={styles.specTile}>
                <Text style={styles.specLabel}>Assigned Section</Text>
                <Text style={styles.specValue}>{section}</Text>
              </View>
              <View style={styles.specTile}>
                <Text style={styles.specLabel}>Admission Category</Text>
                <Text style={styles.specValue}>{category}</Text>
              </View>
              <View style={styles.specTile}>
                <Text style={styles.specLabel}>Assigned Mentor</Text>
                <Text style={styles.specValue} numberOfLines={1}>{mentor}</Text>
              </View>
              <View style={styles.specTile}>
                <Text style={styles.specLabel}>Contact Phone</Text>
                <Text style={styles.specValue}>{phone || '—'}</Text>
              </View>
            </View>
          </View>
        ) : (
          /* ================= BULK IMPORT RECEIPT ================= */
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.rowAlign}>
                <View style={styles.cardIconBox}>
                  <MaterialIcons name="table-view" size={20} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.cardTitle}>Bulk Roster Summary</Text>
                  <Text style={styles.cardSubtitle}>Import metrics & credential status</Text>
                </View>
              </View>
              <View style={styles.fileTagPill}>
                <MaterialIcons name="description" size={12} color={Colors.primary} />
                <Text style={styles.fileTagPillText} numberOfLines={1}>{fileName}</Text>
              </View>
            </View>

            {/* Metrics Counters Grid */}
            <View style={styles.metricsRow}>
              <View style={[styles.metricTile, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
                <Text style={[styles.metricNumber, { color: '#15803d' }]}>{enrolledCount}</Text>
                <Text style={styles.metricLabel}>Enrolled / Active</Text>
              </View>
              <View style={[styles.metricTile, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
                <Text style={[styles.metricNumber, { color: '#1d4ed8' }]}>{totalProcessed}</Text>
                <Text style={styles.metricLabel}>Total Processed</Text>
              </View>
              <View style={[styles.metricTile, { backgroundColor: '#fef2f2', borderColor: '#fecaca' }]}>
                <Text style={[styles.metricNumber, { color: '#b91c1c' }]}>{skippedCount}</Text>
                <Text style={styles.metricLabel}>Skipped</Text>
              </View>
            </View>

            {/* Target Cohort Badge */}
            <View style={styles.cohortSummaryBox}>
              <View style={styles.cohortSummaryRow}>
                <MaterialIcons name="school" size={16} color={Colors.primary} />
                <Text style={styles.cohortSummaryText}>
                  Assigned Cohort:{' '}
                  <Text style={{ fontWeight: '700', color: Colors.primary }}>
                    {departmentCode} • {batch} • {section}
                  </Text>
                </Text>
              </View>
            </View>

            {/* Enrolled Students Table Preview */}
            <View style={styles.tableCard}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableColHeader, { flex: 1.3 }]}>Reg Number</Text>
                <Text style={[styles.tableColHeader, { flex: 1.5 }]}>Student Name</Text>
                <Text style={[styles.tableColHeader, { flex: 1.2 }]}>Generated Pwd</Text>
                <Text style={[styles.tableColHeader, { flex: 1 }]}>Status</Text>
              </View>

              <ScrollView style={{ maxHeight: 260 }} nestedScrollEnabled>
                {results.length > 0 ? (
                  results.slice(0, 30).map((st, idx) => (
                    <View key={idx} style={styles.tableDataRow}>
                      <Text style={[styles.tableCellBold, { flex: 1.3 }]}>
                        {st.register_number || st.reg}
                      </Text>
                      <Text style={[styles.tableCell, { flex: 1.5 }]} numberOfLines={1}>
                        {st.name || st.full_name}
                      </Text>
                      <View style={{ flex: 1.2 }}>
                        <View style={styles.miniPwdBadge}>
                          <Text style={styles.miniPwdText}>
                            {st.generated_password || 'Auto-created'}
                          </Text>
                        </View>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.statusSuccessPill}>
                          <Text style={styles.statusSuccessText}>
                            {st.status || 'Active'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={{ padding: 16, alignItems: 'center' }}>
                    <Text style={{ color: Colors.secondary, fontSize: 12 }}>
                      {enrolledCount} accounts created successfully.
                    </Text>
                  </View>
                )}
              </ScrollView>

              {results.length > 30 && (
                <View style={styles.tableFooterNote}>
                  <Text style={styles.tableFooterNoteText}>
                    + {results.length - 30} additional students enrolled
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ================= INSTRUCTION CALLOUT BANNER ================= */}
        <View style={styles.instructionBanner}>
          <MaterialIcons name="info-outline" size={20} color="#003fb1" style={{ marginTop: 2, marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.instructionTitle}>Student Login Readiness</Text>
            <Text style={styles.instructionText}>
              Enrolled students can log in immediately via the Student Portal using their Register Number as the username and the predefined password [first 3 letters of name (lowercase) + last 3 digits of register number].
            </Text>
          </View>
        </View>

        {/* ================= PRIMARY ACTION BUTTONS ================= */}
        <View style={styles.actionButtonGroup}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation?.navigate('EnrollStudent')}
            activeOpacity={0.85}
          >
            <MaterialIcons name="person-add" size={20} color="#ffffff" />
            <Text style={styles.primaryBtnText}>Enroll Another Student</Text>
          </TouchableOpacity>

          <View style={styles.secondaryBtnRow}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation?.navigate('AdminDashboard')}
              activeOpacity={0.8}
            >
              <MaterialIcons name="dashboard" size={18} color={Colors.primary} />
              <Text style={styles.secondaryBtnText}>Admin Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation?.navigate('ReportManagement')}
              activeOpacity={0.8}
            >
              <MaterialIcons name="how-to-reg" size={18} color={Colors.onSurface} />
              <Text style={[styles.secondaryBtnText, { color: Colors.onSurface }]}>Attendance Hub</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.textActionBtn}
            onPress={handleShareReceipt}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={copiedKey === 'all' ? 'check' : 'content-copy'}
              size={16}
              color={Colors.secondary}
            />
            <Text style={styles.textActionBtnText}>
              {copiedKey === 'all' ? 'Copied Receipt to Clipboard!' : 'Copy Summary & Credentials'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ================= FIXED BOTTOM NAV ================= */}
      <BottomNavBar items={adminNavItems} activeItem="home" navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface,
  },

  /* ================= TOP HEADER ================= */
  topHeader: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(250, 248, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.04)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitleWrap: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  collegeNameBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    marginHorizontal: 5,
  },
  cmsBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerHigh,
  },

  /* ================= SCROLL CONTAINER ================= */
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 90,
    gap: 14,
  },

  /* ================= HERO CARD ================= */
  heroCard: {
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  heroBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 16,
  },
  heroBadgePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.8,
  },
  successIconOuterRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  successIconInnerRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.92)',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: '92%',
    marginBottom: 14,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
  },
  heroMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  heroMetaDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  heroMetaText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '500',
  },

  /* ================= RECEIPT CARD ================= */
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 63, 177, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  cardSubtitle: {
    fontSize: 11,
    color: Colors.secondary,
  },
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16a34a',
  },
  activeTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  fileTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 63, 177, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    maxWidth: '45%',
  },
  fileTagPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },

  /* ================= STUDENT IDENT TILE ================= */
  studentIdentTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  studentNameText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  regNoBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 1,
  },
  deptDegreeText: {
    fontSize: 11,
    color: Colors.secondary,
    marginTop: 2,
  },

  /* ================= CREDENTIALS BOX ================= */
  credentialsBox: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    gap: 8,
  },
  credRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  credLabel: {
    fontSize: 11,
    color: Colors.secondary,
    fontWeight: '500',
  },
  credSubHint: {
    fontSize: 9,
    color: '#b45309',
    marginTop: 1,
  },
  credValue: {
    fontSize: 12,
    color: Colors.onSurface,
    fontWeight: '500',
    maxWidth: 180,
  },
  credValueBold: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  passwordValueText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#b45309',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  credDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  eyeBtn: {
    padding: 4,
    marginRight: 2,
  },
  copyMiniBtn: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 63, 177, 0.06)',
  },

  /* ================= SPECS GRID ================= */
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specTile: {
    width: '48.5%',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 10,
    padding: 10,
  },
  specLabel: {
    fontSize: 10,
    color: Colors.secondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  specValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },

  /* ================= BULK METRICS ================= */
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  metricTile: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  metricNumber: {
    fontSize: 22,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 11,
    color: Colors.secondary,
    fontWeight: '500',
    marginTop: 2,
  },
  cohortSummaryBox: {
    backgroundColor: 'rgba(0, 63, 177, 0.06)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  cohortSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cohortSummaryText: {
    fontSize: 12,
    color: Colors.onSurface,
  },

  /* ================= TABLE CARD ================= */
  tableCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerHigh,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  tableColHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.secondary,
  },
  tableDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.03)',
  },
  tableCellBold: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  tableCell: {
    fontSize: 11,
    color: Colors.onSurface,
  },
  miniPwdBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  miniPwdText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400e',
  },
  statusSuccessPill: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusSuccessText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#166534',
  },
  tableFooterNote: {
    padding: 8,
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
  },
  tableFooterNoteText: {
    fontSize: 11,
    color: Colors.secondary,
    fontStyle: 'italic',
  },

  /* ================= INSTRUCTION BANNER ================= */
  instructionBanner: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  instructionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 2,
  },
  instructionText: {
    fontSize: 12,
    color: '#1e3a8a',
    lineHeight: 17,
  },

  /* ================= ACTIONS ================= */
  actionButtonGroup: {
    gap: 10,
    marginTop: 4,
  },
  primaryBtn: {
    height: 48,
    backgroundColor: Colors.primaryContainer,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  secondaryBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    height: 44,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  textActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  textActionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary,
  },

  /* ================= UTILITY ================= */
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
