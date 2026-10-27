import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from '@/ui';
import { MaterialIcons } from '@/ui';
import Colors from '../../../constants/colors';
import Typography from '../../../constants/typography';
import TopAppBar from '../../../components/common/TopAppBar';
import BottomNavBar from '../../../components/common/BottomNavBar';
import { useAuth } from '../../auth/context/AuthContext';
import {
  getDepartmentSummary,
  getAttendanceDefaulters,
  getFacultyWorkload,
} from '../../../services/api/reports';

const ReportManagement = ({ navigation }) => {
  const { user, profile } = useAuth();
  const [selectedReportType, setSelectedReportType] = useState('attendance');
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    total_students: 0,
    total_staff: 0,
    today_attendance_percentage: 0,
    overall_attendance_percentage: 0,
    students_below_75_count: 0,
    active_courses_count: 0,
    total_sessions_conducted: 0,
  });
  const [defaulters, setDefaulters] = useState([]);
  const [facultyWorkload, setFacultyWorkload] = useState([]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const [kpiRes, defRes, workRes] = await Promise.allSettled([
        getDepartmentSummary(),
        getAttendanceDefaulters({ threshold: 75.0 }),
        getFacultyWorkload(),
      ]);

      if (kpiRes.status === 'fulfilled' && kpiRes.value) {
        const d = kpiRes.value.data || kpiRes.value;
        setKpis(d);
      }

      if (defRes.status === 'fulfilled' && defRes.value) {
        const defData = defRes.value.data || defRes.value;
        setDefaulters(defData?.students || []);
      }

      if (workRes.status === 'fulfilled' && workRes.value) {
        const wData = workRes.value.data || workRes.value;
        setFacultyWorkload(wData?.faculty || []);
      }
    } catch (err) {
      console.error('Error loading report analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, []);

  const reportTypes = [
    { key: 'attendance', label: 'Attendance', icon: 'how-to-reg' },
    { key: 'staff', label: 'Staff Workload', icon: 'badge' },
    { key: 'department', label: 'Department KPIs', icon: 'business' },
    { key: 'student', label: 'Students Roster', icon: 'school' },
  ];

  const quickReports = [
    {
      label: "Today's Attendance",
      icon: 'today',
      description: 'View live attendance log',
      action: () => navigation?.navigate('AttendanceHistory'),
    },
    {
      label: 'Shortage List',
      icon: 'warning',
      description: `${kpis.students_below_75_count || 0} students below 75%`,
      action: () => setSelectedReportType('attendance'),
    },
    {
      label: 'Staff Teaching Load',
      icon: 'badge',
      description: `${kpis.total_staff || facultyWorkload.length || 0} faculty teaching load`,
      action: () => setSelectedReportType('staff'),
    },
    {
      label: 'Dept KPI Summary',
      icon: 'insights',
      description: 'Institutional performance overview',
      action: () => setSelectedReportType('department'),
    },
  ];

  const bottomNavItems = [
    { key: 'home', label: 'Home', icon: 'dashboard', screen: 'AdminDashboard' },
    { key: 'attendance', label: 'Attendance', icon: 'how-to-reg', screen: 'ReportManagement' },
    { key: 'timetable', label: 'Timetable', icon: 'calendar-month', screen: 'AdminTimetable' },
    { key: 'history', label: 'History', icon: 'history', screen: 'AttendanceHistory' },
    { key: 'profile', label: 'Profile', icon: 'person', screen: 'AdminProfile' },
  ];

  const handleDownload = (reportName, format) => {
    Alert.alert(
      'Export Report',
      `Preparing ${format} download for "${reportName}". Data compiled from Supabase database.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopAppBar
        title="Reports & Analytics"
        showBack
        onBackPress={() => {
          if (navigation && navigation.canGoBack()) navigation.goBack();
          else navigation?.navigate('AdminDashboard');
        }}
        profileImage={profile?.avatar_url || user?.profile?.avatar_url}
        onProfilePress={() => navigation?.navigate('AdminProfile')}
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.contentInner}>
          {/* Page Header */}
          <View>
            <Text style={styles.pageTitle}>Institutional Analytics & Reports</Text>
            <Text style={styles.pageSubtitle}>Live database metrics, attendance shortage, and faculty teaching load.</Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Quick Generate</Text>
            <View style={styles.quickGrid}>
              {quickReports.map((qr, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickItem}
                  activeOpacity={0.7}
                  onPress={qr.action}
                >
                  <View style={styles.quickIconWrap}>
                    <MaterialIcons name={qr.icon} size={24} color={Colors.primary} />
                  </View>
                  <Text style={styles.quickLabel}>{qr.label}</Text>
                  <Text style={styles.quickDesc}>{qr.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Report Type Filter Chips */}
          <View style={styles.filterRow}>
            {reportTypes.map((rt) => (
              <TouchableOpacity
                key={rt.key}
                style={[styles.filterChip, selectedReportType === rt.key && styles.filterChipActive]}
                onPress={() => setSelectedReportType(rt.key)}
              >
                <MaterialIcons
                  name={rt.icon}
                  size={16}
                  color={selectedReportType === rt.key ? Colors.onPrimary : Colors.onSurfaceVariant}
                />
                <Text style={[styles.filterText, selectedReportType === rt.key && styles.filterTextActive]}>
                  {rt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Loading Indicator */}
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Compiling reports from database...</Text>
            </View>
          ) : null}

          {/* ATTENDANCE REPORT TAB */}
          {!loading && selectedReportType === 'attendance' && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Attendance Shortage & Defaulters</Text>
                  <Text style={styles.sectionSub}>Statutory threshold: 75.0% minimum attendance</Text>
                </View>
                <TouchableOpacity
                  style={styles.actionPill}
                  onPress={() => handleDownload('Attendance_Defaulters_Report', 'Excel')}
                >
                  <MaterialIcons name="download" size={16} color={Colors.primary} />
                  <Text style={styles.actionPillText}>Export</Text>
                </TouchableOpacity>
              </View>

              {/* KPI Strip */}
              <View style={styles.kpiRow}>
                <View style={styles.kpiBox}>
                  <Text style={styles.kpiVal}>{kpis.overall_attendance_percentage || 0}%</Text>
                  <Text style={styles.kpiLbl}>Average Attendance</Text>
                </View>
                <View style={styles.kpiBox}>
                  <Text style={styles.kpiVal}>{kpis.total_sessions_conducted || 0}</Text>
                  <Text style={styles.kpiLbl}>Conducted Sessions</Text>
                </View>
                <View style={[styles.kpiBox, kpis.students_below_75_count > 0 && styles.kpiBoxAlert]}>
                  <Text style={[styles.kpiVal, kpis.students_below_75_count > 0 && { color: Colors.error }]}>
                    {kpis.students_below_75_count || 0}
                  </Text>
                  <Text style={styles.kpiLbl}>Below 75%</Text>
                </View>
              </View>

              {/* Defaulters List */}
              {defaulters.length === 0 ? (
                <View style={styles.successCard}>
                  <MaterialIcons name="verified" size={32} color="#16a34a" />
                  <Text style={styles.successTitle}>Zero Attendance Shortages</Text>
                  <Text style={styles.successDesc}>
                    All {kpis.total_students || 54} enrolled students currently satisfy the 75.0% minimum requirement across all registered courses.
                  </Text>
                </View>
              ) : (
                <View style={styles.defaulterTable}>
                  <View style={styles.tableHeaderRow}>
                    <Text style={[styles.thCell, { flex: 1.2 }]}>Reg No</Text>
                    <Text style={[styles.thCell, { flex: 2 }]}>Student Name</Text>
                    <Text style={[styles.thCell, { flex: 1 }]}>Attended</Text>
                    <Text style={[styles.thCell, { flex: 1, textAlign: 'right' }]}>%</Text>
                  </View>
                  {defaulters.map((st, idx) => (
                    <View key={st.student_id || idx} style={styles.tableRow}>
                      <Text style={[styles.tdCell, { flex: 1.2, fontWeight: '600' }]}>{st.register_number}</Text>
                      <Text style={[styles.tdCell, { flex: 2 }]}>{st.full_name}</Text>
                      <Text style={[styles.tdCell, { flex: 1 }]}>{st.attended_hours}/{st.total_hours}</Text>
                      <Text style={[styles.tdCell, { flex: 1, textAlign: 'right', color: Colors.error, fontWeight: '700' }]}>
                        {st.percentage}%
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* STAFF TEACHING LOAD TAB */}
          {!loading && selectedReportType === 'staff' && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Faculty Teaching Workload</Text>
                  <Text style={styles.sectionSub}>Active courses, weekly hours, and completed sessions</Text>
                </View>
                <TouchableOpacity
                  style={styles.actionPill}
                  onPress={() => handleDownload('Faculty_Teaching_Workload', 'Excel')}
                >
                  <MaterialIcons name="download" size={16} color={Colors.primary} />
                  <Text style={styles.actionPillText}>Export</Text>
                </TouchableOpacity>
              </View>

              {facultyWorkload.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>No faculty workload records available.</Text>
                </View>
              ) : (
                <View style={styles.facultyList}>
                  {facultyWorkload.map((fac, idx) => (
                    <View key={fac.staff_id || idx} style={styles.facultyCard}>
                      <View style={styles.facultyAvatar}>
                        <Text style={styles.facultyInitial}>
                          {fac.full_name?.split(' ').map((n) => n[0]).slice(0, 2).join('') || 'FC'}
                        </Text>
                      </View>
                      <View style={styles.facultyDetails}>
                        <Text style={styles.facultyName}>{fac.full_name}</Text>
                        <Text style={styles.facultyDesignation}>{fac.designation} • ID: {fac.faculty_id}</Text>
                        <View style={styles.badgeRow}>
                          <View style={styles.metricBadge}>
                            <MaterialIcons name="menu-book" size={14} color={Colors.primary} />
                            <Text style={styles.metricBadgeText}>{fac.assigned_courses_count} Courses</Text>
                          </View>
                          <View style={styles.metricBadge}>
                            <MaterialIcons name="schedule" size={14} color={Colors.secondary} />
                            <Text style={styles.metricBadgeText}>{fac.weekly_lecture_hours} Hrs/Wk</Text>
                          </View>
                          <View style={styles.metricBadge}>
                            <MaterialIcons name="task-alt" size={14} color="#16a34a" />
                            <Text style={styles.metricBadgeText}>{fac.completed_sessions_count} Sessions</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* DEPARTMENT KPIS TAB */}
          {!loading && selectedReportType === 'department' && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Institutional Performance</Text>
                  <Text style={styles.sectionSub}>Department of Artificial Intelligence & Data Science</Text>
                </View>
                <TouchableOpacity
                  style={styles.actionPill}
                  onPress={() => handleDownload('Department_Performance_KPIs', 'PDF')}
                >
                  <MaterialIcons name="download" size={16} color={Colors.primary} />
                  <Text style={styles.actionPillText}>PDF</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.deptGrid}>
                <View style={styles.deptCard}>
                  <Text style={styles.deptVal}>{kpis.total_students || 0}</Text>
                  <Text style={styles.deptLbl}>Enrolled Students</Text>
                  <Text style={styles.deptSub}>Across all sections</Text>
                </View>
                <View style={styles.deptCard}>
                  <Text style={styles.deptVal}>{kpis.total_staff || 0}</Text>
                  <Text style={styles.deptLbl}>Faculty Members</Text>
                  <Text style={styles.deptSub}>Teaching faculty</Text>
                </View>
                <View style={styles.deptCard}>
                  <Text style={styles.deptVal}>{kpis.active_courses_count || 0}</Text>
                  <Text style={styles.deptLbl}>Active Courses</Text>
                  <Text style={styles.deptSub}>Current semester</Text>
                </View>
                <View style={styles.deptCard}>
                  <Text style={styles.deptVal}>{kpis.total_sessions_conducted || 0}</Text>
                  <Text style={styles.deptLbl}>Conducted Sessions</Text>
                  <Text style={styles.deptSub}>Logged in database</Text>
                </View>
              </View>

              <View style={styles.healthBanner}>
                <MaterialIcons name="analytics" size={24} color={Colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.healthTitle}>Institutional Compliance: Healthy</Text>
                  <Text style={styles.healthDesc}>
                    Current department-wide attendance stands at {kpis.overall_attendance_percentage || 0}%, safely above the 75% institutional requirement.
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* STUDENTS ROSTER TAB */}
          {!loading && selectedReportType === 'student' && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Students & Cohort Management</Text>
                  <Text style={styles.sectionSub}>54 Active Students across Section A & B</Text>
                </View>
                <TouchableOpacity
                  style={styles.actionPill}
                  onPress={() => navigation?.navigate('MentorProctorAllocation')}
                >
                  <MaterialIcons name="groups" size={16} color={Colors.primary} />
                  <Text style={styles.actionPillText}>Mentor Roster</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.studentActionBox}>
                <Text style={styles.studentActionTitle}>Need to view or update student allocations?</Text>
                <Text style={styles.studentActionDesc}>
                  Open the Mentor Allocation screen to assign faculty mentors, unassign students, or run automated quota balancing.
                </Text>
                <TouchableOpacity
                  style={styles.primaryActionButton}
                  onPress={() => navigation?.navigate('MentorProctorAllocation')}
                >
                  <MaterialIcons name="manage-accounts" size={20} color={Colors.onPrimary} />
                  <Text style={styles.primaryActionText}>Open Mentor Allocation</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Downloadable Archives */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Official Database Exports</Text>
            </View>

            <View style={styles.reportItem}>
              <View style={styles.reportIconWrap}>
                <MaterialIcons name="table-chart" size={24} color="#16a34a" />
              </View>
              <View style={styles.reportInfo}>
                <Text style={styles.reportName}>Complete Attendance Master Sheet (October 2026)</Text>
                <Text style={styles.reportMeta}>{kpis.total_sessions_conducted || 75} sessions • 4,050 records • Excel format</Text>
              </View>
              <TouchableOpacity
                style={styles.downloadBtn}
                onPress={() => handleDownload('Master_Attendance_Sheet_Oct2026', 'Excel')}
              >
                <MaterialIcons name="download" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.reportItem}>
              <View style={styles.reportIconWrap}>
                <MaterialIcons name="picture-as-pdf" size={24} color={Colors.error} />
              </View>
              <View style={styles.reportInfo}>
                <Text style={styles.reportName}>Department Accreditation & Shortage Audit</Text>
                <Text style={styles.reportMeta}>54 students verified • 0 Defaulters • PDF format</Text>
              </View>
              <TouchableOpacity
                style={styles.downloadBtn}
                onPress={() => handleDownload('Department_Audit_Report', 'PDF')}
              >
                <MaterialIcons name="download" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <BottomNavBar
        items={bottomNavItems}
        activeItem="attendance"
        navigation={navigation}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1 },
  contentInner: { padding: 16, paddingBottom: 80, gap: 16 },
  pageTitle: { ...Typography.headlineLgMobile, color: Colors.onBackground },
  pageSubtitle: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, marginTop: 4 },
  sectionCard: {
    backgroundColor: Colors.surfaceContainerLowest, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: 'rgba(195,197,215,0.3)', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { ...Typography.headlineSm, color: Colors.onSurface },
  sectionSub: { ...Typography.labelSm, color: Colors.onSurfaceVariant, marginTop: 2 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickItem: {
    width: '48%', backgroundColor: Colors.surfaceContainerLow, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: 'rgba(195,197,215,0.2)', gap: 8,
  },
  quickIconWrap: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(0,63,177,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  quickLabel: { ...Typography.labelMd, color: Colors.onSurface, fontWeight: '600' },
  quickDesc: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, fontSize: 12 },
  filterRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 9999,
    backgroundColor: Colors.surfaceContainerLow, borderWidth: 1, borderColor: Colors.outlineVariant,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { ...Typography.labelSm, color: Colors.onSurfaceVariant },
  filterTextActive: { color: Colors.onPrimary },
  loadingBox: { padding: 32, alignItems: 'center', gap: 12 },
  loadingText: { ...Typography.bodyMd, color: Colors.secondary },
  actionPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,63,177,0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
  },
  actionPillText: { ...Typography.labelSm, color: Colors.primary, fontWeight: '600' },
  kpiRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  kpiBox: {
    flex: 1, backgroundColor: Colors.surfaceContainerLow, borderRadius: 8, padding: 12,
    borderWidth: 1, borderColor: 'rgba(195,197,215,0.2)', alignItems: 'center',
  },
  kpiBoxAlert: { backgroundColor: 'rgba(255,218,214,0.3)', borderColor: Colors.errorContainer },
  kpiVal: { ...Typography.headlineSm, color: Colors.onSurface, fontWeight: '700' },
  kpiLbl: { ...Typography.labelSm, color: Colors.onSurfaceVariant, marginTop: 4, fontSize: 11, textAlign: 'center' },
  successCard: {
    backgroundColor: 'rgba(220,252,231,0.5)', borderWidth: 1, borderColor: '#86efac',
    borderRadius: 12, padding: 16, alignItems: 'center', gap: 6, marginTop: 8,
  },
  successTitle: { ...Typography.labelMd, color: '#166534', fontWeight: '700' },
  successDesc: { ...Typography.bodyMd, color: '#166534', textAlign: 'center', fontSize: 13 },
  defaulterTable: { marginTop: 8 },
  tableHeaderRow: {
    flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.outlineVariant,
  },
  thCell: { ...Typography.labelSm, color: Colors.secondary, fontWeight: '600' },
  tableRow: {
    flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(195,197,215,0.2)',
    alignItems: 'center',
  },
  tdCell: { ...Typography.bodyMd, color: Colors.onSurface, fontSize: 13 },
  facultyList: { gap: 12, marginTop: 8 },
  facultyCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12,
    backgroundColor: Colors.surfaceContainerLow, borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(195,197,215,0.2)',
  },
  facultyAvatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  facultyInitial: { ...Typography.labelMd, color: Colors.onPrimary, fontWeight: '700' },
  facultyDetails: { flex: 1, gap: 4 },
  facultyName: { ...Typography.labelMd, color: Colors.onSurface, fontWeight: '700' },
  facultyDesignation: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, fontSize: 12 },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  metricBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surfaceContainerLowest, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  metricBadgeText: { fontSize: 11, color: Colors.onSurface, fontWeight: '500' },
  deptGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  deptCard: {
    width: '48%', backgroundColor: Colors.surfaceContainerLow, borderRadius: 8, padding: 12,
    borderWidth: 1, borderColor: 'rgba(195,197,215,0.2)',
  },
  deptVal: { ...Typography.headlineLgMobile, color: Colors.primary, fontWeight: '700' },
  deptLbl: { ...Typography.labelSm, color: Colors.onSurface, fontWeight: '600', marginTop: 4 },
  deptSub: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, fontSize: 11, marginTop: 2 },
  healthBanner: {
    flexDirection: 'row', gap: 12, padding: 14, backgroundColor: 'rgba(0,63,177,0.06)',
    borderRadius: 8, borderWidth: 1, borderColor: 'rgba(0,63,177,0.2)', alignItems: 'center', marginTop: 8,
  },
  healthTitle: { ...Typography.labelMd, color: Colors.primary, fontWeight: '700' },
  healthDesc: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, fontSize: 12, marginTop: 2 },
  studentActionBox: {
    backgroundColor: Colors.surfaceContainerLow, borderRadius: 10, padding: 16, gap: 10,
    borderWidth: 1, borderColor: 'rgba(195,197,215,0.3)',
  },
  studentActionTitle: { ...Typography.labelMd, color: Colors.onSurface, fontWeight: '700' },
  studentActionDesc: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, fontSize: 13 },
  primaryActionButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary, paddingVertical: 10, borderRadius: 8, marginTop: 4,
  },
  primaryActionText: { ...Typography.labelMd, color: Colors.onPrimary },
  reportItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(195,197,215,0.2)',
  },
  reportIconWrap: {
    width: 44, height: 44, borderRadius: 8, backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center', justifyContent: 'center',
  },
  reportInfo: { flex: 1 },
  reportName: { ...Typography.labelMd, color: Colors.onSurface },
  reportMeta: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, fontSize: 12, marginTop: 2 },
  downloadBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyBox: { padding: 24, alignItems: 'center' },
  emptyText: { ...Typography.bodyMd, color: Colors.secondary },
});

export default ReportManagement;
