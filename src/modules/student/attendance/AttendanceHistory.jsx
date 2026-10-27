import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from '@/ui';
import { MaterialIcons } from '@/ui';
import Colors from '../../../constants/colors';
import Typography from '../../../constants/typography';
import TopAppBar from '../../../components/common/TopAppBar';
import BottomNavBar from '../../../components/common/BottomNavBar';
import StudentBottomNav from '../../../components/common/StudentBottomNav';
import { useAuth } from '../../auth/context/AuthContext';
import { getAttendanceHistory } from '../../../services/api/attendance';

const AttendanceHistory = ({ navigation }) => {
  const { user, profile } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const months = ['All', 'October', 'September'];

  useEffect(() => {
    let isMounted = true;
    getAttendanceHistory({ limit: 100 })
      .then((data) => {
        if (isMounted) {
          const list = Array.isArray(data) ? data : data?.sessions || [];
          setSessions(list);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch attendance history:', err);
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredSessions = sessions.filter((s) => {
    if (selectedMonth === 'All') return true;
    if (!s.date) return false;
    const d = new Date(s.date);
    const monthName = d.toLocaleString('en-US', { month: 'long' });
    return monthName.toLowerCase() === selectedMonth.toLowerCase();
  });

  // Calculate dynamic summary stats
  const totalSessionsCount = filteredSessions.length;
  const workingDays = new Set(filteredSessions.map((s) => s.date)).size;

  let avgAttendance = 0;
  if (totalSessionsCount > 0) {
    if (user?.role === 'STUDENT') {
      const attendedCount = filteredSessions.filter(
        (s) => s.status === 'PRESENT' || s.status === 'ON_DUTY'
      ).length;
      avgAttendance = Math.round((attendedCount / totalSessionsCount) * 100);
    } else {
      const totalPct = filteredSessions.reduce((acc, s) => {
        const pct = s.total_count > 0 ? (s.present_count / s.total_count) * 100 : 100;
        return acc + pct;
      }, 0);
      avgAttendance = Math.round(totalPct / totalSessionsCount);
    }
  }

  // Group by date
  const groupedByDate = filteredSessions.reduce((acc, s) => {
    const dateKey = s.date;
    if (!acc[dateKey]) {
      const d = new Date(s.date);
      const dateFormatted = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      acc[dateKey] = {
        date: dateFormatted,
        day: s.day || d.toLocaleDateString('en-US', { weekday: 'long' }),
        entries: [],
      };
    }
    acc[dateKey].entries.push(s);
    return acc;
  }, {});
  const historyData = Object.values(groupedByDate);

  const bottomNavItems = [
    { key: 'home', label: 'Home', icon: 'dashboard', screen: 'AdminDashboard' },
    { key: 'attendance', label: 'Attendance', icon: 'how-to-reg', screen: 'ReportManagement' },
    { key: 'timetable', label: 'Timetable', icon: 'calendar-month', screen: 'AdminTimetable' },
    { key: 'history', label: 'History', icon: 'history', screen: 'AttendanceHistory' },
    { key: 'profile', label: 'Profile', icon: 'person', screen: 'AdminProfile' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopAppBar
        title="Attendance History"
        showBack
        onBackPress={() => {
          if (navigation && navigation.canGoBack()) navigation.goBack();
          else if (user?.role === 'STUDENT') navigation?.navigate('StudentDashboard');
          else if (user?.role === 'STAFF') navigation?.navigate('StaffDashboard');
          else navigation?.navigate('AdminDashboard');
        }}
        profileImage={profile?.avatar_url || user?.profile?.avatar_url}
        onProfilePress={() => {
          if (user?.role === 'STUDENT') navigation?.navigate('StudentProfile');
          else if (user?.role === 'STAFF') navigation?.navigate('StaffProfile');
          else navigation?.navigate('AdminProfile');
        }}
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.contentInner}>
          {/* Page Header */}
          <View>
            <Text style={styles.pageTitle}>Attendance History</Text>
            <Text style={styles.pageSubtitle}>View past attendance records from database.</Text>
          </View>

          {/* Month Selector */}
          <View style={styles.monthRow}>
            {months.map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.monthChip, selectedMonth === m && styles.monthChipActive]}
                onPress={() => setSelectedMonth(m)}
              >
                <Text style={[styles.monthText, selectedMonth === m && styles.monthTextActive]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Summary Stats */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{totalSessionsCount > 0 ? `${avgAttendance}%` : '—'}</Text>
              <Text style={styles.summaryLabel}>Avg. Attendance</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{workingDays}</Text>
              <Text style={styles.summaryLabel}>Working Days</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{totalSessionsCount}</Text>
              <Text style={styles.summaryLabel}>Sessions</Text>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 32 }} />
          ) : historyData.length === 0 ? (
            <View style={styles.emptyCard}>
              <MaterialIcons name="event-busy" size={40} color={Colors.onSurfaceVariant} />
              <Text style={styles.emptyText}>No attendance records found for this period.</Text>
            </View>
          ) : (
            historyData.map((dateGroup, index) => (
              <View key={index} style={styles.dateGroup}>
                <View style={styles.dateHeader}>
                  <View style={styles.dateIconWrap}>
                    <MaterialIcons name="calendar-today" size={16} color={Colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.dateTitle}>{dateGroup.date}</Text>
                    <Text style={styles.dateDay}>{dateGroup.day}</Text>
                  </View>
                </View>

                {dateGroup.entries.map((entry, eIdx) => {
                  const percentage = entry.total_count > 0
                    ? Math.round((entry.present_count / entry.total_count) * 100)
                    : 100;
                  const studentStatus = entry.status;
                  const isPresent = studentStatus === 'PRESENT';
                  const isOD = studentStatus === 'ON_DUTY';
                  const isAbsent = studentStatus === 'ABSENT';

                  return (
                    <View key={entry.id || eIdx} style={styles.entryCard}>
                      <View style={styles.entryHeader}>
                        <View style={{ flex: 1, paddingRight: 8 }}>
                          <Text style={styles.entryCourse}>
                            {entry.course_code ? `${entry.course_code}: ` : ''}{entry.course_name}
                          </Text>
                          <Text style={styles.entryMeta}>{entry.period} • {entry.staff_name}</Text>
                          {entry.topic_covered ? (
                            <Text style={styles.entryTopic} numberOfLines={1}>
                              Topic: {entry.topic_covered}
                            </Text>
                          ) : null}
                        </View>
                        <View style={styles.entryStats}>
                          {studentStatus ? (
                            <View
                              style={[
                                styles.statusBadge,
                                isPresent && styles.badgePresent,
                                isOD && styles.badgeOD,
                                isAbsent && styles.badgeAbsent,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.statusBadgeText,
                                  isPresent && styles.badgeTextPresent,
                                  isOD && styles.badgeTextOD,
                                  isAbsent && styles.badgeTextAbsent,
                                ]}
                              >
                                {isOD ? 'ON DUTY' : studentStatus}
                              </Text>
                            </View>
                          ) : (
                            <Text style={styles.entryCount}>
                              {entry.present_count}/{entry.total_count}
                            </Text>
                          )}
                          <Text
                            style={[
                              styles.entryPercentage,
                              { color: percentage >= 75 ? '#16a34a' : Colors.error },
                            ]}
                          >
                            {percentage}% class
                          </Text>
                        </View>
                      </View>
                      <View style={styles.progressBarBg}>
                        <View
                          style={[
                            styles.progressBarFill,
                            {
                              width: `${percentage}%`,
                              backgroundColor: percentage >= 75 ? '#22c55e' : Colors.error,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            ))
          )}
        </View>
      </ScrollView>
      {user?.role === 'STUDENT' ? (
        <StudentBottomNav
          activeTab="attendance"
          navigation={navigation}
        />
      ) : (
        <BottomNavBar
          items={bottomNavItems}
          activeItem="history"
          navigation={navigation}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1 },
  contentInner: { padding: 16, paddingBottom: 80, gap: 16 },
  pageTitle: { ...Typography.headlineLgMobile, color: Colors.onBackground },
  pageSubtitle: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, marginTop: 4 },
  monthRow: { flexDirection: 'row', gap: 8 },
  monthChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 9999,
    backgroundColor: Colors.surfaceContainerLow, borderWidth: 1, borderColor: Colors.outlineVariant,
  },
  monthChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  monthText: { ...Typography.labelSm, color: Colors.onSurfaceVariant },
  monthTextActive: { color: Colors.onPrimary },
  summaryRow: { flexDirection: 'row', gap: 8 },
  summaryCard: {
    flex: 1, backgroundColor: Colors.surfaceContainerLowest, borderRadius: 12, padding: 12, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(195,197,215,0.3)',
  },
  summaryValue: { ...Typography.headlineMd, color: Colors.primary, fontWeight: '700' },
  summaryLabel: { ...Typography.labelSm, color: Colors.onSurfaceVariant, marginTop: 4, textAlign: 'center' },
  dateGroup: { gap: 8 },
  dateHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  dateIconWrap: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,63,177,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  dateTitle: { ...Typography.labelMd, color: Colors.onSurface, fontWeight: '600' },
  dateDay: { ...Typography.labelSm, color: Colors.onSurfaceVariant, fontWeight: '400' },
  entryCard: {
    backgroundColor: Colors.surfaceContainerLowest, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: 'rgba(195,197,215,0.3)', gap: 12, marginLeft: 18,
    borderLeftWidth: 2, borderLeftColor: Colors.primaryFixed,
  },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  entryCourse: { ...Typography.labelMd, color: Colors.onSurface, fontWeight: '600' },
  entryMeta: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, fontSize: 12, marginTop: 2 },
  entryTopic: { ...Typography.bodyMd, color: Colors.primary, fontSize: 11, marginTop: 3, fontStyle: 'italic' },
  entryStats: { alignItems: 'flex-end' },
  entryCount: { ...Typography.labelMd, color: Colors.onSurface },
  entryPercentage: { ...Typography.labelSm, marginTop: 4, fontSize: 11 },
  progressBarBg: { height: 6, backgroundColor: Colors.surfaceContainerHighest, borderRadius: 3 },
  progressBarFill: { height: 6, borderRadius: 3 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePresent: { backgroundColor: '#dcfce7' },
  badgeOD: { backgroundColor: '#ffedd5' },
  badgeAbsent: { backgroundColor: '#fee2e2' },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  badgeTextPresent: { color: '#16a34a' },
  badgeTextOD: { color: '#c2410c' },
  badgeTextAbsent: { color: '#dc2626' },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(195,197,215,0.3)',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
});

export default AttendanceHistory;
