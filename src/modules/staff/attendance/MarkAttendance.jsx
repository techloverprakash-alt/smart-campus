import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from '@/ui';
import { MaterialIcons } from '@/ui';
import Colors from '../../../constants/colors';
import Typography from '../../../constants/typography';
import TopAppBar from '../../../components/common/TopAppBar';
import BottomNavBar from '../../../components/common/BottomNavBar';
import { getSessionRoster, submitAttendance } from '../../../services/api/attendance';
import { getTodaySchedule } from '../../../services/api/timetable';
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

  const [activeEntryId, setActiveEntryId] = useState(timetableEntryId ? Number(timetableEntryId) : null);
  const [periods, setPeriods] = useState([]);
  const [roster, setRoster] = useState(null);  // null = not yet loaded
  const [studentStates, setStudentStates] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rosterError, setRosterError] = useState('');

  // ── Load faculty periods for today/schedule ─────────────────────────────────
  const loadSchedule = useCallback(() => {
    getTodaySchedule()
      .then((data) => {
        if (data?.schedule && data.schedule.length > 0) {
          setPeriods(data.schedule);
          if (!activeEntryId) {
            setActiveEntryId(Number(data.schedule[0].id));
          }
        }
      })
      .catch((err) => console.log('Could not load today schedule:', err));
  }, [activeEntryId]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  // ── Fetch session roster from backend ──────────────────────────────────────
  const fetchRoster = useCallback(async () => {
    setLoadingRoster(true);
    setRosterError('');
    try {
      const data = await getSessionRoster(activeEntryId, selectedDate);
      if (data) {
        setRoster(data);
        if (!activeEntryId && data.timetable_entry_id) {
          setActiveEntryId(Number(data.timetable_entry_id));
        }
        // Map backend roster to local editable state
        const mapped = (data.students || []).map((s) => ({
          id: s.student_id,
          name: s.full_name,
          roll_no: s.roll_no,
          status: s.existing_status || 'PRESENT',
        }));
        setStudentStates(mapped);
      }
    } catch (err) {
      setRosterError(err.message || 'Failed to load student roster from database.');
    } finally {
      setLoadingRoster(false);
    }
  }, [activeEntryId, selectedDate]);

  useEffect(() => { fetchRoster(); }, [fetchRoster]);

  const isAlreadyMarked = Boolean(roster?.is_already_marked);

  // ── Toggle status ──────────────────────────────────────────────────────────
  const toggleStatus = (index, newStatus) => {
    if (isAlreadyMarked) {
      Alert.alert(
        'Attendance Locked',
        'Attendance for this session has already been recorded and submitted to the institutional registry. It cannot be altered.'
      );
      return;
    }
    setStudentStates((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], status: newStatus };
      return updated;
    });
  };

  // ── Submit attendance ──────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (isAlreadyMarked) {
      Alert.alert(
        'Submission Blocked',
        'Attendance for this session is already submitted. Duplicate submissions are not permitted.',
        [
          { text: 'View Class History', onPress: () => navigation?.navigate('StaffAttendanceHistory') },
          { text: 'OK' },
        ]
      );
      return;
    }

    const targetEntryId = activeEntryId || roster?.timetable_entry_id;
    if (!targetEntryId) {
      Alert.alert('Selection Required', 'No timetable period selected for attendance.');
      return;
    }
    if (studentStates.length === 0) {
      Alert.alert('Empty Roster', 'No students enrolled to submit attendance.');
      return;
    }
    setSubmitting(true);
    try {
      const records = studentStates.map((s) => ({
        student_id: s.id,
        status: s.status,
      }));
      await submitAttendance({
        timetable_entry_id: Number(targetEntryId),
        marking_date: selectedDate,
        records,
      });

      // Update local roster marked state
      setRoster((prev) => (prev ? { ...prev, is_already_marked: true, session_status: 'SUBMITTED' } : prev));
      loadSchedule();

      Alert.alert(
        'Attendance Submitted',
        'Attendance records have been stored in the database and submitted for administrative review.',
        [
          { text: 'View Attendance History', onPress: () => navigation?.navigate('StaffAttendanceHistory') },
          { text: 'Done', onPress: () => navigation?.goBack() },
        ]
      );
    } catch (err) {
      Alert.alert(
        'Submission Failed',
        err.message || 'Could not submit attendance. The session may already be marked.'
      );
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

  const displayCourseName = roster?.course_name
    ? `${roster.course_code}: ${roster.course_name}`
    : subjectName;
  const displaySection = roster?.section_name || sectionName || 'Class Section';
  const displayRoom = roster?.room_name || roomName;

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
              <View style={{ flex: 1 }}>
                <Text style={styles.className}>{displayCourseName}</Text>
                <Text style={styles.classDetail}>{displaySection}{displayRoom ? ` • ${displayRoom}` : ''}</Text>
              </View>
              <View style={styles.dateBadge}>
                <MaterialIcons name="calendar-today" size={14} color={Colors.primary} />
                <Text style={styles.dateText}>{selectedDate}</Text>
              </View>
            </View>

            {/* Period Switcher if faculty has multiple periods */}
            {periods.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
                <View style={styles.periodRow}>
                  {periods.map((p) => {
                    const isSelected = String(p.id) === String(activeEntryId);
                    const isMarked = Boolean(p.attendance_marked);
                    return (
                      <TouchableOpacity
                        key={p.id}
                        style={[
                          styles.periodChip,
                          isSelected && styles.periodChipActive,
                          isMarked && !isSelected && styles.periodChipMarked,
                        ]}
                        onPress={() => setActiveEntryId(Number(p.id))}
                        activeOpacity={0.7}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          {isMarked && (
                            <MaterialIcons
                              name="check-circle"
                              size={13}
                              color={isSelected ? '#ffffff' : '#16a34a'}
                            />
                          )}
                          <Text style={[styles.periodText, isSelected && styles.periodTextActive]}>
                            {p.period}: {p.code || p.course_code || 'Slot'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            )}
          </View>

          {/* Locked / Already Submitted Alert Banner */}
          {isAlreadyMarked && (
            <View style={styles.lockedBanner}>
              <View style={styles.lockedIconWrap}>
                <MaterialIcons name="lock" size={20} color="#15803d" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.lockedTitle}>Attendance Submitted & Locked</Text>
                <Text style={styles.lockedSubtitle}>
                  Attendance for this class period has already been recorded and submitted. Further changes or duplicate submissions are blocked.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.lockedActionBtn}
                onPress={() => navigation?.navigate('StaffAttendanceHistory')}
                activeOpacity={0.8}
              >
                <MaterialIcons name="history" size={15} color="#15803d" />
                <Text style={styles.lockedActionText}>History</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Loading State */}
          {loadingRoster && (
            <View style={styles.centeredState}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.stateText}>Loading student roster from database…</Text>
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
                  <View>
                    <Text style={styles.sectionTitle}>Student List</Text>
                    {isAlreadyMarked && (
                      <Text style={styles.readOnlyNote}>Read-only mode (submitted)</Text>
                    )}
                  </View>
                  <Text style={styles.totalCount}>{studentStates.length} students</Text>
                </View>
                {studentStates.map((student, index) => {
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
                          style={[
                            styles.statusBtn,
                            student.status === 'PRESENT' && { backgroundColor: statusColors.PRESENT.bg, borderColor: '#86efac' },
                            isAlreadyMarked && student.status !== 'PRESENT' && styles.statusBtnDisabled,
                          ]}
                          onPress={() => toggleStatus(index, 'PRESENT')}
                          disabled={isAlreadyMarked}
                          activeOpacity={isAlreadyMarked ? 1 : 0.7}
                        >
                          <MaterialIcons
                            name="check"
                            size={18}
                            color={student.status === 'PRESENT' ? statusColors.PRESENT.text : Colors.outline}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.statusBtn,
                            student.status === 'ABSENT' && { backgroundColor: statusColors.ABSENT.bg, borderColor: '#fca5a5' },
                            isAlreadyMarked && student.status !== 'ABSENT' && styles.statusBtnDisabled,
                          ]}
                          onPress={() => toggleStatus(index, 'ABSENT')}
                          disabled={isAlreadyMarked}
                          activeOpacity={isAlreadyMarked ? 1 : 0.7}
                        >
                          <MaterialIcons
                            name="close"
                            size={18}
                            color={student.status === 'ABSENT' ? statusColors.ABSENT.text : Colors.outline}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.statusBtn,
                            student.status === 'OD' && { backgroundColor: statusColors.OD.bg, borderColor: '#fdba74' },
                            isAlreadyMarked && student.status !== 'OD' && styles.statusBtnDisabled,
                          ]}
                          onPress={() => toggleStatus(index, 'OD')}
                          disabled={isAlreadyMarked}
                          activeOpacity={isAlreadyMarked ? 1 : 0.7}
                        >
                          <Text
                            style={[
                              styles.odText,
                              student.status === 'OD' && { color: statusColors.OD.text, fontWeight: '700' },
                            ]}
                          >
                            OD
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Submit Button */}
              {isAlreadyMarked ? (
                <View style={styles.lockedSubmitCard}>
                  <View style={styles.lockedSubmitRow}>
                    <MaterialIcons name="check-circle" size={22} color="#16a34a" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.lockedSubmitTitle}>Attendance Already Submitted</Text>
                      <Text style={styles.lockedSubmitSub}>
                        Records are locked to prevent duplicate submissions.
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.historyBtn}
                    onPress={() => navigation?.navigate('StaffAttendanceHistory')}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons name="history" size={18} color="#ffffff" />
                    <Text style={styles.historyBtnText}>View Class History</Text>
                  </TouchableOpacity>
                </View>
              ) : (
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
              )}
            </>
          )}
        </View>
      </ScrollView>
      <BottomNavBar items={bottomNavItems} activeItem="mark" navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1 },
  contentInner: { padding: 16, paddingBottom: 88, gap: 16 },
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
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
    backgroundColor: Colors.surfaceContainerLow, borderWidth: 1, borderColor: Colors.outlineVariant,
  },
  periodChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  periodChipMarked: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  periodText: { ...Typography.labelSm, color: Colors.onSurfaceVariant },
  periodTextActive: { color: Colors.onPrimary },

  lockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  lockedIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedTitle: { fontSize: 14, fontWeight: '700', color: '#166534' },
  lockedSubtitle: { fontSize: 12, color: '#15803d', marginTop: 2 },
  lockedActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  lockedActionText: { fontSize: 12, color: '#166534', fontWeight: '700' },

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
  readOnlyNote: { fontSize: 11, color: '#166534', fontWeight: '600', marginTop: 2 },
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
  statusBtnDisabled: {
    opacity: 0.35,
  },
  odText: { ...Typography.labelSm, color: Colors.outline, fontSize: 10 },

  submitButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 12, gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  submitButtonText: { ...Typography.labelMd, color: Colors.onPrimary, fontSize: 16 },

  lockedSubmitCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    gap: 12,
  },
  lockedSubmitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  lockedSubmitTitle: { fontSize: 15, fontWeight: '700', color: '#166534' },
  lockedSubmitSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#003fb1',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  historyBtnText: { color: '#ffffff', fontWeight: '600', fontSize: 14 },
});

export default MarkAttendance;
