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
import { useAuth } from '../../auth/context/AuthContext';
import { getAttendanceHistory, reviewAttendanceSession } from '../../../services/api/attendance';

export default function AdminAttendanceReview({ navigation }) {
  const { user, profile } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedDept, setSelectedDept] = useState('all');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inspectSession, setInspectSession] = useState(null);

  const fetchSessions = () => {
    setLoading(true);
    getAttendanceHistory({ limit: 50 })
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.data || res?.sessions || []);
        if (list) {
          const mapped = list.map((item) => ({
            id: item.id,
            course: item.course || `${item.course_code || item.subject_code || 'SUB'}: ${item.course_name || item.subject_name || 'Class Session'}`,
            course_code: item.course_code || item.subject_code || 'SUB',
            course_name: item.course_name || item.subject_name || 'Class Session',
            staff: item.staff || item.marked_by_name || 'Faculty Member',
            department: item.department_name || (item.course_code?.startsWith('CS') ? 'CSE' : 'Engineering'),
            section: item.section_name || 'Section A',
            date: item.date || item.marking_date || 'Today',
            period: item.period || (item.period_number ? `Period ${item.period_number}` : 'Class Session'),
            present: item.present_count !== undefined ? item.present_count : (item.present || 0),
            absent: item.absent_count !== undefined ? item.absent_count : 0,
            od: item.od_count !== undefined ? item.od_count : 0,
            total: item.total_count || item.total || item.total_students || 40,
            status: (item.status || 'pending').toLowerCase(),
            records: item.records || [],
          }));
          setRecords(mapped);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch attendance sessions for review:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleReviewAction = async (sessionRecord, action) => {
    try {
      await reviewAttendanceSession(sessionRecord.id, action);
      setRecords((prev) =>
        prev.map((r) => (r.id === sessionRecord.id ? { ...r, status: action.toLowerCase() } : r))
      );
    } catch (err) {
      console.error('Failed to update review status:', err);
    }
  };

  const filters = [
    { key: 'all', label: 'All Sessions' },
    { key: 'pending', label: 'Pending Review' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ];

  const departments = ['all', 'CSE', 'ECE', 'MECH', 'AIDS', 'IT'];

  const filteredRecords = records.filter((r) => {
    const matchesStatus = selectedFilter === 'all' || r.status === selectedFilter;
    const matchesDept = selectedDept === 'all' || r.department.toUpperCase().includes(selectedDept);
    return matchesStatus && matchesDept;
  });

  const statusStyles = {
    pending: { bg: '#fef08a', text: '#854d0e', label: 'Pending Review' },
    submitted: { bg: '#fef08a', text: '#854d0e', label: 'Pending Review' },
    approved: { bg: '#dcfce7', text: '#166534', label: 'Approved' },
    rejected: { bg: '#fee2e2', text: '#b91c1c', label: 'Rejected' },
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopAppBar
        title="Admin Attendance Review"
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
          {/* Header Banner */}
          <View style={styles.headerBanner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.pageTitle}>Institutional Attendance Oversight</Text>
              <Text style={styles.pageSubtitle}>
                Review, audit, and approve faculty-marked class attendance across campus departments.
              </Text>
            </View>
            <TouchableOpacity style={styles.refreshBtn} onPress={fetchSessions} activeOpacity={0.8}>
              <MaterialIcons name="refresh" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Status Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
            <View style={styles.filterRow}>
              {filters.map((f) => (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.filterChip, selectedFilter === f.key && styles.filterChipActive]}
                  onPress={() => setSelectedFilter(f.key)}
                >
                  <Text style={[styles.filterText, selectedFilter === f.key && styles.filterTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Department Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
            <View style={styles.filterRow}>
              {departments.map((dept) => (
                <TouchableOpacity
                  key={dept}
                  style={[styles.deptChip, selectedDept === dept && styles.deptChipActive]}
                  onPress={() => setSelectedDept(dept)}
                >
                  <Text style={[styles.deptChipText, selectedDept === dept && styles.deptChipTextActive]}>
                    {dept === 'all' ? 'All Depts' : dept}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Content Body */}
          {loading ? (
            <View style={styles.centeredState}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.stateText}>Loading department attendance sessions...</Text>
            </View>
          ) : filteredRecords.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="event-available" size={48} color={Colors.outline} />
              <Text style={styles.emptyTitle}>No Sessions Found</Text>
              <Text style={styles.emptySubtitle}>
                There are no attendance sessions matching the selected filter criteria.
              </Text>
            </View>
          ) : (
            <View style={styles.recordsList}>
              {filteredRecords.map((record) => {
                const badge = statusStyles[record.status] || statusStyles.pending;
                const pct = record.total > 0 ? Math.round((record.present / record.total) * 100) : 0;
                return (
                  <View key={record.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{record.course}</Text>
                        <View style={styles.cardMetaRow}>
                          <Text style={styles.cardFaculty}>By {record.staff}</Text>
                          <Text style={styles.cardDivider}>•</Text>
                          <Text style={styles.cardDept}>{record.department} ({record.section})</Text>
                        </View>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                        <Text style={[styles.statusText, { color: badge.text }]}>{badge.label}</Text>
                      </View>
                    </View>

                    {/* Class Details Row */}
                    <View style={styles.detailsRow}>
                      <View style={styles.detailItem}>
                        <MaterialIcons name="calendar-today" size={15} color={Colors.onSurfaceVariant} />
                        <Text style={styles.detailText}>{record.date}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <MaterialIcons name="schedule" size={15} color={Colors.onSurfaceVariant} />
                        <Text style={styles.detailText}>{record.period}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <MaterialIcons name="people" size={15} color={Colors.primary} />
                        <Text style={[styles.detailText, { fontWeight: '700', color: Colors.primary }]}>
                          {record.present}/{record.total} ({pct}%)
                        </Text>
                      </View>
                    </View>

                    {/* Card Actions */}
                    <View style={styles.cardActions}>
                      {record.records && record.records.length > 0 && (
                        <TouchableOpacity
                          style={styles.rosterBtn}
                          onPress={() => setInspectSession(record)}
                          activeOpacity={0.8}
                        >
                          <MaterialIcons name="visibility" size={16} color={Colors.primary} />
                          <Text style={styles.rosterBtnText}>View Roster ({record.records.length})</Text>
                        </TouchableOpacity>
                      )}

                      <View style={styles.actionButtonsGroup}>
                        {record.status !== 'approved' && (
                          <TouchableOpacity
                            style={[styles.actionBtn, styles.approveBtn]}
                            onPress={() => handleReviewAction(record, 'APPROVED')}
                            activeOpacity={0.8}
                          >
                            <MaterialIcons name="check" size={16} color="#ffffff" />
                            <Text style={styles.approveBtnText}>Approve</Text>
                          </TouchableOpacity>
                        )}
                        {record.status !== 'rejected' && (
                          <TouchableOpacity
                            style={[styles.actionBtn, styles.rejectBtn]}
                            onPress={() => handleReviewAction(record, 'REJECTED')}
                            activeOpacity={0.8}
                          >
                            <MaterialIcons name="close" size={16} color="#b91c1c" />
                            <Text style={styles.rejectBtnText}>Reject</Text>
                          </TouchableOpacity>
                        )}
                      </View>
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
          transparent
          animationType="fade"
          onRequestClose={() => setInspectSession(null)}
        >
          <View style={styles.modalOverlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setInspectSession(null)} />
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>{inspectSession.course_name}</Text>
                  <Text style={styles.modalSubtitle}>
                    {inspectSession.date} • {inspectSession.period} • {inspectSession.staff}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setInspectSession(null)}>
                  <MaterialIcons name="close" size={22} color={Colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                <View style={{ gap: 8, paddingVertical: 8 }}>
                  {inspectSession.records.map((r, idx) => (
                    <View key={idx} style={styles.rosterRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rosterStudentName}>{r.student_name}</Text>
                        <Text style={styles.rosterStudentRoll}>{r.roll_number || `ID: ${r.student_id}`}</Text>
                      </View>
                      <View style={[
                        styles.rosterBadge,
                        r.status === 'PRESENT' && { backgroundColor: '#dcfce7' },
                        r.status === 'ABSENT' && { backgroundColor: '#fee2e2' },
                        r.status === 'OD' && { backgroundColor: '#ffedd5' },
                      ]}>
                        <Text style={[
                          styles.rosterBadgeText,
                          r.status === 'PRESENT' && { color: '#166534' },
                          r.status === 'ABSENT' && { color: '#b91c1c' },
                          r.status === 'OD' && { color: '#c2410c' },
                        ]}>
                          {r.status}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1 },
  contentInner: { padding: 16, paddingBottom: 60, gap: 16 },
  headerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
  },
  pageTitle: { ...Typography.headlineSmall, color: Colors.onSurface, fontWeight: '700' },
  pageSubtitle: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant, marginTop: 4 },
  refreshBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.surfaceVariant,
    marginLeft: 12,
  },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 4 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.surfaceVariant,
  },
  filterChipActive: { backgroundColor: Colors.primary },
  filterText: { fontSize: 13, color: Colors.onSurfaceVariant, fontWeight: '500' },
  filterTextActive: { color: Colors.onPrimary, fontWeight: '700' },
  deptChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  deptChipActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  deptChipText: { fontSize: 12, color: '#4b5563', fontWeight: '500' },
  deptChipTextActive: { color: '#1d4ed8', fontWeight: '700' },
  centeredState: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  stateText: { fontSize: 14, color: Colors.onSurfaceVariant },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.onSurface },
  emptySubtitle: { fontSize: 13, color: Colors.onSurfaceVariant, textAlign: 'center', maxWidth: 300 },
  recordsList: { gap: 12 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    gap: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.onSurface },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  cardFaculty: { fontSize: 13, color: Colors.onSurfaceVariant },
  cardDivider: { fontSize: 13, color: Colors.outline },
  cardDept: { fontSize: 13, color: Colors.primary, fontWeight: '500' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '700' },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 8,
  },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  detailText: { fontSize: 12, color: Colors.onSurfaceVariant },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  rosterBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 6 },
  rosterBtnText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  actionButtonsGroup: { flexDirection: 'row', gap: 8, marginLeft: 'auto' },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  approveBtn: { backgroundColor: '#166534' },
  approveBtnText: { fontSize: 12, color: '#ffffff', fontWeight: '700' },
  rejectBtn: { backgroundColor: '#fee2e2' },
  rejectBtnText: { fontSize: 12, color: '#b91c1c', fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    padding: 18,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: Colors.onSurface },
  modalSubtitle: { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 2 },
  rosterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  rosterStudentName: { fontSize: 13, fontWeight: '600', color: Colors.onSurface },
  rosterStudentRoll: { fontSize: 11, color: Colors.onSurfaceVariant },
  rosterBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  rosterBadgeText: { fontSize: 11, fontWeight: '700' },
});

