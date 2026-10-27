import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, SafeAreaView, ActivityIndicator } from '@/ui';
import { MaterialIcons } from '@/ui';
import Colors from '../../../constants/colors';
import Typography from '../../../constants/typography';
import TopAppBar from '../../../components/common/TopAppBar';
import BottomNavBar from '../../../components/common/BottomNavBar';
import { getTodaySchedule } from '../../../services/api/timetable';
import { getAttendanceHistory } from '../../../services/api/attendance';
import { useAuth } from '../../auth/context/AuthContext';

const MOCK_CLASSES = [
  { id: null, start_time: '10:00', subject_name: 'CS-101: Data Structures', section_name: 'B.Tech Sem 3', room_name: 'Room 402', attendance_marked: false },
  { id: null, start_time: '08:30', subject_name: 'CS-305: Algorithms', section_name: 'B.Tech Sem 5', room_name: 'Room 301', attendance_marked: true },
];

const MOCK_HISTORY = [
  { name: 'CS-305: Algorithms', time: 'Today, 09:30 AM', present: '42/45' },
  { name: 'CS-101: Data Structures', time: 'Yesterday, 10:00 AM', present: '38/40' },
  { name: 'Lab: Python basics', time: 'Yesterday, 02:00 PM', present: '20/20' },
];

const StaffDashboard = ({ navigation }) => {
  const { user, profile } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [historyList, setHistoryList] = useState(MOCK_HISTORY);

  // Load today's timetable and attendance history from backend
  useEffect(() => {
    getTodaySchedule()
      .then((data) => {
        const slots = (data?.schedule || data || []).filter(
          (s) => !s.is_break && s.id && !s.id.startsWith('empty-')
        );
        setSchedule(slots);
        setLoadingSchedule(false);
      })
      .catch(() => {
        setSchedule(MOCK_CLASSES);
        setLoadingSchedule(false);
      });

    getAttendanceHistory({ limit: 3 })
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.sessions || [];
        if (list.length > 0) {
          const mapped = list.map((item) => ({
            name: `${item.course_code || ''}: ${item.course_name || 'Class'}`.trim(),
            time: item.date || 'Recent',
            present: `${item.present_count || 0}/${item.total_students || 0}`,
          }));
          setHistoryList(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const bottomNavItems = [
    { key: 'home', label: 'Home', icon: 'dashboard' },
    { key: 'attendance', label: 'Attendance', icon: 'how-to-reg' },
    { key: 'notes', label: 'Notes & QP', icon: 'menu-book' },
    { key: 'profile', label: 'Profile', icon: 'person' },
  ];

  // Compute stat cards from live schedule
  const todayCount = schedule.length;
  const markedCount = schedule.filter((c) => c.attendance_marked).length;
  const markedProgress = todayCount > 0 ? Math.round((markedCount / todayCount) * 100) : 0;

  const statCards = [
    { label: 'MY CLASSES', value: String(user?.profile?.total_assigned_classes || 4), icon: 'class', iconBg: 'rgba(26, 86, 219, 0.1)', iconColor: Colors.primary },
    { label: "TODAY'S CLASSES", value: String(todayCount), icon: 'today', iconBg: 'rgba(26, 219, 103, 0.1)', iconColor: Colors.primary },
    { label: 'ATTENDANCE MARKED', value: String(markedCount), subValue: `/ ${todayCount}`, icon: 'fact-check', iconBg: 'rgba(19, 83, 216, 0.1)', iconColor: Colors.surfaceTint, progress: markedProgress },
    { label: 'SHORTAGE ALERTS', value: '—', icon: 'warning', iconBg: 'rgba(255, 218, 214, 0.3)', iconColor: Colors.error, isError: true },
  ];

  const recentHistory = historyList;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Staff header navigation is rendered in top app header */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.contentInner}>
          {/* Stat Cards Grid */}
          <View style={styles.statGrid}>
            {statCards.map((card, index) => (
              <View key={index} style={styles.statCard}>
                <View style={styles.statCardHeader}>
                  <Text style={[styles.statLabel, card.isError && { color: Colors.error }]}>{card.label}</Text>
                  <View style={[styles.statIconWrap, { backgroundColor: card.iconBg }]}>
                    <MaterialIcons name={card.icon} size={20} color={card.iconColor} />
                  </View>
                </View>
                <View style={styles.statValueRow}>
                  <Text style={[styles.statValue, card.isError && { color: Colors.error }]}>{card.value}</Text>
                  {card.subValue && <Text style={styles.statSubValue}>{card.subValue}</Text>}
                </View>
                {card.progress !== undefined && (
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${card.progress}%` }]} />
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Student & Faculty Services Quick Banner */}
          <TouchableOpacity
            style={{
              backgroundColor: '#eff6ff',
              borderRadius: 12,
              padding: 14,
              borderWidth: 1,
              borderColor: '#bfdbfe',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
            activeOpacity={0.85}
            onPress={() => navigation?.navigate('StudentFacultyPortal', { role: 'STAFF', from: 'staff' })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialIcons name="support-agent" size={22} color="#ffffff" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#1e3a8a' }}>Student & Faculty Portal</Text>
                  <View style={{ backgroundColor: '#dbeafe', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#1d4ed8' }}>CAMPUS HUB</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 11, color: '#4b5563', marginTop: 2 }}>
                  Lab repairs, infrastructure tickets & Lost & Found desk
                </Text>
              </View>
            </View>
            <MaterialIcons name="arrow-forward" size={18} color="#2563eb" />
          </TouchableOpacity>

          {/* Upcoming Classes */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionCardHeader}>
              <Text style={styles.sectionTitle}>Upcoming Classes</Text>
              <TouchableOpacity>
                <Text style={styles.viewLink}>View Schedule</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.sectionCardBody}>
              {loadingSchedule ? (
                <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 16 }} />
              ) : schedule.map((cls, index) => {
                // Map TimetableSlotItem fields from backend
                const entryId = cls.id;
                const hasMarked = cls.attendance_status === 'MARKED' || cls.attendance_marked;
                const needsMark = !hasMarked && cls.status !== 'COMPLETED';
                const startTime = cls.start_time || '—';
                // Backend uses course_name; mock uses subject_name/name
                const subjectLabel = cls.course_name || cls.subject_name || cls.name || 'Class';
                const roomLabel = cls.room || cls.room_name || '';
                const sectionLabel = cls.section_name || cls.detail || '';
                const detail = sectionLabel + (roomLabel ? ` • ${roomLabel}` : '');
                return (
                  <View key={index} style={[styles.classItem, hasMarked && { opacity: 0.7 }]}>
                    <View style={styles.classLeft}>
                      <View style={styles.timeBox}>
                        <Text style={styles.timeText}>{startTime.toString().slice(0, 5)}</Text>
                      </View>
                      <View>
                        <Text style={styles.className}>{subjectLabel}</Text>
                        <Text style={styles.classDetail}>{detail}</Text>
                      </View>
                    </View>
                    {needsMark ? (
                      <TouchableOpacity
                        style={styles.markButton}
                        onPress={() => navigation.navigate('MarkAttendance', {
                          timetableEntryId: entryId,
                          subjectName: subjectLabel,
                          sectionName: sectionLabel,
                          roomName: roomLabel,
                          markingDate: new Date().toISOString().split('T')[0],
                        })}
                        activeOpacity={0.8}
                      >
                        <MaterialIcons name="edit-document" size={16} color={Colors.onPrimary} />
                        <Text style={styles.markButtonText}>Mark Attendance</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.markedBadge}>
                        <MaterialIcons name="check-circle" size={16} color={Colors.surfaceTint} />
                        <Text style={styles.markedText}>Marked</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          {/* Recent History */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionCardHeader}>
              <Text style={styles.sectionTitle}>Recent History</Text>
            </View>
            {recentHistory.map((item, index) => (
              <View key={index} style={styles.historyItem}>
                <View>
                  <Text style={styles.historyName}>{item.name}</Text>
                  <Text style={styles.historyTime}>{item.time}</Text>
                </View>
                <View style={styles.historyRight}>
                  <Text style={styles.historyPresent}>{item.present}</Text>
                  <Text style={styles.historyLabel}>Present</Text>
                </View>
              </View>
            ))}
            <View style={styles.viewAllFooter}>
              <TouchableOpacity>
                <Text style={styles.viewLink}>View All History</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <BottomNavBar
        activeItem="home"
        navigation={navigation}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1 },
  contentInner: { padding: 16, paddingBottom: 80, gap: 16 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCard: {
    width: '48%', backgroundColor: Colors.surfaceContainerLowest, borderRadius: 12,
    padding: 16, borderWidth: 1, borderColor: 'rgba(195,197,215,0.3)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  statCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  statLabel: { ...Typography.labelSm, color: Colors.onSurfaceVariant, letterSpacing: 1, flex: 1 },
  statIconWrap: { padding: 6, borderRadius: 8 },
  statValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 8 },
  statValue: { ...Typography.headlineLg, color: Colors.onSurface },
  statSubValue: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  progressBarBg: { width: '100%', height: 6, backgroundColor: Colors.surfaceVariant, borderRadius: 3, marginTop: 8 },
  progressBarFill: { height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  sectionCard: {
    backgroundColor: Colors.surfaceContainerLowest, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(195,197,215,0.3)', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  sectionCardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(195,197,215,0.3)',
    backgroundColor: 'rgba(250,248,255,0.5)',
  },
  sectionTitle: { ...Typography.headlineSm, color: Colors.onSurface },
  viewLink: { ...Typography.labelMd, color: Colors.primary },
  sectionCardBody: { padding: 16, gap: 12 },
  classItem: {
    flexDirection: 'column', padding: 16, borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(195,197,215,0.3)', backgroundColor: Colors.surfaceContainerLow, gap: 12,
  },
  classLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  timeBox: {
    backgroundColor: Colors.surfaceVariant, borderRadius: 8, padding: 12,
    alignItems: 'center', minWidth: 60,
  },
  timeText: { ...Typography.labelSm, color: Colors.onSurfaceVariant },
  periodText: { ...Typography.labelSm, color: Colors.onSurfaceVariant },
  className: { ...Typography.headlineSm, color: Colors.onSurface, fontSize: 16 },
  classDetail: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  markButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8, height: 40,
  },
  markButtonText: { ...Typography.labelMd, color: Colors.onPrimary },
  markedBadge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: 'rgba(19,83,216,0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8,
  },
  markedText: { ...Typography.labelMd, color: Colors.surfaceTint },
  historyItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(195,197,215,0.3)',
  },
  historyName: { ...Typography.labelMd, color: Colors.onSurface },
  historyTime: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, fontSize: 12, marginTop: 4 },
  historyRight: { alignItems: 'flex-end' },
  historyPresent: { ...Typography.labelMd, color: Colors.onSurface },
  historyLabel: { ...Typography.bodyMd, color: Colors.surfaceTint, fontSize: 12, marginTop: 4 },
  viewAllFooter: {
    padding: 12, borderTopWidth: 1, borderTopColor: 'rgba(195,197,215,0.3)',
    alignItems: 'center', backgroundColor: 'rgba(250,248,255,0.5)',
  },
});

export default StaffDashboard;
