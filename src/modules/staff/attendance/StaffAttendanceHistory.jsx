import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Pressable,
} from '@/ui';
import { MaterialIcons } from '@/ui';
import Colors from '../../../constants/colors';
import Typography from '../../../constants/typography';
import TopAppBar from '../../../components/common/TopAppBar';
import BottomNavBar from '../../../components/common/BottomNavBar';
import { useAuth } from '../../auth/context/AuthContext';
import { getAttendanceHistory } from '../../../services/api/attendance';

export default function StaffAttendanceHistory({ navigation }) {
  const { user, profile } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inspectSession, setInspectSession] = useState(null);
  const [modalFilter, setModalFilter] = useState('all');

  const fetchHistory = () => {
    setLoading(true);
    getAttendanceHistory({ limit: 50 })
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.data || res?.sessions || []);
        if (list) {
          const mapped = list.map((item) => {
            const courseCode = item.course_code || item.subject_code || (item.course ? item.course.split(':')[0].trim() : 'SUB');
            const courseName = item.course_name || item.subject_name || (item.course ? item.course.split(':')[1]?.trim() : 'Class Session');
            const present = item.present_count !== undefined ? item.present_count : (item.present || 0);
            const absent = item.absent_count !== undefined ? item.absent_count : 0;
            const od = item.od_count !== undefined ? item.od_count : 0;
            const total = item.total_count || item.total || item.total_students || (present + absent + od) || 40;
            const status = (item.status || 'submitted').toLowerCase();

            return {
              id: item.id,
              course: item.course || `${courseCode}: ${courseName}`,
              course_code: courseCode,
              course_name: courseName,
              department: item.department_name || 'CSE',
              section: item.section_name || 'CSE-A',
              date: item.date || item.marking_date || 'Today',
              period: item.period || (item.period_number ? `Period ${item.period_number}` : 'Class Session'),
              period_number: item.period_number || 1,
              present,
              absent,
              od,
              total,
              status,
              records: item.records || [],
            };
          });
          setRecords(mapped);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load faculty attendance history:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHistory();
  }, [profile]);

  // Unique course codes for filtering
  const courseOptions = ['all', ...Array.from(new Set(records.map((r) => r.course_code).filter(Boolean)))];

  const statusFilters = [
    { key: 'all', label: 'All Sessions' },
    { key: 'submitted', label: 'Pending Review' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ];

  const filteredRecords = records.filter((r) => {
    const matchesStatus =
      selectedFilter === 'all' ||
      (selectedFilter === 'submitted' && (r.status === 'submitted' || r.status === 'pending')) ||
      r.status === selectedFilter;
    const matchesCourse = selectedCourse === 'all' || r.course_code === selectedCourse;
    return matchesStatus && matchesCourse;
  });

  // Calculate overall summary metrics for this staff's classes
  const totalClasses = records.length;
  const totalStudentsMarked = records.reduce((acc, r) => acc + r.total, 0);
  const totalPresentMarked = records.reduce((acc, r) => acc + r.present, 0);
  const totalOdMarked = records.reduce((acc, r) => acc + r.od, 0);
  const avgTurnout = totalStudentsMarked > 0 ? Math.round(((totalPresentMarked + totalOdMarked) / totalStudentsMarked) * 100) : 0;
  const approvedCount = records.filter((r) => r.status === 'approved').length;

  const statusStyles = {
    pending: { bg: '#fef08a', text: '#854d0e', label: 'Pending Review' },
    submitted: { bg: '#fef08a', text: '#854d0e', label: 'Pending Review' },
    approved: { bg: '#dcfce7', text: '#166534', label: 'Approved' },
    rejected: { bg: '#fee2e2', text: '#b91c1c', label: 'Rejected' },
  };

  const bottomNavItems = [
    { key: 'home', label: 'Home', icon: 'dashboard', screen: 'StaffDashboard' },
    { key: 'mark', label: 'Mark Class', icon: 'how-to-reg', screen: 'MarkAttendance' },
    { key: 'history', label: 'My History', icon: 'history', screen: 'StaffAttendanceHistory' },
    { key: 'timetable', label: 'Timetable', icon: 'push-pin', screen: 'StaffTimetable' },
    { key: 'profile', label: 'Profile', icon: 'person', screen: 'StaffProfile' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopAppBar
        title="Class Attendance History"
        showBack
        onBackPress={() => {
          if (navigation && navigation.canGoBack()) navigation.goBack();
          else navigation?.navigate('StaffDashboard');
        }}
        profileImage={profile?.avatar_url || user?.profile?.avatar_url}
        onProfilePress={() => navigation?.navigate('StaffProfile')}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.contentInner}>
          {/* Header Banner */}
          <View style={styles.headerCard}>
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.pageTitle}>Class Attendance History</Text>
                <Text style={styles.pageSubtitle}>
                  Log of attendance sessions marked for your assigned courses and sections.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.markNewBtn}
                onPress={() => navigation?.navigate('MarkAttendance')}
                activeOpacity={0.8}
              >
                <MaterialIcons name="add" size={18} color="#ffffff" />
                <Text style={styles.markNewBtnText}>Mark Attendance</Text>
              </TouchableOpacity>
            </View>

            {/* KPI Cards */}
            <View style={styles.kpiGrid}>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiValue}>{totalClasses}</Text>
                <Text style={styles.kpiLabel}>Classes Marked</Text>
              </View>
              <View style={styles.kpiCard}>
                <Text style={[styles.kpiValue, { color: avgTurnout >= 75 ? '#16a34a' : '#d97706' }]}>
                  {avgTurnout}%
                </Text>
                <Text style={styles.kpiLabel}>Avg Turnout</Text>
              </View>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiValue}>{totalOdMarked}</Text>
                <Text style={styles.kpiLabel}>Total ODs</Text>
              </View>
              <View style={styles.kpiCard}>
                <Text style={[styles.kpiValue, { color: '#003fb1' }]}>{approvedCount}</Text>
                <Text style={styles.kpiLabel}>Approved</Text>
              </View>
            </View>
          </View>

          {/* Status Filter Chips */}
          <View style={styles.filterSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              {statusFilters.map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.filterChip, selectedFilter === tab.key && styles.filterChipActive]}
                  onPress={() => setSelectedFilter(tab.key)}
                >
                  <Text style={[styles.filterText, selectedFilter === tab.key && styles.filterTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Course Subject Filter Chips */}
          {courseOptions.length > 2 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
              <View style={styles.courseChipRow}>
                {courseOptions.map((course) => (
                  <TouchableOpacity
                    key={course}
                    style={[styles.courseChip, selectedCourse === course && styles.courseChipActive]}
                    onPress={() => setSelectedCourse(course)}
                  >
                    <Text style={[styles.courseChipText, selectedCourse === course && styles.courseChipTextActive]}>
                      {course === 'all' ? 'All Subjects' : course}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}

          {/* Loading State */}
          {loading ? (
            <View style={styles.centeredState}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.stateText}>Loading your class attendance history...</Text>
            </View>
          ) : filteredRecords.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="history-edu" size={54} color={Colors.outline} />
              <Text style={styles.emptyTitle}>No Class Sessions Found</Text>
              <Text style={styles.emptySubtitle}>
                {records.length === 0
                  ? "You haven't marked attendance for any class sessions yet."
                  : 'No attendance sessions match the selected filter.'}
              </Text>
              <TouchableOpacity
                style={styles.emptyActionBtn}
                onPress={() => navigation?.navigate('MarkAttendance')}
              >
                <MaterialIcons name="how-to-reg" size={18} color="#ffffff" />
                <Text style={styles.emptyActionText}>Mark First Class Attendance</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.recordsList}>
              {filteredRecords.map((record) => {
                const badge = statusStyles[record.status] || statusStyles.submitted;
                const pct = record.total > 0 ? Math.round(((record.present + record.od) / record.total) * 100) : 0;
                return (
                  <View key={record.id} style={styles.sessionCard}>
                    {/* Card Top: Course Title & Status Badge */}
                    <View style={styles.cardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.courseTitle}>{record.course}</Text>
                        <View style={styles.metaRow}>
                          <View style={styles.metaBadge}>
                            <MaterialIcons name="group" size={13} color={Colors.primary} />
                            <Text style={styles.metaBadgeText}>{record.section}</Text>
                          </View>
                          <View style={styles.metaBadge}>
                            <MaterialIcons name="domain" size={13} color={Colors.secondary} />
                            <Text style={styles.metaBadgeText}>{record.department}</Text>
                          </View>
                        </View>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                        <Text style={[styles.statusText, { color: badge.text }]}>{badge.label}</Text>
                      </View>
                    </View>

                    {/* Class Details: Date & Period */}
                    <View style={styles.detailsRow}>
                      <View style={styles.detailItem}>
                        <MaterialIcons name="calendar-today" size={15} color={Colors.onSurfaceVariant} />
                        <Text style={styles.detailText}>{record.date}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <MaterialIcons name="schedule" size={15} color={Colors.onSurfaceVariant} />
                        <Text style={styles.detailText}>{record.period}</Text>
                      </View>
                    </View>

                    {/* Headcount Breakdown Pill Row */}
                    <View style={styles.headcountRow}>
                      <View style={[styles.headcountPill, { backgroundColor: '#dcfce7' }]}>
                        <MaterialIcons name="check-circle" size={14} color="#166534" />
                        <Text style={[styles.headcountLabel, { color: '#166534' }]}>
                          Present: {record.present}
                        </Text>
                      </View>
                      <View style={[styles.headcountPill, { backgroundColor: '#fee2e2' }]}>
                        <MaterialIcons name="cancel" size={14} color="#b91c1c" />
                        <Text style={[styles.headcountLabel, { color: '#b91c1c' }]}>
                          Absent: {record.absent}
                        </Text>
                      </View>
                      {record.od > 0 && (
                        <View style={[styles.headcountPill, { backgroundColor: '#ffedd5' }]}>
                          <MaterialIcons name="assignment-ind" size={14} color="#c2410c" />
                          <Text style={[styles.headcountLabel, { color: '#c2410c' }]}>
                            OD: {record.od}
                          </Text>
                        </View>
                      )}
                      <View style={[styles.headcountPill, { backgroundColor: Colors.surfaceContainerHigh }]}>
                        <Text style={[styles.headcountLabel, { color: Colors.onSurface }]}>
                          Turnout: {pct}%
                        </Text>
                      </View>
                    </View>

                    {/* Inspect Roster Button */}
                    <View style={styles.cardFooter}>
                      <TouchableOpacity
                        style={styles.inspectBtn}
                        onPress={() => {
                          setInspectSession(record);
                          setModalFilter('all');
                        }}
                        activeOpacity={0.8}
                      >
                        <MaterialIcons name="visibility" size={16} color={Colors.primary} />
                        <Text style={styles.inspectBtnText}>
                          View Student Roster ({record.records?.length || record.total})
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Roster Inspection Modal */}
      {inspectSession && (
        <Modal
          visible={Boolean(inspectSession)}
          animationType="slide"
          transparent
          onRequestClose={() => setInspectSession(null)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setInspectSession(null)}>
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>{inspectSession.course}</Text>
                  <Text style={styles.modalSubtitle}>
                    {inspectSession.section} • {inspectSession.date} • {inspectSession.period}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setInspectSession(null)} style={styles.closeBtn}>
                  <MaterialIcons name="close" size={20} color={Colors.onSurface} />
                </TouchableOpacity>
              </View>

              {/* Modal Filter Tabs */}
              <View style={styles.modalFilterRow}>
                {['all', 'PRESENT', 'ABSENT', 'OD'].map((statusKey) => {
                  const label = statusKey === 'all' ? 'All' : statusKey === 'PRESENT' ? 'Present' : statusKey === 'ABSENT' ? 'Absent' : 'On-Duty';
                  const count =
                    statusKey === 'all'
                      ? inspectSession.records?.length || 0
                      : (inspectSession.records || []).filter((r) => r.status?.toUpperCase() === statusKey).length;
                  const isActive = modalFilter === statusKey;
                  return (
                    <TouchableOpacity
                      key={statusKey}
                      style={[styles.modalFilterChip, isActive && styles.modalFilterChipActive]}
                      onPress={() => setModalFilter(statusKey)}
                    >
                      <Text style={[styles.modalFilterText, isActive && styles.modalFilterTextActive]}>
                        {label} ({count})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Student Roster List */}
              <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
                {(inspectSession.records || []).filter(
                  (r) => modalFilter === 'all' || r.status?.toUpperCase() === modalFilter
                ).length === 0 ? (
                  <View style={{ padding: 24, alignItems: 'center' }}>
                    <Text style={{ fontSize: 13, color: Colors.onSurfaceVariant }}>
                      No students found for this status.
                    </Text>
                  </View>
                ) : (
                  (inspectSession.records || [])
                    .filter((r) => modalFilter === 'all' || r.status?.toUpperCase() === modalFilter)
                    .map((st, idx) => {
                      const stStatus = (st.status || 'PRESENT').toUpperCase();
                      const isPres = stStatus === 'PRESENT';
                      const isAbs = stStatus === 'ABSENT';
                      const isOd = stStatus === 'OD';
                      return (
                        <View key={st.student_id || idx} style={styles.rosterStudentRow}>
                          <View style={styles.studentAvatar}>
                            <Text style={styles.avatarLetter}>
                              {(st.student_name || 'S').charAt(0).toUpperCase()}
                            </Text>
                          </View>
                          <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={styles.rosterStudentName}>{st.student_name || 'Student'}</Text>
                            <Text style={styles.rosterStudentRoll}>{st.roll_no || `ID: ${st.student_id}`}</Text>
                          </View>
                          <View
                            style={[
                              styles.rosterStatusBadge,
                              isPres && { backgroundColor: '#dcfce7' },
                              isAbs && { backgroundColor: '#fee2e2' },
                              isOd && { backgroundColor: '#ffedd5' },
                            ]}
                          >
                            <Text
                              style={[
                                styles.rosterStatusText,
                                isPres && { color: '#166534' },
                                isAbs && { color: '#b91c1c' },
                                isOd && { color: '#c2410c' },
                              ]}
                            >
                              {isPres ? 'Present' : isAbs ? 'Absent' : 'On-Duty'}
                            </Text>
                          </View>
                        </View>
                      );
                    })
                )}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      )}

      <BottomNavBar items={bottomNavItems} activeItem="history" navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  content: { flex: 1 },
  contentInner: { padding: 16, paddingBottom: 88, gap: 14 },

  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  pageTitle: { ...Typography.headlineSm, color: '#0f172a', fontWeight: '700', fontSize: 19 },
  pageSubtitle: { ...Typography.bodyMd, color: '#64748b', marginTop: 3, fontSize: 13 },
  markNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#003fb1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  markNewBtnText: { color: '#ffffff', fontWeight: '600', fontSize: 13 },

  kpiGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  kpiValue: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  kpiLabel: { fontSize: 11, color: '#64748b', marginTop: 2, textAlign: 'center' },

  filterSection: { marginVertical: 2 },
  filterScroll: { flexDirection: 'row', gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterChipActive: { backgroundColor: '#003fb1', borderColor: '#003fb1' },
  filterText: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  filterTextActive: { color: '#ffffff', fontWeight: '600' },

  courseChipRow: { flexDirection: 'row', gap: 8 },
  courseChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
  },
  courseChipActive: { backgroundColor: '#dbeafe' },
  courseChipText: { fontSize: 12, color: '#475569', fontWeight: '500' },
  courseChipTextActive: { color: '#1d4ed8', fontWeight: '700' },

  centeredState: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  stateText: { fontSize: 14, color: '#64748b' },

  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  emptySubtitle: { fontSize: 13, color: '#64748b', textAlign: 'center', maxWidth: 320 },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#003fb1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  emptyActionText: { color: '#ffffff', fontWeight: '600', fontSize: 13 },

  recordsList: { gap: 12 },
  sessionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  courseTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  metaRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  metaBadgeText: { fontSize: 11, color: '#475569', fontWeight: '600' },
  statusBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '700' },

  detailsRow: { flexDirection: 'row', gap: 16 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 12, color: '#64748b' },

  headcountRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  headcountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  headcountLabel: { fontSize: 12, fontWeight: '600' },

  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  inspectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  inspectBtnText: { fontSize: 13, color: '#003fb1', fontWeight: '600' },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: '80%',
    padding: 16,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 10,
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  modalSubtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
  closeBtn: { padding: 4 },
  modalFilterRow: { flexDirection: 'row', gap: 6 },
  modalFilterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
  },
  modalFilterChipActive: { backgroundColor: '#003fb1' },
  modalFilterText: { fontSize: 12, color: '#475569', fontWeight: '500' },
  modalFilterTextActive: { color: '#ffffff', fontWeight: '600' },

  modalList: { maxHeight: 380 },
  rosterStudentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  studentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { color: '#3730a3', fontWeight: '700', fontSize: 13 },
  rosterStudentName: { fontSize: 13, fontWeight: '600', color: '#0f172a' },
  rosterStudentRoll: { fontSize: 11, color: '#64748b' },
  rosterStatusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  rosterStatusText: { fontSize: 11, fontWeight: '700' },
});

