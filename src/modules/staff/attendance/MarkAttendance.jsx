import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from '@/ui';
import { MaterialIcons } from '@/ui';
import Colors from '../../../constants/colors';
import Typography from '../../../constants/typography';
import TopAppBar from '../../../components/common/TopAppBar';
import BottomNavBar from '../../../components/common/BottomNavBar';
import { getSessionRoster, submitAttendance } from '../../../services/api/attendance';
import { useAuth } from '../../auth/context/AuthContext';

const MarkAttendance = ({ navigation, route }) => {
  const { user, profile } = useAuth();
  // Params passed from StaffTimetable when tapping "Mark Attendance"
  const {
    timetableEntryId,
    markingDate,
    subjectName = 'Class Session',
    sectionName = '',
    roomName = '',
  } = route?.params || {};

  const today = new Date().toISOString().split('T')[0];
  const selectedDate = markingDate || today;

  const [roster, setRoster] = useState(null);  // null = not yet loaded
  const [studentStates, setStudentStates] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rosterError, setRosterError] = useState('');

  // ── Fetch session roster from backend ──────────────────────────────────────
  const fetchRoster = useCallback(async () => {
    if (!timetableEntryId) {
      // No params → screen opened directly (dev preview), use demo data
      setStudentStates([
        { id: 'DEMO-001', name: 'Demo Student A', roll_no: '001', status: 'PRESENT' },
        { id: 'DEMO-002', name: 'Demo Student B', roll_no: '002', status: 'ABSENT' },
        { id: 'DEMO-003', name: 'Demo Student C', roll_no: '003', status: 'PRESENT' },
      ]);
      setLoadingRoster(false);
      return;
    }
    setLoadingRoster(true);
    setRosterError('');
    try {
      const data = await getSessionRoster(timetableEntryId, selectedDate);
      setRoster(data);
      // Map backend roster to local editable state
      const mapped = (data.students || []).map((s) => ({
        id: s.student_id,
        name: s.full_name,
        roll_no: s.roll_no,
        status: s.existing_status || 'PRESENT',
      }));
      setStudentStates(mapped);
    } catch (err) {
      setRosterError(err.message || 'Failed to load student roster.');
    } finally {
      setLoadingRoster(false);
    }
  }, [timetableEntryId, selectedDate]);

  useEffect(() => { fetchRoster(); }, [fetchRoster]);

  // ── Toggle status ──────────────────────────────────────────────────────────
  const toggleStatus = (index, newStatus) => {
    setStudentStates((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], status: newStatus };
      return updated;
    });
  };

  // ── Submit attendance ──────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!timetableEntryId) {
      Alert.alert('Demo Mode', 'Open this screen from your timetable to submit real attendance.');
      return;
    }
    setSubmitting(true);
    try {
      const records = studentStates.map((s) => ({
        student_id: s.id,
        status: s.status,
      }));
      await submitAttendance({
        timetable_entry_id: timetableEntryId,
        marking_date: selectedDate,
        records,
      });
      Alert.alert('Success', 'Attendance submitted successfully!', [
        { text: 'OK', onPress: () => navigation?.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Submission Failed', err.message || 'Could not submit attendance. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const statusColors = {
    PRESENT: { bg: '#dcfce7', text: '#166534', icon: 'check-circle' },
    ABSENT: { bg: '#fee2e2', text: '#b91c1c', icon: 'cancel' },
    OD: { bg: '#ffedd5', text: '#c2410c', icon: 'assignment-ind' },
  };

  const presentCount = studentStates.filter((s) => s.status === 'PRESENT').length;
  const absentCount = studentStates.filter((s) => s.status === 'ABSENT').length;
  const odCount = studentStates.filter((s) => s.status === 'OD').length;

  const bottomNavItems = [
    { key: 'home', label: 'Home', icon: 'dashboard' },
    { key: 'attendance', label: 'Attendance', icon: 'how-to-reg' },
    { key: 'notes', label: 'Notes & QP', icon: 'menu-book' },
    { key: 'profile', label: 'Profile', icon: 'person' },
  ];


  return (
    <SafeAreaView style={styles.safeArea}>
      <TopAppBar
        title="Mark Attendance"
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
          {/* Class Info Header */}
          <View style={styles.classInfoCard}>
            <View style={styles.classInfoRow}>
              <View>
                <Text style={styles.className}>{subjectName}</Text>
                <Text style={styles.classDetail}>{sectionName}{roomName ? ` • ${roomName}` : ''}</Text>
              </View>
              <View style={styles.dateBadge}>
                <MaterialIcons name="calendar-today" size={14} color={Colors.primary} />
                <Text style={styles.dateText}>{selectedDate}</Text>
              </View>
            </View>
          </View>

          {/* Loading State */}
          {loadingRoster && (
            <View style={styles.centeredState}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.stateText}>Loading student roster…</Text>
            </View>
          )}

          {/* Error State */}
          {!!rosterError && !loadingRoster && (
            <View style={styles.errorBanner}>
              <MaterialIcons name="error-outline" size={18} color="#b91c1c" />
              <Text style={styles.errorText}>{rosterError}</Text>
              <TouchableOpacity onPress={fetchRoster}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Content when loaded */}
          {!loadingRoster && !rosterError && (
            <>
              {/* Summary Stats */}
              <View style={styles.summaryRow}>
                <View style={[styles.summaryCard, { borderLeftColor: '#22c55e' }]}>
                  <Text style={styles.summaryCount}>{presentCount}</Text>
                  <Text style={styles.summaryLabel}>Present</Text>
                </View>
                <View style={[styles.summaryCard, { borderLeftColor: '#ef4444' }]}>
                  <Text style={styles.summaryCount}>{absentCount}</Text>
                  <Text style={styles.summaryLabel}>Absent</Text>
                </View>
                <View style={[styles.summaryCard, { borderLeftColor: '#f97316' }]}>
                  <Text style={styles.summaryCount}>{odCount}</Text>
                  <Text style={styles.summaryLabel}>OD</Text>
                </View>
              </View>

              {/* Student List */}
              <View style={styles.studentListCard}>
                <View style={styles.studentListHeader}>
                  <Text style={styles.sectionTitle}>Student List</Text>
                  <Text style={styles.totalCount}>{studentStates.length} students</Text>
                </View>
                {studentStates.map((student, index) => {
                  const sc = statusColors[student.status] || statusColors.PRESENT;
                  return (
                    <View key={student.id} style={styles.studentRow}>
                      <View style={styles.studentInfo}>
                        <View style={styles.studentAvatar}>
                          <Text style={styles.studentAvatarText}>{student.name.charAt(0)}</Text>
                        </View>
                        <View>
                          <Text style={styles.studentName}>{student.name}</Text>
                          <Text style={styles.studentId}>{student.roll_no || student.id}</Text>
                        </View>
                      </View>
                      <View style={styles.statusButtons}>
                        <TouchableOpacity
                          style={[styles.statusBtn, student.status === 'PRESENT' && { backgroundColor: statusColors.PRESENT.bg }]}
                          onPress={() => toggleStatus(index, 'PRESENT')}
                        >
                          <MaterialIcons name="check" size={18} color={student.status === 'PRESENT' ? statusColors.PRESENT.text : Colors.outline} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.statusBtn, student.status === 'ABSENT' && { backgroundColor: statusColors.ABSENT.bg }]}
                          onPress={() => toggleStatus(index, 'ABSENT')}
                        >
                          <MaterialIcons name="close" size={18} color={student.status === 'ABSENT' ? statusColors.ABSENT.text : Colors.outline} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.statusBtn, student.status === 'OD' && { backgroundColor: statusColors.OD.bg }]}
                          onPress={() => toggleStatus(index, 'OD')}
                        >
                          <Text style={[styles.odText, student.status === 'OD' && { color: statusColors.OD.text }]}>OD</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, submitting && { opacity: 0.75 }]}
                activeOpacity={0.8}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={Colors.onPrimary} />
                ) : (
                  <>
                    <MaterialIcons name="check-circle" size={20} color={Colors.onPrimary} />
                    <Text style={styles.submitButtonText}>Submit Attendance</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
      <BottomNavBar
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
  centeredState: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  stateText: { fontSize: 14, color: Colors.onSurfaceVariant },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca',
    borderRadius: 10, padding: 12,
  },
  errorText: { flex: 1, fontSize: 13, color: '#b91c1c' },
  retryText: { fontSize: 13, color: Colors.primary, fontWeight: '700' },

  classInfoCard: {
    backgroundColor: Colors.surfaceContainerLowest, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: 'rgba(195,197,215,0.3)', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  classInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  className: { ...Typography.headlineSm, color: Colors.onSurface, fontSize: 18 },
  classDetail: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, marginTop: 4 },
  dateBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surfaceContainer, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  dateText: { ...Typography.labelSm, color: Colors.primary },
  periodRow: { flexDirection: 'row', gap: 8 },
  periodChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8,
    backgroundColor: Colors.surfaceContainerLow, borderWidth: 1, borderColor: Colors.outlineVariant,
  },
  periodChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  periodText: { ...Typography.labelSm, color: Colors.onSurfaceVariant },
  periodTextActive: { color: Colors.onPrimary },
  summaryRow: { flexDirection: 'row', gap: 8 },
  summaryCard: {
    flex: 1, backgroundColor: Colors.surfaceContainerLowest, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: 'rgba(195,197,215,0.3)', borderLeftWidth: 4, alignItems: 'center',
  },
  summaryCount: { ...Typography.headlineMd, color: Colors.onSurface, fontWeight: '700' },
  summaryLabel: { ...Typography.labelSm, color: Colors.onSurfaceVariant, marginTop: 4 },
  studentListCard: {
    backgroundColor: Colors.surfaceContainerLowest, borderRadius: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(195,197,215,0.3)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  studentListHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(195,197,215,0.3)',
  },
  sectionTitle: { ...Typography.headlineSm, color: Colors.onSurface },
  totalCount: { ...Typography.labelSm, color: Colors.onSurfaceVariant },
  studentRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(195,197,215,0.1)',
  },
  studentInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  studentAvatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primaryContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  studentAvatarText: { color: Colors.onPrimaryContainer, fontWeight: '700', fontSize: 14 },
  studentName: { ...Typography.labelMd, color: Colors.onSurface },
  studentId: { ...Typography.labelSm, color: Colors.onSurfaceVariant, fontWeight: '400' },
  statusButtons: { flexDirection: 'row', gap: 4 },
  statusBtn: {
    width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.outlineVariant,
  },
  odText: { ...Typography.labelSm, color: Colors.outline, fontSize: 10 },
  submitButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 12, gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  submitButtonText: { ...Typography.labelMd, color: Colors.onPrimary, fontSize: 16 },
});

export default MarkAttendance;
