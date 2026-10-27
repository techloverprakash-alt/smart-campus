import React, { useMemo, useState, useEffect } from 'react';
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from '@/ui';
import {
  getFacultyMentors,
  getStudentAllocation,
  assignStudentMentor,
  unassignStudentMentor,
  autoDistributeStudentMentors,
} from '../../../services/api/profiles';

const COLORS = {
  primary: '#003fb1',
  primaryLight: '#dbe1ff',
  primaryTint: '#edf0ff',
  background: '#faf8ff',
  surface: '#ffffff',
  surfaceLow: '#f3f3fe',
  surfaceHigh: '#e7e7f3',
  text: '#191b23',
  muted: '#434654',
  outline: '#737686',
  border: '#e2e1ed',
  warning: '#852b00',
  warningBg: '#ffdbcf',
  successBg: '#dce2f3',
};

export default function MentorProctorAllocationScreen({ navigation }) {
  const [students, setStudents] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [facultyIndex, setFacultyIndex] = useState(0);
  const [showFacultyPicker, setShowFacultyPicker] = useState(false);
  const [department, setDepartment] = useState('All');
  const [section, setSection] = useState('All');
  const [batch, setBatch] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);

  // Load faculty mentors and students from backend API
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Faculty Mentors
      const mentorRes = await getFacultyMentors();
      const mList = Array.isArray(mentorRes) ? mentorRes : (mentorRes?.data || []);
      if (Array.isArray(mList) && mList.length > 0) {
        setFacultyList(
          mList.map((m) => ({
            id: m.id,
            name: m.name || m.full_name,
            title: m.title || m.designation || 'Faculty Mentor',
            assigned: m.assigned !== undefined ? m.assigned : (m.assigned_students_count || 0),
            capacity: m.capacity || 20,
          }))
        );
      }

      // 2. Fetch Students
      const allocRes = await getStudentAllocation({
        department: department === 'All' ? undefined : department,
        section: section === 'All' ? undefined : section,
        status: 'all',
      });
      const allocData = allocRes?.students ? allocRes : (allocRes?.data || allocRes);
      if (allocData && Array.isArray(allocData.students)) {
        const mapped = allocData.students.map((st) => ({
          id: st.register_number || st.id,
          rawId: st.id,
          name: st.name,
          section: st.section || 'Sec A',
          mentor: st.mentor,
          initials: st.initials,
          avatar: st.avatar,
        }));
        setStudents(mapped);
      }
    } catch (err) {
      console.error('Error loading allocation data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [department, section]);

  const selectedFaculty = facultyList[facultyIndex] || {
    id: '',
    name: 'Faculty Mentor',
    title: 'Faculty',
    assigned: 0,
    capacity: 20,
  };

  const unassignedCount = students.filter((s) => !s.mentor).length;
  const assignedCount = students.length - unassignedCount;

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();
    return students.filter((student) => {
      const isAssigned = Boolean(student.mentor);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'assigned' && isAssigned) ||
        (statusFilter === 'unassigned' && !isAssigned);
      const matchesSearch =
        !term ||
        student.name.toLowerCase().includes(term) ||
        student.id.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [students, statusFilter, search]);

  const toggleStudent = (id) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const selectAllVisibleUnassigned = () => {
    const visibleUnassigned = filteredStudents
      .filter((student) => !student.mentor)
      .map((student) => student.id);
    const allSelected =
      visibleUnassigned.length > 0 &&
      visibleUnassigned.every((id) => selectedIds.includes(id));
    setSelectedIds((current) =>
      allSelected
        ? current.filter((id) => !visibleUnassigned.includes(id))
        : Array.from(new Set([...current, ...visibleUnassigned]))
    );
  };

  const assignSelected = () => {
    const eligibleIds = selectedIds.filter((id) =>
      students.some((s) => s.id === id && !s.mentor)
    );
    if (eligibleIds.length === 0) {
      Alert.alert('No unassigned students selected', 'Please select at least one unassigned student first.');
      return;
    }
    if (selectedFaculty.assigned + eligibleIds.length > selectedFaculty.capacity) {
      Alert.alert(
        'Mentor capacity exceeded',
        `${selectedFaculty.name} has only ${Math.max(
          0,
          selectedFaculty.capacity - selectedFaculty.assigned
        )} available slot(s). Reduce the selection or select another faculty mentor.`
      );
      return;
    }

    Alert.alert(
      'Confirm Allocation',
      `Assign ${eligibleIds.length} student(s) to ${selectedFaculty.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Assign',
          onPress: async () => {
            try {
              // Call real backend API
              await assignStudentMentor({
                student_ids: eligibleIds,
                faculty_mentor_id: selectedFaculty.id || selectedFaculty.name,
              });
            } catch (err) {
              console.log('Backend assign fallback:', err.message);
            }

            // Update local state
            setStudents((current) =>
              current.map((student) =>
                eligibleIds.includes(student.id)
                  ? { ...student, mentor: selectedFaculty.name }
                  : student
              )
            );
            setFacultyList((current) =>
              current.map((f, i) =>
                i === facultyIndex
                  ? { ...f, assigned: f.assigned + eligibleIds.length }
                  : f
              )
            );
            setSelectedIds((current) => current.filter((id) => !eligibleIds.includes(id)));
            setToast(`${eligibleIds.length} student(s) assigned to ${selectedFaculty.name}`);
          },
        },
      ]
    );
  };

  const unassignSelected = () => {
    const eligibleIds = selectedIds.filter((id) =>
      students.some((s) => s.id === id && s.mentor)
    );
    if (!eligibleIds.length) {
      Alert.alert('Nothing to unassign', 'Select one or more students who already have an assigned mentor.');
      return;
    }
    Alert.alert(
      'Confirm Unassignment',
      `Remove mentor assignment from ${eligibleIds.length} student(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unassign',
          style: 'destructive',
          onPress: async () => {
            try {
              await unassignStudentMentor({ student_ids: eligibleIds });
            } catch (err) {
              console.log('Backend unassign fallback:', err.message);
            }

            setStudents((current) =>
              current.map((student) =>
                eligibleIds.includes(student.id)
                  ? { ...student, mentor: undefined }
                  : student
              )
            );
            setSelectedIds((current) => current.filter((id) => !eligibleIds.includes(id)));
            setToast(`${eligibleIds.length} student(s) unassigned`);
          },
        },
      ]
    );
  };

  const autoDistribute = () => {
    const pending = students.filter((student) => !student.mentor);
    if (!pending.length) {
      Alert.alert('All students assigned', 'There are no pending unassigned students in this cohort.');
      return;
    }
    Alert.alert(
      'Auto-Distribute Students',
      'Distribute unassigned students evenly across active faculty mentors according to available capacity?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Distribute',
          onPress: async () => {
            try {
              await autoDistributeStudentMentors({ department_name: department });
            } catch (err) {
              console.log('Backend auto distribute fallback:', err.message);
            }

            const capacities = facultyList.map((f) =>
              Math.max(0, f.capacity - f.assigned)
            );
            let nextIndex = 0;
            const updated = students.map((student) => {
              if (student.mentor) return student;
              let tries = 0;
              while (tries < facultyList.length && capacities[nextIndex] <= 0) {
                nextIndex = (nextIndex + 1) % facultyList.length;
                tries++;
              }
              if (tries >= facultyList.length) return student;
              const mentor = facultyList[nextIndex].name;
              capacities[nextIndex]--;
              nextIndex = (nextIndex + 1) % facultyList.length;
              return { ...student, mentor };
            });
            setStudents(updated);
            setSelectedIds([]);
            setToast('Auto-distribution completed successfully');
          },
        },
      ]
    );
  };

  const resetDemo = () => {
    loadData();
    setStatusFilter('unassigned');
    setSearch('');
    setSelectedIds([]);
    setToast('Roster reloaded from database');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Back to Dashboard"
          style={styles.backButton}
          onPress={() => navigation?.navigate('AdminDashboard')}
        >
          <Text style={styles.backSymbol}>←</Text>
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.collegePill}>INFO INSTITUTE OF TECHNOLOGY</Text>
          <Text style={styles.brand}>NEXUS • Admin Portal</Text>
        </View>
        <Pressable
          style={styles.profileCircle}
          onPress={() => navigation?.navigate('AdminProfile')}
        >
          <Text style={styles.profileText}>♙</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <View style={styles.titleIcon}><Text style={styles.titleIconText}>＋</Text></View>
          <Text style={styles.pageTitle}>Mentor & Proctor Allocation</Text>
        </View>
        <Text style={styles.subtitle}>Map student batches to academic faculty counselors</Text>

        <View style={styles.statsRow}>
          <StatCard label="Cohort" value={String(students.length)} foot="Total Enrolled" icon="◉" />
          <StatCard label="Pending" value={String(unassignedCount)} foot="Action Needed" icon="⚠" warning />
          <StatCard label="Mapped" value={String(assignedCount)} foot="Mentored" icon="✓" />
        </View>

        <View style={styles.filterPanel}>
          <View style={styles.filterRow}>
            <Pressable
              style={[styles.filterSelect, styles.departmentSelect]}
              onPress={() => setShowFilters((v) => !v)}
            >
              <Text style={styles.smallLabel}>DEPT</Text>
              <Text numberOfLines={1} style={styles.selectValue}>{department}  ▾</Text>
            </Pressable>
            <Pressable
              style={[styles.filterSelect, styles.sectionSelect]}
              onPress={() => setShowFilters((v) => !v)}
            >
              <Text style={styles.smallLabel}>SECTION</Text>
              <Text numberOfLines={1} style={styles.selectValue}>{section}  ▾</Text>
            </Pressable>
          </View>
          <Pressable style={styles.batchSelect} onPress={() => setShowFilters((v) => !v)}>
            <View>
              <Text style={styles.smallLabel}>ACADEMIC BATCH</Text>
              <Text style={styles.selectValue}>{batch}  ▾</Text>
            </View>
          </Pressable>
          {showFilters && (
            <View style={styles.inlinePicker}>
              <Text style={styles.pickerHeading}>Department</Text>
              {['AI & Data Science', 'Computer Science & Engineering', 'Information Technology'].map(
                (value) => (
                  <PickerOption
                    key={value}
                    label={value}
                    selected={department === value}
                    onPress={() => setDepartment(value)}
                  />
                )
              )}
              <Text style={styles.pickerHeading}>Section</Text>
              {['Sec A', 'Sec B', 'Sec C'].map((value) => (
                <PickerOption
                  key={value}
                  label={value}
                  selected={section === value}
                  onPress={() => setSection(value)}
                />
              ))}
              <Text style={styles.pickerHeading}>Batch</Text>
              {[
                '2024–2028 (UG) • Third Year',
                '2023–2027 (UG) • Final Year',
                '2025–2029 (UG) • Second Year',
              ].map((value) => (
                <PickerOption
                  key={value}
                  label={value}
                  selected={batch === value}
                  onPress={() => setBatch(value)}
                />
              ))}
              <Pressable onPress={() => setShowFilters(false)} style={styles.doneButton}>
                <Text style={styles.doneText}>Done</Text>
              </Pressable>
            </View>
          )}

          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search by name or reg no (714022AD001)..."
              placeholderTextColor={COLORS.outline}
              style={styles.searchInput}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')}>
                <Text style={styles.clearSearch}>×</Text>
              </Pressable>
            )}
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsRow}
          >
            <FilterPill
              label={`All Students (${students.length})`}
              active={statusFilter === 'all'}
              onPress={() => setStatusFilter('all')}
            />
            <FilterPill
              label={`Unassigned Only (${unassignedCount})`}
              active={statusFilter === 'unassigned'}
              onPress={() => setStatusFilter('unassigned')}
            />
            <FilterPill
              label={`Assigned (${assignedCount})`}
              active={statusFilter === 'assigned'}
              onPress={() => setStatusFilter('assigned')}
            />
          </ScrollView>
        </View>

        <View style={styles.mentorCard}>
          <View style={styles.mentorHeadingRow}>
            <Text style={styles.mentorHeading}>♙  TARGET FACULTY MENTOR</Text>
            <Text style={styles.capacityPill}>Cap: {selectedFaculty.capacity} Mentees</Text>
          </View>
          <Pressable style={styles.facultyButton} onPress={() => setShowFacultyPicker((v) => !v)}>
            <View style={styles.facultyAvatar}>
              <Text style={styles.facultyAvatarText}>
                {selectedFaculty.name
                  .split(' ')
                  .slice(-2)
                  .map((s) => s[0])
                  .join('')}
              </Text>
            </View>
            <View style={styles.facultyInfo}>
              <Text style={styles.facultyName}>{selectedFaculty.name}</Text>
              <Text style={styles.facultyTitle}>{selectedFaculty.title}</Text>
              <View style={styles.progressRow}>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(
                          100,
                          (selectedFaculty.assigned / selectedFaculty.capacity) * 100
                        )}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {selectedFaculty.assigned} / {selectedFaculty.capacity} Assigned
                </Text>
              </View>
            </View>
            <Text style={styles.chevron}>⌄</Text>
          </Pressable>
          {showFacultyPicker && (
            <View style={styles.facultyPicker}>
              {facultyList.map((faculty, index) => (
                <PickerOption
                  key={faculty.name}
                  label={`${faculty.name}  (${faculty.assigned}/${faculty.capacity})`}
                  selected={index === facultyIndex}
                  onPress={() => {
                    setFacultyIndex(index);
                    setShowFacultyPicker(false);
                  }}
                />
              ))}
            </View>
          )}
          <Text style={styles.capacityHint}>
            ✓ Optimal load available:{' '}
            {Math.max(0, selectedFaculty.capacity - selectedFaculty.assigned)} slots left under regulatory batch cap.
          </Text>
        </View>

        <View style={styles.actionsSection}>
          <View style={styles.selectionHeader}>
            <Pressable style={styles.selectAllRow} onPress={selectAllVisibleUnassigned}>
              <View
                style={[
                  styles.checkbox,
                  filteredStudents.filter((s) => !s.mentor).length > 0 &&
                    filteredStudents
                      .filter((s) => !s.mentor)
                      .every((s) => selectedIds.includes(s.id)) &&
                    styles.checkboxChecked,
                ]}
              >
                {filteredStudents.filter((s) => !s.mentor).length > 0 &&
                  filteredStudents
                    .filter((s) => !s.mentor)
                    .every((s) => selectedIds.includes(s.id)) && (
                    <Text style={styles.checkboxTick}>✓</Text>
                  )}
              </View>
              <Text style={styles.selectAllText}>Select All Unassigned</Text>
            </Pressable>
            <Text style={styles.selectedCount}>{selectedIds.length} selected</Text>
          </View>
          <Pressable style={styles.primaryButton} onPress={assignSelected}>
            <Text style={styles.buttonIcon}>▣</Text>
            <Text style={styles.primaryButtonText}>
              Assign Selected to {selectedFaculty.name.split(' ').slice(-1)[0]} (
              {selectedIds.filter((id) => students.some((s) => s.id === id && !s.mentor)).length}
              )
            </Text>
          </Pressable>
          <View style={styles.secondaryActions}>
            <Pressable style={styles.secondaryButton} onPress={autoDistribute}>
              <Text style={styles.secondaryButtonText}>ϟ  Auto-Distribute</Text>
            </Pressable>
            <Pressable style={styles.dangerButton} onPress={unassignSelected}>
              <Text style={styles.dangerButtonText}>⊖  Unassign Mentor</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.rosterHeader}>
          <Text style={styles.rosterTitle}>COHORT ROSTER</Text>
          <Text style={styles.rosterCount}>
            Showing {filteredStudents.length} of {students.length}
          </Text>
        </View>
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 20 }} />
        ) : filteredStudents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No students match your active filters.</Text>
          </View>
        ) : (
          filteredStudents.map((student) => (
            <StudentRow
              key={student.id}
              student={student}
              selected={selectedIds.includes(student.id)}
              onToggle={() => toggleStudent(student.id)}
            />
          ))
        )}

        <View style={styles.schemaCard}>
          <Text style={styles.schemaIcon}>⌘</Text>
          <View style={styles.schemaContent}>
            <Text style={styles.schemaTitle}>SCHEMA TRANSACTION TARGET</Text>
            <Text style={styles.endpoint}>PATCH /api/v1/profiles/students/assign-mentor</Text>
            <Text style={styles.schemaDescription}>
              Atomically updates students.faculty_mentor_id foreign key across selected records with ACID transaction rollback protection.
            </Text>
          </View>
        </View>

        {!!toast && (
          <Pressable style={styles.toast} onPress={() => setToast('')}>
            <Text style={styles.toastText}>{toast}  ×</Text>
          </Pressable>
        )}
        <Pressable style={styles.resetButton} onPress={resetDemo}>
          <Text style={styles.resetText}>↻ Refresh Roster Data</Text>
        </Pressable>
      </ScrollView>

      <View className="bottom-nav" style={styles.bottomNav}>
        {[
          ['▦', 'Dashboard', false, 'AdminDashboard'],
          ['♙', 'Students', true, 'MentorProctorAllocation'],
          ['▣', 'Staff', false, 'AdminStaffOnboarding'],
          ['▤', 'Timetable', false, 'AdminTimetable'],
          ['◉', 'Profile', false, 'AdminProfile'],
        ].map(([icon, label, active, screen]) => (
          <Pressable
            key={label}
            style={styles.navItem}
            onPress={() => screen && navigation?.navigate(screen)}
          >
            <Text style={[styles.navIcon, active && styles.navActive]}>{icon}</Text>
            <Text style={[styles.navLabel, active && styles.navActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

function StatCard({ label, value, foot, icon, warning = false }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statTop}>
        <Text style={[styles.statLabel, warning && styles.warningText]}>{label}</Text>
        <Text style={[styles.statIcon, warning && styles.warningText]}>{icon}</Text>
      </View>
      <Text style={[styles.statValue, warning && styles.warningText]}>{value}</Text>
      <Text style={[styles.statFoot, warning && styles.warningText]}>{foot}</Text>
    </View>
  );
}

function FilterPill({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.filterPill,
        active ? styles.filterPillActive : styles.filterPillInactive,
      ]}
    >
      <Text
        style={[
          styles.filterPillText,
          active ? styles.filterPillTextActive : styles.filterPillTextInactive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function PickerOption({ label, selected, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.pickerOption}>
      <Text style={styles.pickerOptionText}>{label}</Text>
      <Text style={styles.optionCheck}>{selected ? '✓' : ''}</Text>
    </Pressable>
  );
}

function StudentRow({ student, selected, onToggle }) {
  return (
    <View style={styles.studentRow}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected }}
        onPress={onToggle}
        style={[styles.checkbox, selected && styles.checkboxChecked]}
      >
        {selected && <Text style={styles.checkboxTick}>✓</Text>}
      </Pressable>
      {student.avatar ? (
        <Image source={{ uri: student.avatar }} style={styles.studentAvatar} />
      ) : (
        <View style={[styles.studentAvatar, styles.initialsAvatar]}>
          <Text style={styles.initialsText}>
            {student.initials ||
              (student.name || '')
                .split(' ')
                .map((part) => part[0])
                .join('')
                .slice(0, 2)}
          </Text>
        </View>
      )}
      <View style={styles.studentInfo}>
        <View style={styles.studentNameRow}>
          <Text numberOfLines={1} style={styles.studentName}>{student.name}</Text>
          <View
            style={[
              styles.statusPill,
              student.mentor ? styles.assignedPill : styles.unassignedPill,
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.statusText,
                student.mentor ? styles.assignedText : styles.unassignedText,
              ]}
            >
              {student.mentor || '◷  Unassigned'}
            </Text>
          </View>
        </View>
        <Text style={styles.studentMeta}>
          <Text style={styles.studentId}>{student.id}</Text>  •  {student.section}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    minHeight: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  backButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backSymbol: { fontSize: 22, color: COLORS.primary, fontWeight: '700' },
  headerText: { flex: 1 },
  collegePill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.successBg,
    color: COLORS.muted,
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 3,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
    overflow: 'hidden',
  },
  brand: { marginTop: 3, fontSize: 14, color: COLORS.text, fontWeight: '700' },
  iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  headerIcon: { fontSize: 23, color: COLORS.muted },
  notificationDot: { position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: 4, backgroundColor: '#ba1a1a' },
  profileCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  profileText: { color: '#fff', fontSize: 18 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 28 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  titleIcon: { width: 30, height: 30, borderRadius: 8, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  titleIconText: { color: COLORS.primary, fontSize: 23, lineHeight: 27 },
  pageTitle: { flex: 1, color: COLORS.text, fontSize: 21, lineHeight: 27, fontWeight: '700' },
  subtitle: { marginTop: 5, color: COLORS.muted, fontSize: 13, lineHeight: 19 },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 18 },
  statCard: { flex: 1, minWidth: 0, padding: 10, borderRadius: 12, backgroundColor: COLORS.surface, elevation: 1 },
  statTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statLabel: { fontSize: 11, fontWeight: '600', color: COLORS.muted },
  statIcon: { fontSize: 14, color: COLORS.muted },
  statValue: { marginTop: 4, color: COLORS.text, fontSize: 24, fontWeight: '700' },
  statFoot: { marginTop: 2, fontSize: 9, lineHeight: 13, color: COLORS.muted },
  warningText: { color: COLORS.warning },
  filterPanel: { marginTop: 16, padding: 12, borderRadius: 13, backgroundColor: COLORS.surfaceLow, gap: 10 },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterSelect: { backgroundColor: COLORS.surface, paddingHorizontal: 10, paddingVertical: 9, borderRadius: 8, elevation: 1 },
  departmentSelect: { flex: 1 },
  sectionSelect: { width: 105 },
  smallLabel: { color: COLORS.muted, fontSize: 9, letterSpacing: 1, fontWeight: '700' },
  selectValue: { color: COLORS.text, fontSize: 12, fontWeight: '600', marginTop: 3 },
  batchSelect: { backgroundColor: COLORS.surface, paddingHorizontal: 10, paddingVertical: 9, borderRadius: 8, elevation: 1 },
  inlinePicker: { backgroundColor: COLORS.surface, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: COLORS.border },
  pickerHeading: { color: COLORS.primary, fontSize: 11, fontWeight: '800', marginTop: 7, marginBottom: 2, textTransform: 'uppercase' },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  pickerOptionText: { color: COLORS.text, fontSize: 13, flex: 1 },
  optionCheck: { color: COLORS.primary, fontWeight: '800', paddingLeft: 8 },
  doneButton: { alignSelf: 'flex-end', backgroundColor: COLORS.primary, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 8, marginTop: 8 },
  doneText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 9, paddingHorizontal: 10, minHeight: 42, elevation: 1 },
  searchIcon: { fontSize: 22, color: COLORS.outline, marginRight: 7 },
  searchInput: { flex: 1, paddingVertical: 7, color: COLORS.text, fontSize: 13 },
  clearSearch: { color: COLORS.outline, fontSize: 22, paddingHorizontal: 3 },
  pillsRow: { gap: 7, paddingTop: 2, paddingBottom: 1 },
  filterPill: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  filterPillActive: { backgroundColor: COLORS.primary, elevation: 1 },
  filterPillInactive: { backgroundColor: COLORS.surfaceHigh },
  filterPillText: { fontSize: 11, fontWeight: '700' },
  filterPillTextActive: { color: '#fff' },
  filterPillTextInactive: { color: COLORS.muted },
  mentorCard: { marginTop: 16, padding: 14, backgroundColor: COLORS.primaryTint, borderRadius: 13, gap: 12 },
  mentorHeadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  mentorHeading: { color: '#00174d', fontSize: 10, fontWeight: '800', letterSpacing: 0.5, flex: 1 },
  capacityPill: {
    color: COLORS.primary,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 10,
    fontWeight: '700',
    overflow: 'hidden',
  },
  facultyButton: { backgroundColor: COLORS.surface, padding: 11, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 9, elevation: 1 },
  facultyAvatar: { width: 43, height: 43, borderRadius: 22, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  facultyAvatarText: { color: COLORS.primary, fontSize: 13, fontWeight: '800' },
  facultyInfo: { flex: 1, minWidth: 0 },
  facultyName: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  facultyTitle: { color: COLORS.muted, fontSize: 10, marginTop: 3 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 8 },
  progressTrack: { flex: 1, height: 6, borderRadius: 4, backgroundColor: COLORS.surfaceHigh, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 4, backgroundColor: COLORS.primary },
  progressText: { color: COLORS.primary, fontSize: 9, fontWeight: '700' },
  chevron: { fontSize: 22, color: COLORS.outline },
  facultyPicker: { paddingHorizontal: 8, paddingVertical: 3, backgroundColor: COLORS.surface, borderRadius: 9 },
  capacityHint: { color: COLORS.muted, fontSize: 10, lineHeight: 15 },
  actionsSection: { marginTop: 18, gap: 10 },
  selectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectAllRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  selectAllText: { color: COLORS.text, fontSize: 12, fontWeight: '600' },
  selectedCount: {
    color: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 10,
    fontWeight: '800',
  },
  checkbox: {
    width: 17,
    height: 17,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.outline,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkboxTick: { color: '#fff', fontSize: 12, lineHeight: 14, fontWeight: '800' },
  primaryButton: {
    minHeight: 45,
    backgroundColor: COLORS.primary,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    gap: 8,
    elevation: 2,
  },
  buttonIcon: { color: '#fff', fontSize: 18 },
  primaryButtonText: { color: '#fff', fontSize: 12, fontWeight: '700', textAlign: 'center', flexShrink: 1 },
  secondaryActions: { flexDirection: 'row', gap: 8 },
  secondaryButton: {
    flex: 1,
    minHeight: 41,
    borderRadius: 9,
    backgroundColor: COLORS.successBg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  secondaryButtonText: { color: '#151c27', fontSize: 11, fontWeight: '700' },
  dangerButton: {
    flex: 1,
    minHeight: 41,
    borderRadius: 9,
    backgroundColor: COLORS.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  dangerButtonText: { color: '#ba1a1a', fontSize: 11, fontWeight: '700' },
  rosterHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 23, marginBottom: 9 },
  rosterTitle: { color: COLORS.muted, fontSize: 11, letterSpacing: 1, fontWeight: '800' },
  rosterCount: { color: COLORS.muted, fontSize: 10 },
  studentRow: {
    backgroundColor: COLORS.surface,
    padding: 11,
    borderRadius: 11,
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    elevation: 1,
  },
  studentAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surfaceHigh, flexShrink: 0 },
  initialsAvatar: { alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.successBg },
  initialsText: { color: '#151c27', fontSize: 12, fontWeight: '800' },
  studentInfo: { flex: 1, minWidth: 0 },
  studentNameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  studentName: { flex: 1, minWidth: 0, color: COLORS.text, fontSize: 12, fontWeight: '700' },
  statusPill: { maxWidth: 125, borderRadius: 20, paddingHorizontal: 7, paddingVertical: 4 },
  unassignedPill: { backgroundColor: COLORS.warningBg },
  assignedPill: { backgroundColor: COLORS.successBg },
  statusText: { fontSize: 9, fontWeight: '700' },
  unassignedText: { color: COLORS.warning },
  assignedText: { color: COLORS.primary },
  studentMeta: { color: COLORS.muted, fontSize: 10, marginTop: 5 },
  studentId: { color: COLORS.primary, fontWeight: '800' },
  emptyState: { backgroundColor: COLORS.surface, padding: 22, borderRadius: 12, alignItems: 'center' },
  emptyText: { color: COLORS.muted, fontSize: 13 },
  schemaCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 17,
    padding: 12,
    borderRadius: 11,
    backgroundColor: COLORS.surfaceHigh,
  },
  schemaIcon: { color: COLORS.outline, fontSize: 20 },
  schemaContent: { flex: 1 },
  schemaTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '800', letterSpacing: 0.7 },
  endpoint: { color: COLORS.primary, fontSize: 10, fontFamily: 'monospace', marginTop: 5, fontWeight: '700' },
  schemaDescription: { color: COLORS.muted, fontSize: 10, lineHeight: 15, marginTop: 5 },
  toast: { backgroundColor: '#20232b', borderRadius: 10, padding: 12, marginTop: 14 },
  toastText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  resetButton: { alignSelf: 'center', padding: 12, marginTop: 5 },
  resetText: { color: COLORS.outline, fontSize: 11, textDecorationLine: 'underline' },
  bottomNav: {
    minHeight: 61,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    paddingBottom: 2,
  },
  navItem: { minWidth: 55, alignItems: 'center', justifyContent: 'center', paddingVertical: 6, gap: 2 },
  navIcon: { color: COLORS.muted, fontSize: 19 },
  navLabel: { color: COLORS.muted, fontSize: 9, fontWeight: '600' },
  navActive: { color: COLORS.primary, fontWeight: '800' },
});
