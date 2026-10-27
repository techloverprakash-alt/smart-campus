import React, { useState, useEffect } from "react";
import { getStudentAttendanceSummary } from '../../../services/api/attendance';
import { useAuth } from '../../auth/context/AuthContext';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
} from '@/ui';
import { MaterialIcons } from '@/ui';
import StudentBottomNav from "../../../components/common/StudentBottomNav";


const CREST_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuANdWs9FsNCaoAEBH-d9jjOGNGHTECsPM5IBwpJZ8hGqWi5BU4XLsXoaZhn9Oj3Tl9ZiK4tWrjXASrpYcWSeB-4H5TuTOP_3_F-HFZDDAoTANGqXUs9Itaneg-eQUPrdgkpGTGMcJaBp7mFQkmNSlvLN2wHxfwOnW9oLojQsVvmLjPbV7DiGhYaNHNlHp7CWp-TtswVdW5UDM4P9f_lTYd9BTzywk-v6kHE3bO2smiq3IZsLXaiXBlsChR7BG6NiYKgDw";

const STUDENT_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCVXP3laCjvBlZEVugtzpX20kCifG87-9yGGVWnUCmaIhNtCcDdG9HmCKcyaSa4oTc-QPnHNb5RR_pO0Xd8oVLNtxyVdxbttBW5KjbrzMiMJD0HcqApHxFuVbC5_KEUHnW0qOr98kurfIJ2NAVvw464MLzvDAN8LdJTSZXSqkbDkysN8V9Lzled9wZvQVwVorYcKfLMT1do8whwEUyopOcVpVMNt3wTCpl8mQ00dAziqalPOmZQTqcZ";

const COLORS = {
  background: "#faf8ff",
  surfaceLow: "#f3f3fe",
  surface: "#ffffff",
  surfaceHigh: "#e7e7f3",
  surfaceHighest: "#e2e1ed",
  primary: "#003fb1",
  primaryContainer: "#1a56db",
  secondary: "#585f6c",
  text: "#191b23",
  textVariant: "#434654",
  outline: "#737686",
  error: "#ba1a1a",
  tertiary: "#ad3b00",
};



function Header({ navigation }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() => {
            if (navigation && navigation.canGoBack()) navigation.goBack();
            else navigation?.navigate("StudentDashboard");
          }}
        >
          <MaterialIcons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.text }}>Attendance Details</Text>
          <Text style={styles.subtitle}>Academic record & subject-wise breakdown</Text>
        </View>
      </View>
    </View>
  );
}

function StudentIdentity({ profile, user }) {
  const studentName = profile?.full_name || user?.profile?.full_name || 'Gnana Prakash V';
  const registerNumber = profile?.register_number || user?.identifier || '714022243018';
  const semSecText = profile?.semester
    ? `Sem ${profile.semester} · Sec ${profile?.section || 'A'}`
    : 'Sem 5 · Sec A';
  const academicYear = profile?.batch ? `Batch ${profile.batch}` : 'AY 2024–2025';
  const departmentName = profile?.department?.name || 'B.Tech AI & DS';
  const avatarUri = profile?.avatar_url || user?.profile?.avatar_url || STUDENT_IMAGE;

  return (
    <View style={styles.identityCard}>
      <View style={styles.identityTop}>
        <View style={styles.studentInfo}>
          <View style={styles.studentImageContainer}>
            <Image
              source={{ uri: avatarUri }}
              style={styles.studentImage}
            />

            <View style={styles.verifiedDot}>
              <MaterialIcons
                name="verified"
                size={10}
                color="#fff"
              />
            </View>
          </View>

          <View style={styles.studentText}>
            <Text style={styles.studentName}>
              {studentName}
            </Text>

            <Text style={styles.registerNumber}>
              REG: {registerNumber}
            </Text>
          </View>
        </View>

        <View style={styles.semesterContainer}>
          <View style={styles.semesterBadge}>
            <Text style={styles.semesterText}>
              {semSecText}
            </Text>
          </View>

          <Text style={styles.academicYear}>
            {academicYear}
          </Text>
        </View>
      </View>

      <View style={styles.metadataGrid}>
        <View style={styles.metadataItem}>
          <MaterialIcons
            name="school"
            size={18}
            color={COLORS.primary}
          />

          <View style={{ marginLeft: 6 }}>
            <Text style={styles.metadataLabel}>
              DEPARTMENT
            </Text>
            <Text style={styles.metadataValue}>
              {departmentName}
            </Text>
          </View>
        </View>

        <View style={styles.metadataItem}>
          <MaterialIcons
            name="account-balance"
            size={18}
            color={COLORS.primary}
          />

          <View style={{ marginLeft: 6 }}>
            <Text style={styles.metadataLabel}>
              INSTITUTION
            </Text>
            <Text style={styles.metadataValue}>
              Info IT (R-2021)
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function AttendanceGauge({ percentage = 88.4 }) {
  const displayPercentage = typeof percentage === 'number' ? percentage.toFixed(1) : percentage;
  return (
    <View style={styles.gaugeWrapper}>
      <View style={styles.gaugeOuter}>
        <View style={styles.gaugeTrack}>
          <View style={styles.gaugeProgress}>
            <View style={styles.gaugeInner} />
          </View>
        </View>

        <View style={styles.gaugeText}>
          <Text style={styles.gaugePercentage}>{displayPercentage}%</Text>
          <Text style={styles.aggregate}>AGGREGATE</Text>
        </View>
      </View>
    </View>
  );
}

function MetricBox({
  label,
  value,
  description,
  color = COLORS.text,
}) {
  return (
    <View style={styles.metricBox}>
      <Text style={[styles.metricLabel, { color }]}>
        {label}
      </Text>

      <Text style={[styles.metricValue, { color }]}>
        {value}
      </Text>

      {description ? (
        <Text style={styles.metricDescription}>
          {description}
        </Text>
      ) : null}
    </View>
  );
}

function AttendanceCard({
  overallPct = 0,
  totalDays,
  presentDays,
  absentDays,
  onDutyDays,
  onDutySessions,
  canMiss = 0,
}) {
  const zone = overallPct >= 85 ? 'Safe Zone' : overallPct >= 75 ? 'Caution' : 'At Risk';
  const displayTotalDays = totalDays ?? 120;
  const displayPresentDays = presentDays ?? 110;
  const displayAbsentDays = absentDays ?? 10;
  const displayOnDutyDays = onDutyDays ?? 2;
  const displayOnDutySessions = onDutySessions ?? 4;
  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return (
    <View style={styles.attendanceCard}>
      <View style={styles.attendanceHeader}>
        <View>
          <Text style={styles.sectionLabel}>
            CUMULATIVE ATTENDANCE
          </Text>

          <Text style={styles.dateText}>
            Through {formattedDate}
          </Text>
        </View>

        <View style={styles.safeBadge}>
          <View style={styles.safeDot} />

          <Text style={[styles.safeText, { color: overallPct >= 75 ? '#166534' : '#b91c1c' }]}>
            {zone}
          </Text>
        </View>
      </View>

      <View style={styles.gaugeStatsRow}>
        <AttendanceGauge percentage={overallPct} />

        <View style={styles.metricGrid}>
          <MetricBox
            label="Total Days"
            value={String(displayTotalDays)}
          />

          <MetricBox
            label="Present Days"
            value={String(displayPresentDays)}
            color={COLORS.primary}
          />

          <MetricBox
            label="Absences (Days)"
            value={String(displayAbsentDays)}
            color={COLORS.error}
          />

          <View style={[styles.metricBox, styles.onDutyMetricBox]}>
            <View style={styles.onDutyValues}>
              <View style={styles.onDutyValueSection}>
                <Text style={[styles.metricLabel, { color: COLORS.tertiary }]}>
                  On-Duty (Days)
                </Text>
                <Text style={[styles.metricValue, { color: COLORS.tertiary }]}>
                  {String(displayOnDutyDays)}
                </Text>
              </View>

              <View style={styles.onDutyDivider} />

              <View style={styles.onDutyValueSection}>
                <Text style={[styles.metricLabel, { color: COLORS.tertiary }]}>
                  On-Duty (Sessions)
                </Text>
                <Text style={[styles.metricValue, { color: COLORS.tertiary }]}>
                  {String(displayOnDutySessions)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.eligibilityBanner}>
        <View style={styles.eligibilityIcon}>
          <MaterialIcons
            name={overallPct >= 75 ? "verified-user" : "warning"}
            size={18}
            color="#fff"
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.eligibilityTitle}>
            {overallPct >= 75
              ? "75% AU Mandatory Criteria Satisfied"
              : "Attendance Below 75% Requirement"}
          </Text>

          <Text style={styles.eligibilitySubtitle}>
            {overallPct >= 75
              ? "Eligible for End-Semester Exam Hall Ticket"
              : "Action Required: Contact Faculty Advisor"}
          </Text>
        </View>
      </View>

      <View style={styles.runwayBox}>
        <MaterialIcons
          name="lightbulb"
          size={20}
          color={COLORS.textVariant}
        />

        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.runwayTitle}>
            Attendance Runway Safety
          </Text>

          <Text style={styles.runwayText}>
            {canMiss > 0 ? (
              <>
                You can miss up to{" "}
                <Text style={styles.highlight}>
                  {canMiss} more periods
                </Text>{" "}
                without slipping below the required 75.0% threshold.
              </>
            ) : (
              "Attendance threshold requires attending upcoming scheduled lectures."
            )}
          </Text>
        </View>
      </View>
    </View>
  );
}

function SubjectCard({ subject }) {
  return (
    <View style={styles.subjectCard}>
      <View style={styles.subjectTop}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <View style={styles.codeRow}>
            <Text style={styles.subjectCode}>
              {subject.code}
            </Text>

            <Text style={styles.creditText}>
              · {subject.credits}
            </Text>
          </View>

          <Text style={styles.subjectName}>
            {subject.name}
          </Text>

          <Text style={styles.staffName}>
            {subject.staff}
          </Text>
        </View>

        <View style={styles.percentageBox}>
          <Text
            style={[
              styles.subjectPercentage,
              {
                color:
                  subject.code === "MA3354"
                    ? COLORS.text
                    : COLORS.primary,
              },
            ]}
          >
            {subject.percentage}
          </Text>

          <Text style={styles.hoursText}>
            {subject.hours}
          </Text>
        </View>
      </View>

      <View style={styles.progressBackground}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${subject.progress}%`,
              backgroundColor: subject.color,
            },
          ]}
        />
      </View>

      <View style={styles.subjectFooter}>
        <Text
          style={[
            styles.statusText,
            { color: subject.color },
          ]}
        >
          {subject.status}
        </Text>

        <Text style={styles.absenceText}>
          {subject.note}
        </Text>
      </View>
    </View>
  );
}

function SubjectSection({ subjects: subjectList = [] }) {
  const displaySubjects = subjectList || [];
  return (
    <View style={styles.subjectSection}>
      <View style={styles.subjectSectionHeader}>
        <View style={styles.subjectTitleRow}>
          <MaterialIcons
            name="analytics"
            size={20}
            color={COLORS.primary}
          />

          <Text style={styles.subjectSectionTitle}>
            Subject-Wise Record
          </Text>
        </View>

        <Text style={styles.subjectCount}>
          {displaySubjects.length} Subjects
        </Text>
      </View>

      {displaySubjects.length === 0 ? (
        <View style={styles.emptySubjectsBox}>
          <MaterialIcons name="event-note" size={32} color={COLORS.outline} />
          <Text style={styles.emptySubjectsText}>No subject sessions recorded yet</Text>
        </View>
      ) : (
        displaySubjects.map((subject) => (
          <SubjectCard
            key={subject.code}
            subject={subject}
          />
        ))
      )}
    </View>
  );
}

function BottomNavigation({ navigation }) {
  const items = [
    {
      key: "home",
      icon: "dashboard",
      label: "Home",
      active: false,
    },
    {
      key: "attendance",
      icon: "how-to-reg",
      label: "Attendance",
      active: true,
    },
    {
      key: "materials",
      icon: "menu-book",
      label: "Materials",
      active: false,
    },
    {
      key: "profile",
      icon: "person",
      label: "Profile",
      active: false,
    },
  ];

  return (
    <View className="bottom-nav" style={styles.bottomNav}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.label}
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => {
            if (item.key === "home") navigation?.navigate("StudentDashboard");
            else if (item.key === "attendance") navigation?.navigate("StudentAttendanceDetail");
            else if (item.key === "materials") navigation?.navigate("StudyMaterials");
            else if (item.key === "profile") navigation?.navigate("StudentProfile");
          }}
        >
          <MaterialIcons
            name={item.icon}
            size={24}
            color={
              item.active
                ? COLORS.primary
                : COLORS.textVariant
            }
          />

          <Text
            style={[
              styles.navLabel,
              {
                color: item.active
                  ? COLORS.primary
                  : COLORS.textVariant,
                fontWeight: item.active
                  ? "600"
                  : "500",
              },
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function StudentAttendanceDetail({ navigation }) {
  const { user, profile } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getStudentAttendanceSummary()
      .then((data) => {
        if (isMounted) {
          setSummary(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch student attendance summary:", err);
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Map API subject list to the shape SubjectCard expects
  const liveSubjects = summary?.subjects?.map((s) => ({
    code: s.course_code,
    credits: s.credits || '3 Credits',
    name: s.course_name,
    staff: s.staff_name || 'Faculty',
    percentage: `${parseFloat(s.percentage || 0).toFixed(1)}%`,
    hours: `${s.attended_hours || 0} / ${s.total_hours || 0} hrs`,
    progress: parseFloat(s.percentage || 0),
    status: parseFloat(s.percentage || 0) >= 90 ? 'Status: Excellent'
           : parseFloat(s.percentage || 0) >= 75 ? 'Status: Safe' : 'Status: At Risk',
    note: (s.max_absences_allowed || 0) > 0
           ? `Max Absences Allowed: ${s.max_absences_allowed} more`
           : 'Needs classes to reach 75%',
    color: parseFloat(s.percentage || 0) >= 90 ? COLORS.primary
           : parseFloat(s.percentage || 0) >= 75 ? COLORS.primaryContainer : COLORS.error,
  })) || [];

  const overallPct = summary?.overall_percentage ?? 0;
  const onDutySessions = summary?.od_sessions ?? summary?.on_duty_sessions;
  const canMiss = summary?.subjects?.length
    ? Math.min(...summary.subjects.map((s) => s.max_absences_allowed || 0))
    : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />

      <Header
        navigation={navigation}
        avatarUri={profile?.avatar_url || user?.profile?.avatar_url}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <StudentIdentity profile={profile} user={user} />

        <AttendanceCard
          overallPct={overallPct}
          totalDays={summary?.total_days ?? summary?.total_conducted_days}
          presentDays={summary?.present_days ?? summary?.attended_days ?? summary?.total_attended_days}
          absentDays={summary?.absent_days ?? summary?.total_absent_days}
          onDutyDays={summary?.on_duty_days ?? summary?.od_days}
          onDutySessions={onDutySessions}
          canMiss={canMiss}
        />

        <SubjectSection subjects={liveSubjects} />

        <View style={styles.bottomSpace} />
      </ScrollView>

      <StudentBottomNav activeTab="attendance" navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  contentContainer: {
    paddingTop: 78,
    paddingHorizontal: 16,
    paddingBottom: 90,
  },

  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 70,
    zIndex: 20,
    elevation: 8,
    backgroundColor: COLORS.background,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.03)",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
    backgroundColor: COLORS.surfaceHigh,
  },

  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceLow,
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
  },

  logo: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },

  headerText: {
    marginLeft: 8,
    flex: 1,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  nexus: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
  },

  attendanceTitle: {
    fontSize: 12,
    color: COLORS.textVariant,
    marginLeft: 4,
    fontWeight: "500",
  },

  subtitle: {
    fontSize: 10,
    color: COLORS.textVariant,
    marginTop: 1,
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },

  notificationButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    position: "relative",
  },

  notificationDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    position: "absolute",
    top: 8,
    right: 8,
  },

  profileSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: 6,
    backgroundColor: COLORS.surfaceHigh,
  },

  identityCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  identityTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  studentInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  studentImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: COLORS.surfaceHigh,
    position: "relative",
  },

  studentImage: {
    width: "100%",
    height: "100%",
  },

  verifiedDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
    position: "absolute",
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  studentText: {
    marginLeft: 12,
    flex: 1,
  },

  studentName: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },

  registerNumber: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.textVariant,
    marginTop: 2,
    letterSpacing: 0.5,
  },

  semesterContainer: {
    alignItems: "flex-end",
  },

  semesterBadge: {
    backgroundColor: COLORS.surfaceHigh,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  semesterText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: "600",
  },

  academicYear: {
    fontSize: 11,
    color: COLORS.textVariant,
    marginTop: 4,
  },

  metadataGrid: {
    flexDirection: "row",
    backgroundColor: COLORS.surfaceLow,
    borderRadius: 8,
    padding: 10,
    marginTop: 14,
  },

  metadataItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  metadataLabel: {
    fontSize: 9,
    color: COLORS.textVariant,
    letterSpacing: 1,
    marginBottom: 2,
  },

  metadataValue: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: "600",
  },

  attendanceCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 18,
    marginBottom: 18,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  attendanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionLabel: {
    fontSize: 11,
    color: COLORS.textVariant,
    fontWeight: "600",
    letterSpacing: 1,
  },

  dateText: {
    fontSize: 13,
    color: COLORS.textVariant,
    marginTop: 3,
  },

  safeBadge: {
    backgroundColor: COLORS.surfaceHigh,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
  },

  safeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: 6,
  },

  safeText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.primary,
  },

  gaugeStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },

  gaugeWrapper: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },

  gaugeOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  gaugeTrack: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 10,
    borderColor: COLORS.surfaceHigh,
    alignItems: "center",
    justifyContent: "center",
  },

  gaugeProgress: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 10,
    borderColor: COLORS.primaryContainer,
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
    transform: [{ rotate: "35deg" }],
  },

  gaugeInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
  },

  gaugeText: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },

  gaugePercentage: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },

  aggregate: {
    fontSize: 8,
    fontWeight: "600",
    color: COLORS.textVariant,
    marginTop: 2,
    letterSpacing: 0.5,
  },

  metricGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: 8,
  },

  metricBox: {
    width: "48%",
    backgroundColor: COLORS.surfaceLow,
    borderRadius: 8,
    padding: 8,
    margin: "1%",
  },

  onDutyMetricBox: {
    width: "48%",
    paddingHorizontal: 6,
  },

  onDutyValues: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },

  onDutyValueSection: {
    flex: 1,
  },

  onDutyDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.surfaceHigh,
    marginHorizontal: 4,
  },

  metricLabel: {
    fontSize: 10,
    fontWeight: "500",
  },

  metricValue: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 2,
  },

  metricDescription: {
    fontSize: 9,
    color: COLORS.textVariant,
    marginTop: 1,
  },

  eligibilityBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceHigh,
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },

  eligibilityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  eligibilityTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primary,
  },

  eligibilitySubtitle: {
    fontSize: 11,
    color: COLORS.textVariant,
    marginTop: 2,
  },

  runwayBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.surfaceLow,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },

  runwayTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
  },

  runwayText: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textVariant,
    marginTop: 3,
  },

  highlight: {
    color: COLORS.primary,
    fontWeight: "600",
  },

  subjectSection: {
    marginBottom: 18,
  },

  subjectSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  subjectTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  subjectSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginLeft: 8,
  },

  subjectCount: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },

  subjectCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  subjectTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  codeRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  subjectCode: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "700",
  },

  creditText: {
    fontSize: 12,
    color: COLORS.textVariant,
    marginLeft: 4,
  },

  subjectName: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: "600",
    marginTop: 3,
  },

  staffName: {
    fontSize: 12,
    color: COLORS.textVariant,
    marginTop: 3,
  },

  percentageBox: {
    alignItems: "flex-end",
  },

  subjectPercentage: {
    fontSize: 18,
    fontWeight: "700",
  },

  hoursText: {
    fontSize: 11,
    color: COLORS.textVariant,
    marginTop: 2,
  },

  progressBackground: {
    width: "100%",
    height: 8,
    borderRadius: 5,
    backgroundColor: COLORS.surfaceHigh,
    overflow: "hidden",
    marginTop: 12,
  },

  progressFill: {
    height: "100%",
    borderRadius: 5,
  },

  subjectFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 7,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "500",
  },

  absenceText: {
    fontSize: 11,
    color: COLORS.textVariant,
    flex: 1,
    textAlign: "right",
    marginLeft: 10,
  },

  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceHigh,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    elevation: 15,
  },

  navItem: {
    width: 75,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
  },

  navLabel: {
    fontSize: 10,
    marginTop: 3,
  },

  bottomSpace: {
    height: 20,
  },
  emptySubjectsBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 36,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  emptySubjectsText: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.textVariant,
    fontWeight: "500",
  },
});
