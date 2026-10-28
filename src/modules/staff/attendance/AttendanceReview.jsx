import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from '@/ui';
import { MaterialIcons } from '@/ui';
import Colors from '../../../constants/colors';
import Typography from '../../../constants/typography';
import TopAppBar from '../../../components/common/TopAppBar';
import BottomNavBar from '../../../components/common/BottomNavBar';
import { useAuth } from '../../auth/context/AuthContext';
import { getAttendanceHistory, reviewAttendanceSession } from '../../../services/api/attendance';

const AttendanceReview = ({ navigation }) => {
  const { user, profile } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getAttendanceHistory({ limit: 30 })
      .then((res) => {
        if (isMounted) {
          const list = Array.isArray(res) ? res : (res?.data || res?.sessions || []);
          if (list.length > 0) {
            const mapped = list.map((item) => ({
              id: item.id,
              course: item.course || `${item.course_code || item.subject_code || 'SUB'}: ${item.course_name || item.subject_name || 'Class Session'}`,
              staff: item.staff || item.marked_by_name || profile?.full_name || 'Faculty Member',
              date: item.date || item.marking_date || 'Today',
              period: item.period || (item.period_number ? `Period ${item.period_number}` : 'Class Session'),
              present: item.present_count !== undefined ? item.present_count : (item.present !== undefined ? item.present : 0),
              total: item.total_count || item.total || item.total_students || 40,
              status: (item.status || 'pending').toLowerCase(),
            }));
            setRecords(mapped);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        console.log('Failed to fetch attendance history:', err);
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [profile]);

  const handleReviewAction = async (sessionRecord, action) => {
    try {
      await reviewAttendanceSession(sessionRecord.id, action);
      setRecords((prev) =>
        prev.map((r) => (r.id === sessionRecord.id ? { ...r, status: action } : r))
      );
    } catch (err) {
      console.error('Failed to update review status:', err);
    }
  };

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ];

  const filteredRecords = selectedFilter === 'all'
    ? records
    : records.filter((r) => r.status === selectedFilter);

  const statusStyles = {
    pending: { bg: '#fef08a', text: '#854d0e', label: 'Pending' },
    approved: { bg: '#dcfce7', text: '#166534', label: 'Approved' },
    rejected: { bg: '#fee2e2', text: '#b91c1c', label: 'Rejected' },
  };

  const bottomNavItems = [
    { key: 'home', label: 'Home', icon: 'dashboard' },
    { key: 'attendance', label: 'Attendance', icon: 'how-to-reg' },
    { key: 'history', label: 'History', icon: 'calendar-month' },
    { key: 'profile', label: 'Profile', icon: 'person' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopAppBar
        title="Attendance Review"
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
          {/* Page Header */}
          <View>
            <Text style={styles.pageTitle}>Attendance Review</Text>
            <Text style={styles.pageSubtitle}>Review and approve submitted attendance records.</Text>
          </View>

          {/* Filter Chips */}
          <View style={styles.filterRow}>
            {filters.map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterChip, selectedFilter === f.key && styles.filterChipActive]}
                onPress={() => setSelectedFilter(f.key)}
              >
                <Text style={[styles.filterText, selectedFilter === f.key && styles.filterTextActive]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Loading Indicator */}
          {loading && (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={{ marginTop: 12, color: Colors.onSurfaceVariant, fontSize: 14 }}>
                Loading attendance history from database…
              </Text>
            </View>
          )}

          {/* Empty State */}
          {!loading && filteredRecords.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <MaterialIcons name="fact-check" size={48} color={Colors.outlineVariant} />
              <Text style={{ marginTop: 12, color: Colors.onSurfaceVariant, fontSize: 15, fontWeight: '500' }}>
                No attendance sessions found for review.
              </Text>
            </View>
          )}

          {/* Records */}
          {!loading && filteredRecords.map((record, index) => {
            const ss = statusStyles[record.status] || statusStyles.pending;
            const percentage = record.total > 0
              ? Math.round((record.present / record.total) * 100)
              : 0;
            return (
              <View key={record.id || index} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <View style={styles.recordHeaderLeft}>
                    <Text style={styles.recordCourse}>{record.course}</Text>
                    <Text style={styles.recordStaff}>{record.staff}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: ss.bg }]}>
                    <Text style={[styles.statusText, { color: ss.text }]}>{ss.label}</Text>
                  </View>
                </View>

                <View style={styles.recordDetails}>
                  <View style={styles.detailItem}>
                    <MaterialIcons name="calendar-today" size={14} color={Colors.onSurfaceVariant} />
                    <Text style={styles.detailText}>{record.date}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <MaterialIcons name="schedule" size={14} color={Colors.onSurfaceVariant} />
                    <Text style={styles.detailText}>{record.period}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <MaterialIcons name="people" size={14} color={Colors.onSurfaceVariant} />
                    <Text style={styles.detailText}>{record.present}/{record.total} ({percentage}%)</Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: percentage >= 75 ? '#22c55e' : Colors.error }]} />
                </View>

                {/* Action Buttons for Pending */}
                {record.status === 'pending' && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.rejectButton}
                      activeOpacity={0.7}
                      onPress={() => handleReviewAction(record, 'rejected')}
                    >
                      <MaterialIcons name="close" size={16} color={Colors.error} />
                      <Text style={styles.rejectText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.approveButton}
                      activeOpacity={0.7}
                      onPress={() => handleReviewAction(record, 'approved')}
                    >
                      <MaterialIcons name="check" size={16} color={Colors.onPrimary} />
                      <Text style={styles.approveText}>Approve</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
      <BottomNavBar
        items={bottomNavItems}
        activeItem="attendance"
        onItemPress={(item) => {
          if (item.key === 'home') navigation?.navigate('StaffDashboard');
          else if (item.key === 'attendance') navigation?.navigate('MarkAttendance');
          else if (item.key === 'history') navigation?.navigate('AttendanceHistory');
          else if (item.key === 'profile') navigation?.navigate('StaffProfile');
        }}
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
  filterRow: { flexDirection: 'row', gap: 8 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 9999,
    backgroundColor: Colors.surfaceContainerLow, borderWidth: 1, borderColor: Colors.outlineVariant,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { ...Typography.labelSm, color: Colors.onSurfaceVariant },
  filterTextActive: { color: Colors.onPrimary },
  recordCard: {
    backgroundColor: Colors.surfaceContainerLowest, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: 'rgba(195,197,215,0.3)', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  recordHeaderLeft: { flex: 1, marginRight: 8 },
  recordCourse: { ...Typography.labelMd, color: Colors.onSurface, fontWeight: '600' },
  recordStaff: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999 },
  statusText: { ...Typography.labelSm, fontWeight: '700' },
  recordDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, fontSize: 12 },
  progressBarBg: { height: 6, backgroundColor: Colors.surfaceContainerHighest, borderRadius: 9999, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 9999 },
  actionRow: { flexDirection: 'row', gap: 12, justifyContent: 'flex-end', paddingTop: 4 },
  rejectButton: {
    flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 8, borderWidth: 1, borderColor: Colors.error,
  },
  rejectText: { ...Typography.labelSm, color: Colors.error, fontWeight: '600' },
  approveButton: {
    flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 8, backgroundColor: Colors.primary,
  },
  approveText: { ...Typography.labelSm, color: Colors.onPrimary, fontWeight: '600' },
});

export default AttendanceReview;
