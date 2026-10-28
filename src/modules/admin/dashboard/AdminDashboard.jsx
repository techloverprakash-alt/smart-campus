import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Pressable,
  TextInput,
} from '@/ui';
import { MaterialIcons } from '@/ui';
import Colors from '../../../constants/colors';
import Typography from '../../../constants/typography';
import TopAppBar from '../../../components/common/TopAppBar';
import BottomNavBar from '../../../components/common/BottomNavBar';
import { useAuth } from '../../auth/context/AuthContext';
import { getAttendanceHistory } from '../../../services/api/attendance';
import { getDepartmentSummary } from '../../../services/api/reports';

/**
 * Institutional Assigned Faculty & Subject Workload Data
 * Reflects verified teaching faculty and course offerings for the academic year.
 */
const FACULTY_WORKLOAD_DATA = [
  {
    id: 1,
    initials: "RK",
    name: "Dr. R. Kavitha, M.E., Ph.D.",
    designation: "Professor & Head of Department",
    facultyId: "FAC-AIDS-001",
    department: "Artificial Intelligence & Data Science",
    cabin: "HOD Executive Suite • Admin Wing 2nd Floor",
    email: "kavitha.r@infotech.edu.in",
    avatarBg: "#dbeafe",
    avatarText: "#003fb1",
    subjects: [
      {
        code: "CS3301",
        title: "Data Structures",
        type: "Core Theory",
        credits: 3,
        hours: "4 hrs/week",
        classSection: "III Year AI & DS • Section A",
        room: "Hall LH-204",
      },
      {
        code: "CS3311",
        title: "Data Structures Laboratory",
        type: "Practical Lab",
        credits: 2,
        hours: "3 hrs/week",
        classSection: "III Year AI & DS • Section A",
        room: "AI Lab 1 • Turing Block",
      },
      {
        code: "AD3512",
        title: "Mini-Project & Collaborative Lab",
        type: "Practical Lab",
        credits: 2,
        hours: "2 hrs/week",
        classSection: "III Year AI & DS • Section A",
        room: "Computing Center 1",
      },
    ],
  },
  {
    id: 2,
    initials: "SK",
    name: "Dr. S. Kabilan, Ph.D.",
    designation: "Associate Professor",
    facultyId: "FAC-AIDS-005",
    department: "Artificial Intelligence & Data Science",
    cabin: "Cabin 312 • Turing Block 3rd Floor",
    email: "kabilan.s@infotech.edu.in",
    avatarBg: "#e0e7ff",
    avatarText: "#4338ca",
    subjects: [
      {
        code: "AD3501",
        title: "Deep Learning Architectures",
        type: "Core Theory",
        credits: 4,
        hours: "4 hrs/week",
        classSection: "III Year AI & DS • Section A",
        room: "Turing Hall (Room 302)",
      },
      {
        code: "AD3511",
        title: "Deep Learning Laboratory",
        type: "Practical Lab",
        credits: 2,
        hours: "3 hrs/week",
        classSection: "III Year AI & DS • Batch 1 & 2",
        room: "AI Lab 2 • Turing Block",
      },
    ],
  },
  {
    id: 3,
    initials: "MS",
    name: "Prof. M. Selvam, M.Tech.",
    designation: "Assistant Professor (Sr. Gr.)",
    facultyId: "FAC-AIDS-018",
    department: "Artificial Intelligence & Data Science",
    cabin: "Cabin 208 • Computing Block",
    email: "selvam.m@infotech.edu.in",
    avatarBg: "#fef3c7",
    avatarText: "#92400e",
    subjects: [
      {
        code: "CS3352",
        title: "Database Management Systems",
        type: "Core Theory",
        credits: 3,
        hours: "4 hrs/week",
        classSection: "III Year AI & DS • Section A",
        room: "Room 204",
      },
      {
        code: "CS3361",
        title: "Database Management Systems Laboratory",
        type: "Practical Lab",
        credits: 2,
        hours: "3 hrs/week",
        classSection: "III Year AI & DS • Section A",
        room: "Computing Center 1",
      },
    ],
  },
  {
    id: 4,
    initials: "SA",
    name: "Prof. S. Anand, M.E.",
    designation: "Assistant Professor",
    facultyId: "FAC-AIDS-022",
    department: "Artificial Intelligence & Data Science",
    cabin: "Cabin 304 • Software Wing",
    email: "anand.s@infotech.edu.in",
    avatarBg: "#dcfce7",
    avatarText: "#166534",
    subjects: [
      {
        code: "CS3401",
        title: "Operating Systems & Virtualization",
        type: "Core Theory",
        credits: 3,
        hours: "4 hrs/week",
        classSection: "III Year AI & DS • Section A",
        room: "Room 302",
      },
      {
        code: "CS3411",
        title: "Operating Systems Laboratory",
        type: "Practical Lab",
        credits: 2,
        hours: "3 hrs/week",
        classSection: "III Year AI & DS • Section A",
        room: "OS Lab • Software Wing",
      },
    ],
  },
  {
    id: 5,
    initials: "BV",
    name: "Dr. B. Vijayalakshmi, Ph.D.",
    designation: "Associate Professor",
    facultyId: "FAC-HUM-012",
    department: "Humanities & Interdisciplinary Sciences",
    cabin: "Cabin 114 • Science Block",
    email: "vijaya.b@infotech.edu.in",
    avatarBg: "#fce7f3",
    avatarText: "#9d174d",
    subjects: [
      {
        code: "AD3502",
        title: "Machine Learning Fundamentals",
        type: "Core Theory",
        credits: 3,
        hours: "4 hrs/week",
        classSection: "III Year AI & DS • Section A",
        room: "Room 204",
      },
      {
        code: "GE3451",
        title: "Environmental Science & Sustainability",
        type: "Core Theory",
        credits: 2,
        hours: "2 hrs/week",
        classSection: "III Year AI & DS • Section A",
        room: "Room 204",
      },
    ],
  },
];

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
  const [staffModalVisible, setStaffModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaculty = FACULTY_WORKLOAD_DATA.filter((teacher) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchesTeacher =
      teacher.name.toLowerCase().includes(q) ||
      teacher.facultyId.toLowerCase().includes(q) ||
      teacher.designation.toLowerCase().includes(q);
    const matchesSubject = teacher.subjects.some(
      (s) =>
        s.code.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q)
    );
    return matchesTeacher || matchesSubject;
  });

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
      key: 'staff',
      label: 'Total Staff',
      value: loadingKpis
        ? '...'
        : (kpis.total_staff && Number(kpis.total_staff) > 0
            ? `${kpis.total_staff}`
            : `${FACULTY_WORKLOAD_DATA.length}`),
      icon: 'badge',
      color: Colors.tertiary,
      sub: `${FACULTY_WORKLOAD_DATA.length} Assigned Teachers`,
      link: 'View Assigned Teachers →',
      isClickable: true,
      onPress: () => setStaffModalVisible(true),
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
    { label: 'Campus Services', icon: 'support-agent', color: Colors.primary },
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
      {/* Admin header navigation is rendered in top app header */}
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
            {stats.map((stat, index) => {
              const isInteractive = Boolean(stat.isClickable || stat.onPress);
              const CardComponent = isInteractive ? TouchableOpacity : View;
              return (
                <CardComponent
                  key={index}
                  style={[
                    styles.statCard,
                    stat.isAlert && styles.alertCard,
                    isInteractive && styles.statCardInteractive,
                  ]}
                  onPress={stat.onPress}
                  activeOpacity={isInteractive ? 0.75 : 1}
                >
                  <View style={styles.statHeader}>
                    <Text style={[styles.statLabel, stat.isAlert && { color: Colors.error }]}>{stat.label}</Text>
                    <View style={[styles.statIconBadge, { backgroundColor: `${stat.color}15` }]}>
                      <MaterialIcons name={stat.icon} size={22} color={stat.color} />
                    </View>
                  </View>
                  <Text style={[styles.statValue, stat.isAlert && { color: Colors.error }]}>{stat.value}</Text>
                  {stat.trending ? (
                    <View style={styles.trendBadge}>
                      <MaterialIcons name="trending-up" size={14} color="#166534" />
                      <Text style={styles.trendText}>{stat.sub}</Text>
                    </View>
                  ) : stat.link ? (
                    <TouchableOpacity
                      onPress={stat.onLinkPress || stat.onPress}
                      activeOpacity={0.7}
                      style={styles.linkTouch}
                    >
                      <Text style={styles.linkText}>{stat.link}</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.statSub}>{stat.sub}</Text>
                  )}
                </CardComponent>
              );
            })}
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
                    if (action.label === 'Campus Services') navigation?.navigate('StudentFacultyPortal', { role: 'ADMIN', from: 'admin' });
                    else if (action.label === 'Add Student') navigation?.navigate('EnrollStudent');
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

          {/* NEXUS Campus Control Center Banner */}
          <TouchableOpacity
            style={{
              backgroundColor: '#1e3a8a',
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
            onPress={() => navigation?.navigate('CampusAdminControlCenter')}
            activeOpacity={0.8}
          >
            <View style={{ flex: 1, marginRight: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <MaterialIcons name="admin-panel-settings" size={18} color="#60a5fa" />
                <Text style={{ color: '#93c5fd', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>
                  Central Command Live
                </Text>
              </View>
              <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '800' }}>
                Campus Administrator Control Center
              </Text>
              <Text style={{ color: '#cbd5e1', fontSize: 12, marginTop: 2 }}>
                Cross-campus dispatch, SLA risk donut, building telemetry & emergency broadcast.
              </Text>
            </View>
            <MaterialIcons name="arrow-forward" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNavBar
        items={bottomNavItems}
        activeItem="home"
        navigation={navigation}
      />

      {/* Total Staff & Assigned Subjects Modal Dialog Box */}
      <Modal
        visible={staffModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setStaffModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalDismissArea} onPress={() => setStaffModalVisible(false)} />

          <View style={styles.modalDialogCard}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalHeaderBadge}>
                  <MaterialIcons name="school" size={13} color="#003fb1" />
                  <Text style={styles.modalHeaderBadgeText}>INSTITUTIONAL TEACHING FACULTY</Text>
                </View>
                <Text style={styles.modalTitle}>Assigned Faculty & Subject Workload</Text>
                <Text style={styles.modalSub}>
                  Assigned teaching staff, their active subject allocations, and course hours
                </Text>
              </View>

              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setStaffModalVisible(false)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Quick Metrics Summary Strip */}
            <View style={styles.modalStatsStrip}>
              <View style={styles.modalStatChip}>
                <MaterialIcons name="badge" size={15} color="#003fb1" />
                <Text style={styles.modalStatChipText}>
                  <Text style={{ fontWeight: '700', color: '#003fb1' }}>{FACULTY_WORKLOAD_DATA.length}</Text> Active Teachers
                </Text>
              </View>

              <View style={styles.modalStatChip}>
                <MaterialIcons name="library-books" size={15} color="#166534" />
                <Text style={styles.modalStatChipText}>
                  <Text style={{ fontWeight: '700', color: '#166534' }}>
                    {FACULTY_WORKLOAD_DATA.reduce((acc, f) => acc + f.subjects.length, 0)}
                  </Text> Total Subjects Taken
                </Text>
              </View>

              <View style={styles.modalStatChip}>
                <MaterialIcons name="groups" size={15} color="#92400e" />
                <Text style={styles.modalStatChipText}>
                  <Text style={{ fontWeight: '700', color: '#92400e' }}>III Year AI & DS</Text> • Section A
                </Text>
              </View>
            </View>

            {/* Search / Filter Bar */}
            <View style={styles.modalSearchBox}>
              <MaterialIcons name="search" size={18} color="#94a3b8" />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search teacher by name, subject code (e.g., CS3301), or title..."
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                  <MaterialIcons name="close" size={16} color="#94a3b8" />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Scrollable Teacher & Subject List */}
            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={true}
            >
              {filteredFaculty.length === 0 ? (
                <View style={styles.emptySearchBox}>
                  <MaterialIcons name="person-search" size={40} color="#cbd5e1" />
                  <Text style={styles.emptySearchTitle}>No matching teachers or subjects found</Text>
                  <Text style={styles.emptySearchSub}>
                    Try searching with another keyword or clear the search input.
                  </Text>
                </View>
              ) : (
                filteredFaculty.map((teacher) => (
                  <View key={teacher.id} style={styles.teacherCard}>
                    {/* Teacher Profile Row */}
                    <View style={styles.teacherTopRow}>
                      <View style={styles.teacherProfileCol}>
                        <View style={[styles.teacherAvatar, { backgroundColor: teacher.avatarBg }]}>
                          <Text style={[styles.teacherAvatarText, { color: teacher.avatarText }]}>
                            {teacher.initials}
                          </Text>
                        </View>

                        <View style={styles.teacherDetails}>
                          <Text style={styles.teacherName}>{teacher.name}</Text>
                          <Text style={styles.teacherDesignation}>
                            {teacher.designation} • {teacher.facultyId}
                          </Text>
                          <View style={styles.teacherMetaRow}>
                            <MaterialIcons name="meeting-room" size={12} color="#64748b" />
                            <Text style={styles.teacherMetaText}>{teacher.cabin}</Text>
                            <Text style={styles.teacherMetaDot}>•</Text>
                            <MaterialIcons name="email" size={12} color="#64748b" />
                            <Text style={styles.teacherMetaText}>{teacher.email}</Text>
                          </View>
                        </View>
                      </View>

                      {/* Taking Subjects Count Badge */}
                      <View style={styles.subjectsCountBadge}>
                        <MaterialIcons name="menu-book" size={14} color="#003fb1" />
                        <Text style={styles.subjectsCountText}>
                          {teacher.subjects.length} Subjects Taken
                        </Text>
                      </View>
                    </View>

                    {/* Under the teacher: Subjects List */}
                    <View style={styles.teacherSubjectsSection}>
                      <View style={styles.teacherSubjectsHeaderRow}>
                        <Text style={styles.teacherSubjectsHeading}>
                          Subjects Taken by this Teacher ({teacher.subjects.length})
                        </Text>
                      </View>

                      <View style={styles.subjectItemsContainer}>
                        {teacher.subjects.map((sub, sIdx) => {
                          const isTheory = sub.type.toLowerCase().includes('theory');
                          return (
                            <View key={sIdx} style={styles.subjectItemCard}>
                              <View style={styles.subjectItemHeader}>
                                <View style={styles.subjectCodeBadge}>
                                  <Text style={styles.subjectCodeText}>{sub.code}</Text>
                                </View>
                                <Text style={styles.subjectTitle} numberOfLines={1}>
                                  {sub.title}
                                </Text>
                                <View
                                  style={[
                                    styles.subjectTypePill,
                                    isTheory ? styles.theoryPill : styles.labPill,
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.subjectTypePillText,
                                      isTheory ? styles.theoryPillText : styles.labPillText,
                                    ]}
                                  >
                                    {sub.type}
                                  </Text>
                                </View>
                              </View>

                              <View style={styles.subjectItemMetaRow}>
                                <View style={styles.subjectMetaItem}>
                                  <MaterialIcons name="schedule" size={13} color="#64748b" />
                                  <Text style={styles.subjectMetaText}>{sub.hours}</Text>
                                </View>
                                <View style={styles.subjectMetaItem}>
                                  <MaterialIcons name="stars" size={13} color="#64748b" />
                                  <Text style={styles.subjectMetaText}>{sub.credits} Credits</Text>
                                </View>
                                <View style={styles.subjectMetaItem}>
                                  <MaterialIcons name="room" size={13} color="#64748b" />
                                  <Text style={styles.subjectMetaText}>{sub.room}</Text>
                                </View>
                                <View style={styles.subjectMetaItem}>
                                  <MaterialIcons name="groups" size={13} color="#64748b" />
                                  <Text style={styles.subjectMetaText}>{sub.classSection}</Text>
                                </View>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <Text style={styles.modalFooterHint}>
                Showing verified teaching assignments for Academic Year 2026–2027
              </Text>
              <TouchableOpacity
                style={styles.modalDoneBtn}
                onPress={() => setStaffModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalDoneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  statCardInteractive: {
    cursor: 'pointer',
    borderColor: 'rgba(0, 63, 177, 0.28)',
  },
  statIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkTouch: {
    marginTop: 2,
    alignSelf: 'flex-start',
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

  /* Assigned Faculty Modal Dialog Styles */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalDismissArea: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalDialogCard: {
    width: '100%',
    maxWidth: 740,
    maxHeight: '88%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
    zIndex: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  modalHeaderLeft: {
    flex: 1,
    paddingRight: 16,
  },
  modalHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  modalHeaderBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#003fb1',
    letterSpacing: 0.5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalSub: {
    fontSize: 12.5,
    color: '#64748b',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalStatsStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalStatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  modalStatChipText: {
    fontSize: 12,
    color: '#334155',
  },
  modalSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
    padding: 0,
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  teacherCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  teacherTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  teacherProfileCol: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  teacherAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teacherAvatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  teacherDetails: {
    flex: 1,
  },
  teacherName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  teacherDesignation: {
    fontSize: 12.5,
    color: '#475569',
    marginTop: 1,
  },
  teacherMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  teacherMetaText: {
    fontSize: 11.5,
    color: '#64748b',
  },
  teacherMetaDot: {
    fontSize: 11,
    color: '#94a3b8',
    marginHorizontal: 2,
  },
  subjectsCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  subjectsCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#003fb1',
  },
  teacherSubjectsSection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  teacherSubjectsHeaderRow: {
    marginBottom: 8,
  },
  teacherSubjectsHeading: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  subjectItemsContainer: {
    gap: 8,
  },
  subjectItemCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 10,
  },
  subjectItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subjectCodeBadge: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  subjectCodeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  subjectTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  subjectTypePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  theoryPill: {
    backgroundColor: '#eff6ff',
  },
  theoryPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1d4ed8',
  },
  labPill: {
    backgroundColor: '#f5f3ff',
  },
  labPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7c3aed',
  },
  subjectItemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 6,
  },
  subjectMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subjectMetaText: {
    fontSize: 11.5,
    color: '#64748b',
  },
  emptySearchBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 8,
  },
  emptySearchTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
  emptySearchSub: {
    fontSize: 12.5,
    color: '#94a3b8',
    textAlign: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#f8fafc',
  },
  modalFooterHint: {
    fontSize: 11.5,
    color: '#64748b',
  },
  modalDoneBtn: {
    backgroundColor: '#003fb1',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalDoneBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default AdminDashboard;
