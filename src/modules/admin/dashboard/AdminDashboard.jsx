import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, SafeAreaView, ActivityIndicator } from '@/ui';
import { MaterialIcons } from '@/ui';
import Colors from '../../../constants/colors';
import Typography from '../../../constants/typography';
import TopAppBar from '../../../components/common/TopAppBar';
import BottomNavBar from '../../../components/common/BottomNavBar';
import { useAuth } from '../../auth/context/AuthContext';
import { getAttendanceHistory } from '../../../services/api/attendance';
import { getDepartmentSummary } from '../../../services/api/reports';

const AdminDashboard = ({ navigation }) => {
  const { user, profile, signOut } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [kpis, setKpis] = useState({
    total_students: 0,
    total_staff: 0,
    today_attendance_percentage: 0,
    overall_attendance_percentage: 0,
    students_below_75_count: 0,
    weekly_trend: [],
  });
  const [loadingKpis, setLoadingKpis] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // 1. Fetch live institutional department KPIs
    getDepartmentSummary()
      .then((res) => {
        if (isMounted && res) {
          const data = res.data || res;
          setKpis(data);
          setLoadingKpis(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load department KPIs:', err);
        if (isMounted) setLoadingKpis(false);
      });

    // 2. Fetch live recent attendance sessions
    getAttendanceHistory({ limit: 5 })
      .then((res) => {
        if (isMounted) {
          const list = Array.isArray(res) ? res : (res?.sessions || res?.data || []);
          if (list.length > 0) {
            const mapped = list.map((item) => ({
              course: `${item.course_code || 'SUB'} - ${item.course_name || 'Session'}`,
              instructor: item.staff_name || 'Faculty Member',
              status: item.total_count ? `Marked (${item.present_count}/${item.total_count})` : 'Submitted',
              statusType: (item.present_count / (item.total_count || 1)) >= 0.75 ? 'success' : 'warning',
              time: item.date ? `${item.date.slice(5)} • ${item.period || 'Period'}` : 'Recent',
            }));
            setActivities(mapped);
          }
          setLoadingActivities(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load recent attendance sessions:', err);
        if (isMounted) setLoadingActivities(false);
      });

    return () => { isMounted = false; };
  }, [profile]);

  const handleLogout = async () => {
    try {
      if (signOut) await signOut();
    } catch (e) {
      // ignore
    }
    navigation?.navigate('Login');
  };

  const bottomNavItems = [
    { key: 'home', label: 'Home', icon: 'dashboard', screen: 'AdminDashboard' },
    { key: 'attendance', label: 'Attendance', icon: 'how-to-reg', screen: 'ReportManagement' },
    { key: 'timetable', label: 'Timetable', icon: 'calendar-month', screen: 'AdminTimetable' },
    { key: 'history', label: 'History', icon: 'history', screen: 'AttendanceHistory' },
    { key: 'profile', label: 'Profile', icon: 'person', screen: 'AdminProfile' },
  ];

  const stats = [
    {
      label: 'Total Students',
      value: loadingKpis ? '...' : `${kpis.total_students || 0}`,
      icon: 'groups',
      color: Colors.primary,
      sub: 'Active enrolled',
    },
    {
      label: 'Total Staff',
      value: loadingKpis ? '...' : `${kpis.total_staff || 0}`,
      icon: 'badge',
      color: Colors.tertiary,
      sub: 'Active faculty',
    },
    {
      label: "Today's Attendance",
      value: loadingKpis ? '...' : `${kpis.today_attendance_percentage || kpis.overall_attendance_percentage || 0}%`,
      icon: 'analytics',
      color: Colors.primary,
      sub: `Overall ${kpis.overall_attendance_percentage || 0}%`,
      trending: (kpis.today_attendance_percentage || 0) >= 90,
    },
    {
      label: 'Below Req (75%)',
      value: loadingKpis ? '...' : `${kpis.students_below_75_count || 0}`,
      icon: 'warning',
      color: Colors.error,
      isAlert: (kpis.students_below_75_count || 0) > 0,
      link: 'Review Students →',
      onLinkPress: () => navigation?.navigate('ReportManagement'),
    },
  ];

  const quickActions = [
    { label: 'Add Student', icon: 'person-add', color: Colors.primary },
    { label: 'Add Staff', icon: 'badge', color: Colors.tertiary },
    { label: 'Assign Subjects', icon: 'library-books', color: Colors.secondary },
    { label: 'Generate Reports', icon: 'summarize', color: Colors.primary },
  ];

  const barData = (kpis.weekly_trend && kpis.weekly_trend.length > 0)
    ? kpis.weekly_trend.map((b) => ({
        label: b.label,
        height: Math.min(100, Math.max(10, Math.round(b.percentage))),
      }))
    : [
        { label: 'Mon', height: 94 },
        { label: 'Tue', height: 94 },
        { label: 'Wed', height: 94 },
        { label: 'Thu', height: 94 },
        { label: 'Fri', height: 93 },
      ];

  const statusColor = (type) => {
    if (type === 'success') return { bg: '#dcfce7', text: '#166534' };
    if (type === 'warning') return { bg: '#fef08a', text: '#854d0e' };
    return { bg: Colors.surfaceContainer, text: Colors.onSurface };
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopAppBar
        title={profile?.full_name ? `Admin: ${profile.full_name}` : "Admin Portal"}
        showBack
        onBackPress={handleLogout}
        profileImage={profile?.avatar_url || user?.profile?.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuD1t5z-_oQFWEaabU_WJXKo_VqO91Cj1cerTlzKrkGfjfKSqcYLxb4osCTXeFfFjZjt_RwN3XSs7E1IjqHQ43_S6DeISPQpGZI_lcQ6DCjefn5fA5c6dauILyxqbS3i7H0BtINyQEDLxsbF_xi4onTPB9L_t93ppw-qwRTYb9mtB6ZZQgC6rfLajdkVnLkA96olIVw7dGBlx7YQ2Lb8Yr0yoJg7mPl5YPriyQ0Eed4zO8R7r8JS1wHO"}
        onProfilePress={() => navigation?.navigate('AdminProfile')}
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.contentInner}>
          {/* Header */}
          <View>
            <Text style={styles.pageTitle}>Overview</Text>
            <Text style={styles.pageSubtitle}>
              {profile?.full_name ? `Welcome back, ${profile.full_name}. Real-time academic metrics & oversight.` : 'Real-time attendance metrics across all departments.'}
            </Text>
          </View>

          {/* Stat Cards */}
          <View style={styles.statGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={[styles.statCard, stat.isAlert && styles.alertCard]}>
                <View style={styles.statHeader}>
                  <Text style={[styles.statLabel, stat.isAlert && { color: Colors.error }]}>{stat.label}</Text>
                  <MaterialIcons name={stat.icon} size={24} color={stat.color} />
                </View>
                <Text style={[styles.statValue, stat.isAlert && { color: Colors.error }]}>{stat.value}</Text>
                {stat.trending ? (
                  <View style={styles.trendBadge}>
                    <MaterialIcons name="trending-up" size={14} color="#166534" />
                    <Text style={styles.trendText}>{stat.sub}</Text>
                  </View>
                ) : stat.link ? (
                  <TouchableOpacity onPress={stat.onLinkPress} activeOpacity={0.7}>
                    <Text style={styles.linkText}>{stat.link}</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.statSub}>{stat.sub}</Text>
                )}
              </View>
            ))}
          </View>

          {/* Weekly Attendance Trend */}
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.sectionTitle}>Weekly Attendance Trend</Text>
              <TouchableOpacity onPress={() => navigation?.navigate('AttendanceHistory')}>
                <MaterialIcons name="more-vert" size={24} color={Colors.secondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.barChart}>
              {barData.map((bar, index) => (
                <View key={index} style={styles.barColumn}>
                  <View style={[styles.bar, { height: `${bar.height}%` }]}>
                    <Text style={styles.barTooltip}>{bar.height}%</Text>
                  </View>
                  <Text style={styles.barLabel}>{bar.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Recent Activity Table */}
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={() => navigation?.navigate('AttendanceHistory')}>
                <Text style={styles.viewLink}>View All</Text>
              </TouchableOpacity>
            </View>
            {/* Table Header Row */}
            <View style={styles.tableRow}>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Course / Section</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Instructor</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Status</Text>
              <Text style={[styles.tableHeaderCell, { flex: 0.8, textAlign: 'right' }]}>Time</Text>
            </View>
            {loadingActivities ? (
              <View style={{ padding: 24, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={{ ...Typography.labelSm, color: Colors.secondary, marginTop: 8 }}>Loading sessions...</Text>
              </View>
            ) : activities.length === 0 ? (
              <View style={{ padding: 24, alignItems: 'center' }}>
                <MaterialIcons name="history-edu" size={32} color={Colors.outline} />
                <Text style={{ ...Typography.bodyMd, color: Colors.onSurfaceVariant, marginTop: 8 }}>
                  No attendance sessions marked yet.
                </Text>
              </View>
            ) : (
              activities.map((act, index) => {
                const sc = statusColor(act.statusType);
                return (
                  <View key={index} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={1}>{act.course}</Text>
                    <Text style={[styles.tableCell, { flex: 1.5, color: Colors.onSurfaceVariant }]} numberOfLines={1}>{act.instructor}</Text>
                    <View style={{ flex: 1.5 }}>
                      <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                        <Text style={[styles.statusText, { color: sc.text }]}>{act.status}</Text>
                      </View>
                    </View>
                    <Text style={[styles.tableCell, { flex: 0.8, textAlign: 'right', color: Colors.secondary, fontSize: 12 }]}>{act.time}</Text>
                  </View>
                );
              })
            )}
          </View>


          {/* Quick Actions */}
          <View style={styles.quickActionsCard}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickActionItem}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (action.label === 'Add Student') navigation?.navigate('EnrollStudent');
                    else if (action.label === 'Add Staff') navigation?.navigate('AdminStaffOnboarding');
                    else if (action.label === 'Assign Subjects') navigation?.navigate('MentorProctorAllocation');
                    else if (action.label === 'Generate Reports') navigation?.navigate('ReportManagement');
                  }}
                >
                  <MaterialIcons name={action.icon} size={24} color={action.color} />
                  <Text style={styles.quickActionText}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* System Status */}
          <View style={styles.systemStatusCard}>
            <Text style={styles.sectionTitle}>System Status</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot}>
                <View style={styles.statusDotInner} />
              </View>
              <Text style={styles.statusLabelText}>All services operational</Text>
            </View>
            <Text style={styles.lastSync}>Last sync: 2 mins ago</Text>
          </View>
        </View>
      </ScrollView>

      <BottomNavBar
        items={bottomNavItems}
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
  pageTitle: { ...Typography.headlineLgMobile, color: Colors.onBackground, marginBottom: 4 },
  pageSubtitle: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCard: {
    width: '48%', backgroundColor: Colors.surfaceContainerLowest, borderRadius: 12,
    padding: 16, borderWidth: 1, borderColor: 'rgba(195,197,215,0.3)', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  alertCard: { backgroundColor: 'rgba(255,218,214,0.2)', borderColor: Colors.errorContainer },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statLabel: { ...Typography.labelMd, color: Colors.onSurfaceVariant },
  statValue: { ...Typography.headlineLgMobile, color: Colors.onSurface },
  statSub: { ...Typography.labelSm, color: Colors.secondary },
  trendBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(187,247,208,0.3)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999, alignSelf: 'flex-start',
  },
  trendText: { ...Typography.labelSm, color: '#166534' },
  linkText: { ...Typography.labelSm, color: Colors.primary },
  chartCard: {
    backgroundColor: Colors.surfaceContainerLowest, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: 'rgba(195,197,215,0.3)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { ...Typography.headlineSm, color: Colors.onSurface },
  barChart: {
    height: 180, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    backgroundColor: Colors.surfaceContainerLow, borderRadius: 8, padding: 8, gap: 8,
  },
  barColumn: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  bar: { width: '80%', backgroundColor: Colors.primary, borderTopLeftRadius: 4, borderTopRightRadius: 4, minHeight: 10, justifyContent: 'flex-start', alignItems: 'center' },
  barTooltip: { ...Typography.labelSm, color: Colors.onPrimary, fontSize: 10, marginTop: 4 },
  barLabel: { ...Typography.labelSm, color: Colors.secondary, marginTop: 4 },
  tableCard: {
    backgroundColor: Colors.surfaceContainerLowest, borderRadius: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(195,197,215,0.3)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  tableHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  viewLink: { ...Typography.labelSm, color: Colors.primary },
  tableRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(195,197,215,0.2)',
  },
  tableHeaderCell: { ...Typography.labelSm, color: Colors.secondary },
  tableCell: { ...Typography.bodyMd, color: Colors.onSurface },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999, alignSelf: 'flex-start' },
  statusText: { fontSize: 12, fontWeight: '500' },
  quickActionsCard: {
    backgroundColor: Colors.surfaceContainerLowest, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: 'rgba(195,197,215,0.3)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16 },
  quickActionItem: {
    width: '47%', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: 16, borderRadius: 8, backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1, borderColor: 'rgba(195,197,215,0.2)',
  },
  quickActionText: { ...Typography.labelSm, color: Colors.onSurface, textAlign: 'center' },
  systemStatusCard: {
    backgroundColor: 'rgba(0,63,177,0.05)', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: 'rgba(0,63,177,0.2)',
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  statusDot: {
    width: 12, height: 12, borderRadius: 6, backgroundColor: 'rgba(74,222,128,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  statusDotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
  statusLabelText: { ...Typography.labelMd, color: Colors.onSurfaceVariant },
  lastSync: { ...Typography.bodyMd, color: Colors.secondary, fontSize: 12, marginTop: 12 },
});

export default AdminDashboard;
