import React, { useState, useEffect, useMemo } from 'react';
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
  TextInput,
  Alert,
} from '@/ui';
import { MaterialIcons } from '@/ui';
import Colors from '../../../constants/colors';
import Typography from '../../../constants/typography';
import TopAppBar from '../../../components/common/TopAppBar';
import BottomNavBar from '../../../components/common/BottomNavBar';
import {
  getSubjects,
  createSubject,
  deleteSubject,
  getCourseOfferings,
  createCourseOffering,
  deleteCourseOffering,
  getAcademicMetadata,
} from '../../../services/api/academic';

const C = {
  primary: '#003fb1',
  primaryDark: '#002f87',
  primaryContainer: '#dbe1ff',
  onPrimary: '#ffffff',
  background: '#faf8ff',
  white: '#ffffff',
  surfaceLow: '#f3f3fe',
  surfaceContainer: '#ededf8',
  text: '#191b23',
  muted: '#585f6c',
  outline: '#c3c5d7',
  error: '#ba1a1a',
  errorBg: '#ffdad6',
  green: '#137547',
  greenBg: '#e1f5e8',
  blueBg: '#dbeafe',
  blueText: '#003fb1',
  amberBg: '#fef3c7',
  amberText: '#92400e',
  purpleBg: '#f3e8ff',
  purpleText: '#6b21a8',
};

export default function SubjectManagement({ navigation, route }) {
  const initialTab = route?.params?.tab === 'allocations' ? 'allocations' : 'subjects';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Data states
  const [subjects, setSubjects] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [metadata, setMetadata] = useState({ departments: [], sections: [], staff: [], subjects: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');

  // Modal states
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Subject Form
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubTitle, setNewSubTitle] = useState('');
  const [newSubCredits, setNewSubCredits] = useState('3');
  const [newSubDeptId, setNewSubDeptId] = useState('');
  const [newSubType, setNewSubType] = useState('Core Theory');

  // Assign Subject Form
  const [assignSubId, setAssignSubId] = useState('');
  const [assignStaffId, setAssignStaffId] = useState('');
  const [assignSectionId, setAssignSectionId] = useState('');
  const [assignYear, setAssignYear] = useState('2025-2026');
  const [assignSemester, setAssignSemester] = useState('7');

  const loadData = async () => {
    try {
      setLoading(true);
      const [subsRes, offsRes, metaRes] = await Promise.all([
        getSubjects(),
        getCourseOfferings(),
        getAcademicMetadata(),
      ]);

      setSubjects(subsRes?.data || subsRes || []);
      setOfferings(offsRes?.data || offsRes || []);
      const meta = metaRes?.data || metaRes || { departments: [], sections: [], staff: [], subjects: [] };
      setMetadata(meta);

      if (meta.departments?.length > 0 && !newSubDeptId) {
        setNewSubDeptId(String(meta.departments[0].id));
      }
      if (meta.subjects?.length > 0 && !assignSubId) {
        setAssignSubId(String(meta.subjects[0].id));
      }
      if (meta.staff?.length > 0 && !assignStaffId) {
        setAssignStaffId(String(meta.staff[0].id));
      }
      if (meta.sections?.length > 0 && !assignSectionId) {
        setAssignSectionId(String(meta.sections[0].id));
      }
    } catch (err) {
      console.error('Failed to load academic data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute Metrics
  const totalStudentsEnrolled = useMemo(() => {
    return offerings.reduce((acc, curr) => acc + (curr.student_count || 0), 0);
  }, [offerings]);

  const uniqueFacultyAssigned = useMemo(() => {
    const staffIds = new Set(offerings.map((o) => o.staff_id));
    return staffIds.size;
  }, [offerings]);

  // Filtered Subjects
  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const matchSearch =
        !searchQuery.trim() ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.department_name && s.department_name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchDept =
        selectedDeptFilter === 'ALL' ||
        String(s.department_id) === String(selectedDeptFilter) ||
        s.department_name?.includes(selectedDeptFilter);

      return matchSearch && matchDept;
    });
  }, [subjects, searchQuery, selectedDeptFilter]);

  // Filtered Course Offerings
  const filteredOfferings = useMemo(() => {
    return offerings.filter((o) => {
      const matchSearch =
        !searchQuery.trim() ||
        o.subject_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.subject_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.staff_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.section_name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchDept =
        selectedDeptFilter === 'ALL' ||
        o.department_name?.includes(selectedDeptFilter);

      return matchSearch && matchDept;
    });
  }, [offerings, searchQuery, selectedDeptFilter]);

  // Actions
  const handleCreateSubject = async () => {
    if (!newSubCode.trim() || !newSubTitle.trim()) {
      Alert.alert('Required Fields', 'Please enter both Subject Code and Title.');
      return;
    }
    setSubmitting(true);
    try {
      await createSubject({
        code: newSubCode.trim().toUpperCase(),
        title: newSubTitle.trim(),
        credits: parseInt(newSubCredits, 10) || 3,
        department_id: parseInt(newSubDeptId, 10) || 1,
        subject_type: newSubType,
      });
      Alert.alert('Subject Created', `Subject ${newSubCode.toUpperCase()} was added to the catalog.`);
      setShowAddSubjectModal(false);
      setNewSubCode('');
      setNewSubTitle('');
      loadData();
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to create subject.';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubject = (subject) => {
    Alert.alert(
      'Delete Subject',
      `Are you sure you want to delete ${subject.code} - ${subject.title}? This will also remove any assigned allocations.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSubject(subject.id);
              Alert.alert('Deleted', `Subject ${subject.code} deleted.`);
              loadData();
            } catch (err) {
              const msg = err.response?.data?.detail || err.message || 'Failed to delete subject.';
              Alert.alert('Error', msg);
            }
          },
        },
      ]
    );
  };

  const handleAssignOffering = async () => {
    if (!assignSubId || !assignStaffId || !assignSectionId) {
      Alert.alert('Required Fields', 'Please select a Subject, Faculty member, and Section.');
      return;
    }
    setSubmitting(true);
    try {
      await createCourseOffering({
        subject_id: parseInt(assignSubId, 10),
        staff_id: parseInt(assignStaffId, 10),
        section_id: parseInt(assignSectionId, 10),
        academic_year: assignYear || '2025-2026',
        semester: parseInt(assignSemester, 10) || 7,
      });
      Alert.alert('Allocation Created', 'Subject assigned to faculty and class section successfully.');
      setShowAssignModal(false);
      loadData();
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to allocate subject.';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOffering = (offering) => {
    Alert.alert(
      'Unassign Subject',
      `Unassign ${offering.subject_code} from ${offering.staff_name} for ${offering.section_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unassign',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCourseOffering(offering.id);
              Alert.alert('Unassigned', 'Course allocation removed successfully.');
              loadData();
            } catch (err) {
              const msg = err.response?.data?.detail || err.message || 'Failed to unassign subject.';
              Alert.alert('Error', msg);
            }
          },
        },
      ]
    );
  };

  // Helper for current selected section's student count preview in modal
  const selectedSectionDetails = useMemo(() => {
    return metadata.sections?.find((s) => String(s.id) === String(assignSectionId));
  }, [metadata.sections, assignSectionId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopAppBar
        title="Curriculum & Allocations"
        subtitle="Manage subject catalog and assign faculty to student cohorts"
        onNotificationPress={() => {}}
        onProfilePress={() => navigation?.navigate('AdminDashboard')}
      />

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        {/* Top Header Card */}
        <View style={styles.headerBanner}>
          <View style={{ flex: 1 }}>
            <View style={styles.badgeRow}>
              <View style={styles.roleBadge}>
                <MaterialIcons name="admin-panel-settings" size={14} color={C.primary} />
                <Text style={styles.roleBadgeText}>ACADEMIC GOVERNANCE</Text>
              </View>
              <View style={[styles.roleBadge, { backgroundColor: C.greenBg }]}>
                <MaterialIcons name="verified" size={14} color={C.green} />
                <Text style={[styles.roleBadgeText, { color: C.green }]}>2025–2026 ACTIVE</Text>
              </View>
            </View>
            <Text style={styles.headerTitle}>Subject Allocation & Master</Text>
            <Text style={styles.headerSubtitle}>
              Authoritative course catalog, faculty workload assignments, and section enrollment headcounts.
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={() => setShowAssignModal(true)}
              activeOpacity={0.8}
            >
              <MaterialIcons name="person-add" size={18} color="#ffffff" />
              <Text style={styles.primaryActionText}>Assign Subject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryActionButton}
              onPress={() => setShowAddSubjectModal(true)}
              activeOpacity={0.8}
            >
              <MaterialIcons name="add" size={18} color={C.primary} />
              <Text style={styles.secondaryActionText}>Add Subject</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4 Metrics Cards Row */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={[styles.metricIconWrap, { backgroundColor: C.blueBg }]}>
              <MaterialIcons name="menu-book" size={20} color={C.blueText} />
            </View>
            <Text style={styles.metricValue}>{subjects.length}</Text>
            <Text style={styles.metricLabel}>Subjects in Catalog</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconWrap, { backgroundColor: C.purpleBg }]}>
              <MaterialIcons name="assignment" size={20} color={C.purpleText} />
            </View>
            <Text style={styles.metricValue}>{offerings.length}</Text>
            <Text style={styles.metricLabel}>Active Allocations</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconWrap, { backgroundColor: C.greenBg }]}>
              <MaterialIcons name="groups" size={20} color={C.green} />
            </View>
            <Text style={styles.metricValue}>{totalStudentsEnrolled}</Text>
            <Text style={styles.metricLabel}>Enrolled Students</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconWrap, { backgroundColor: C.amberBg }]}>
              <MaterialIcons name="school" size={20} color={C.amberText} />
            </View>
            <Text style={styles.metricValue}>{uniqueFacultyAssigned}</Text>
            <Text style={styles.metricLabel}>Teaching Staff</Text>
          </View>
        </View>

        {/* Tab Switcher & Search Bar */}
        <View style={styles.tabBarCard}>
          <View style={styles.tabButtonsRow}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'subjects' && styles.tabButtonActive]}
              onPress={() => setActiveTab('subjects')}
            >
              <MaterialIcons
                name="library-books"
                size={18}
                color={activeTab === 'subjects' ? C.primary : C.muted}
              />
              <Text style={[styles.tabButtonText, activeTab === 'subjects' && styles.tabButtonTextActive]}>
                Subject Catalog ({subjects.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'allocations' && styles.tabButtonActive]}
              onPress={() => setActiveTab('allocations')}
            >
              <MaterialIcons
                name="assignment-ind"
                size={18}
                color={activeTab === 'allocations' ? C.primary : C.muted}
              />
              <Text style={[styles.tabButtonText, activeTab === 'allocations' && styles.tabButtonTextActive]}>
                Faculty Allocations ({offerings.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search & Filter Row */}
          <View style={styles.filterRow}>
            <View style={styles.searchBar}>
              <MaterialIcons name="search" size={20} color={C.muted} />
              <TextInput
                style={styles.searchInput}
                placeholder={
                  activeTab === 'subjects'
                    ? 'Search by code, title, or department...'
                    : 'Search by faculty name, subject, or section...'
                }
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={C.muted}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <MaterialIcons name="close" size={18} color={C.muted} />
                </TouchableOpacity>
              ) : null}
            </View>

            <TouchableOpacity
              style={styles.refreshButton}
              onPress={loadData}
              activeOpacity={0.7}
            >
              <MaterialIcons name="refresh" size={20} color={C.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Area */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={C.primary} />
            <Text style={styles.loadingText}>Loading curriculum and allocation records...</Text>
          </View>
        ) : activeTab === 'subjects' ? (
          /* =========================================================================
             TAB 1: SUBJECT CATALOG (MASTER)
             ========================================================================= */
          <View style={styles.contentCard}>
            <View style={styles.contentCardHeader}>
              <View>
                <Text style={styles.contentCardTitle}>Subject Master Catalog</Text>
                <Text style={styles.contentCardSub}>
                  Official departmental courses, credits, and curricular classification
                </Text>
              </View>
              <TouchableOpacity
                style={styles.addInlineButton}
                onPress={() => setShowAddSubjectModal(true)}
              >
                <MaterialIcons name="add" size={16} color="#ffffff" />
                <Text style={styles.addInlineButtonText}>New Subject</Text>
              </TouchableOpacity>
            </View>

            {filteredSubjects.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="menu-book" size={48} color={C.outline} />
                <Text style={styles.emptyTitle}>No Subjects Found</Text>
                <Text style={styles.emptySub}>
                  {searchQuery ? 'No subjects matched your search.' : 'Add your first subject to get started.'}
                </Text>
              </View>
            ) : (
              <View style={styles.tableWrapper}>
                <View style={styles.tableHead}>
                  <Text style={[styles.thCell, { flex: 1.2 }]}>CODE</Text>
                  <Text style={[styles.thCell, { flex: 2.5 }]}>SUBJECT TITLE</Text>
                  <Text style={[styles.thCell, { flex: 1.8 }]}>DEPARTMENT</Text>
                  <Text style={[styles.thCell, { flex: 1, textAlign: 'center' }]}>CREDITS</Text>
                  <Text style={[styles.thCell, { flex: 1.4 }]}>TYPE</Text>
                  <Text style={[styles.thCell, { flex: 1.2, textAlign: 'center' }]}>ASSIGNED</Text>
                  <Text style={[styles.thCell, { flex: 0.8, textAlign: 'right' }]}>ACTION</Text>
                </View>

                {filteredSubjects.map((sub, idx) => (
                  <View
                    key={sub.id || idx}
                    style={[styles.tableRow, idx % 2 === 1 && { backgroundColor: '#f9f9fe' }]}
                  >
                    <View style={[{ flex: 1.2 }, styles.rowAlignCenter]}>
                      <View style={styles.codeBadge}>
                        <Text style={styles.codeBadgeText}>{sub.code}</Text>
                      </View>
                    </View>

                    <View style={[{ flex: 2.5 }, styles.rowAlignCenter]}>
                      <Text style={styles.subjectTitleText} numberOfLines={2}>
                        {sub.title}
                      </Text>
                    </View>

                    <View style={[{ flex: 1.8 }, styles.rowAlignCenter]}>
                      <Text style={styles.deptText} numberOfLines={1}>
                        {sub.department_name || 'Engineering'}
                      </Text>
                    </View>

                    <View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center' }]}>
                      <Text style={styles.creditsText}>{sub.credits} Cr</Text>
                    </View>

                    <View style={[{ flex: 1.4 }, styles.rowAlignCenter]}>
                      <View
                        style={[
                          styles.typeBadge,
                          sub.subject_type?.includes('Lab')
                            ? { backgroundColor: C.amberBg }
                            : { backgroundColor: C.blueBg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.typeBadgeText,
                            sub.subject_type?.includes('Lab')
                              ? { color: C.amberText }
                              : { color: C.blueText },
                          ]}
                        >
                          {sub.subject_type || 'Core Theory'}
                        </Text>
                      </View>
                    </View>

                    <View style={[{ flex: 1.2, alignItems: 'center', justifyContent: 'center' }]}>
                      <Text style={styles.allocCountText}>
                        {sub.offerings_count || 0} class{sub.offerings_count === 1 ? '' : 'es'}
                      </Text>
                    </View>

                    <View style={[{ flex: 0.8, alignItems: 'flex-end', justifyContent: 'center' }]}>
                      <TouchableOpacity
                        style={styles.deleteIconButton}
                        onPress={() => handleDeleteSubject(sub)}
                        title="Delete Subject"
                      >
                        <MaterialIcons name="delete-outline" size={20} color={C.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          /* =========================================================================
             TAB 2: FACULTY ALLOCATIONS (COURSE OFFERINGS)
             ========================================================================= */
          <View style={styles.contentCard}>
            <View style={styles.contentCardHeader}>
              <View>
                <Text style={styles.contentCardTitle}>Faculty Subject Allocations</Text>
                <Text style={styles.contentCardSub}>
                  Assigned teaching faculty, allocated student sections, and enrollment numbers
                </Text>
              </View>
              <TouchableOpacity
                style={styles.addInlineButton}
                onPress={() => setShowAssignModal(true)}
              >
                <MaterialIcons name="person-add" size={16} color="#ffffff" />
                <Text style={styles.addInlineButtonText}>Assign Subject</Text>
              </TouchableOpacity>
            </View>

            {filteredOfferings.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="assignment-ind" size={48} color={C.outline} />
                <Text style={styles.emptyTitle}>No Allocations Found</Text>
                <Text style={styles.emptySub}>
                  {searchQuery ? 'No allocations match your filter.' : 'Assign a subject to faculty to begin tracking.'}
                </Text>
              </View>
            ) : (
              <View style={styles.tableWrapper}>
                <View style={styles.tableHead}>
                  <Text style={[styles.thCell, { flex: 2.2 }]}>SUBJECT</Text>
                  <Text style={[styles.thCell, { flex: 2.2 }]}>FACULTY ASSIGNED</Text>
                  <Text style={[styles.thCell, { flex: 1.8 }]}>SECTION & DEPT</Text>
                  <Text style={[styles.thCell, { flex: 1.5, textAlign: 'center' }]}>ENROLLED STUDENTS</Text>
                  <Text style={[styles.thCell, { flex: 1.3, textAlign: 'center' }]}>ACADEMIC TERM</Text>
                  <Text style={[styles.thCell, { flex: 0.8, textAlign: 'right' }]}>ACTION</Text>
                </View>

                {filteredOfferings.map((off, idx) => (
                  <View
                    key={off.id || idx}
                    style={[styles.tableRow, idx % 2 === 1 && { backgroundColor: '#f9f9fe' }]}
                  >
                    {/* Subject info */}
                    <View style={[{ flex: 2.2 }, styles.rowAlignCenter]}>
                      <View>
                        <View style={styles.subjectRowHeader}>
                          <Text style={styles.offeringCode}>{off.subject_code}</Text>
                          <Text style={styles.offeringCredits}>{off.credits} Cr</Text>
                        </View>
                        <Text style={styles.offeringTitle} numberOfLines={1}>
                          {off.subject_title}
                        </Text>
                      </View>
                    </View>

                    {/* Faculty */}
                    <View style={[{ flex: 2.2 }, styles.rowAlignCenter]}>
                      <View style={styles.facultyWrap}>
                        <View style={styles.facultyAvatar}>
                          <Text style={styles.facultyAvatarText}>
                            {off.staff_name ? off.staff_name.charAt(0) : 'F'}
                          </Text>
                        </View>
                        <View style={{ marginLeft: 8, flex: 1 }}>
                          <Text style={styles.facultyName} numberOfLines={1}>
                            {off.staff_name}
                          </Text>
                          <Text style={styles.facultyIdText}>
                            {off.staff_faculty_id || 'FACULTY'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Section */}
                    <View style={[{ flex: 1.8 }, styles.rowAlignCenter]}>
                      <View>
                        <Text style={styles.sectionBadgeText}>{off.section_name}</Text>
                        <Text style={styles.deptSmallText} numberOfLines={1}>
                          {off.department_name || 'Engineering'}
                        </Text>
                      </View>
                    </View>

                    {/* Enrolled Students */}
                    <View style={[{ flex: 1.5, alignItems: 'center', justifyContent: 'center' }]}>
                      <View style={styles.studentCountBadge}>
                        <MaterialIcons name="groups" size={14} color={C.green} />
                        <Text style={styles.studentCountNumber}>{off.student_count || 0}</Text>
                        <Text style={styles.studentCountLabel}>enrolled</Text>
                      </View>
                    </View>

                    {/* Term */}
                    <View style={[{ flex: 1.3, alignItems: 'center', justifyContent: 'center' }]}>
                      <Text style={styles.termYearText}>{off.academic_year || '2025-2026'}</Text>
                      <Text style={styles.termSemText}>Semester {off.semester || 7}</Text>
                    </View>

                    {/* Delete Action */}
                    <View style={[{ flex: 0.8, alignItems: 'flex-end', justifyContent: 'center' }]}>
                      <TouchableOpacity
                        style={styles.deleteIconButton}
                        onPress={() => handleDeleteOffering(off)}
                        title="Unassign Subject"
                      >
                        <MaterialIcons name="link-off" size={20} color={C.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* =========================================================================
         MODAL 1: ADD NEW SUBJECT TO CATALOG
         ========================================================================= */}
      <Modal
        visible={showAddSubjectModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddSubjectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialIcons name="post-add" size={24} color={C.primary} />
                <Text style={styles.modalTitle}>Add Subject to Catalog</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddSubjectModal(false)}>
                <MaterialIcons name="close" size={20} color={C.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 460 }}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Subject Code *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. CS8703, IT3401"
                  value={newSubCode}
                  onChangeText={setNewSubCode}
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Subject Title / Course Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Distributed Computing and Microservices"
                  value={newSubTitle}
                  onChangeText={setNewSubTitle}
                />
              </View>

              <View style={styles.formRowTwo}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.formLabel}>Credits</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="3"
                    value={newSubCredits}
                    onChangeText={setNewSubCredits}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1.5 }]}>
                  <Text style={styles.formLabel}>Subject Type</Text>
                  <View style={styles.typeSelectorRow}>
                    {['Core Theory', 'Practical Lab', 'Elective'].map((t) => (
                      <TouchableOpacity
                        key={t}
                        style={[
                          styles.typePill,
                          newSubType === t && styles.typePillActive,
                        ]}
                        onPress={() => setNewSubType(t)}
                      >
                        <Text
                          style={[
                            styles.typePillText,
                            newSubType === t && styles.typePillTextActive,
                          ]}
                        >
                          {t.split(' ')[0]}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Academic Department</Text>
                <View style={styles.departmentSelectWrap}>
                  {metadata.departments?.map((d) => (
                    <TouchableOpacity
                      key={d.id}
                      style={[
                        styles.deptOptionPill,
                        String(newSubDeptId) === String(d.id) && styles.deptOptionPillActive,
                      ]}
                      onPress={() => setNewSubDeptId(String(d.id))}
                    >
                      <Text
                        style={[
                          styles.deptOptionText,
                          String(newSubDeptId) === String(d.id) && styles.deptOptionTextActive,
                        ]}
                      >
                        {d.code} • {d.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setShowAddSubjectModal(false)}
              >
                <Text style={styles.cancelModalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitModalBtn}
                onPress={handleCreateSubject}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.submitModalBtnText}>Save Subject</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* =========================================================================
         MODAL 2: ASSIGN SUBJECT TO STAFF WITH STUDENTS
         ========================================================================= */}
      <Modal
        visible={showAssignModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAssignModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialIcons name="assignment-ind" size={24} color={C.primary} />
                <Text style={styles.modalTitle}>Assign Subject to Faculty</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAssignModal(false)}>
                <MaterialIcons name="close" size={20} color={C.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 500 }}>
              {/* Select Subject */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>1. Select Subject / Course *</Text>
                <View style={styles.selectOptionsWrap}>
                  {metadata.subjects?.map((sub) => (
                    <TouchableOpacity
                      key={sub.id}
                      style={[
                        styles.selectCardOption,
                        String(assignSubId) === String(sub.id) && styles.selectCardOptionActive,
                      ]}
                      onPress={() => setAssignSubId(String(sub.id))}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.selectCardCode}>{sub.code}</Text>
                        <Text style={styles.selectCardCredits}>{sub.credits} Credits</Text>
                      </View>
                      <Text style={styles.selectCardTitle} numberOfLines={1}>
                        {sub.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Select Faculty Staff */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>2. Assign Faculty Member *</Text>
                <View style={styles.selectOptionsWrap}>
                  {metadata.staff?.map((st) => (
                    <TouchableOpacity
                      key={st.id}
                      style={[
                        styles.selectCardOption,
                        String(assignStaffId) === String(st.id) && styles.selectCardOptionActive,
                      ]}
                      onPress={() => setAssignStaffId(String(st.id))}
                    >
                      <Text style={styles.selectCardName} numberOfLines={1}>
                        {st.name}
                      </Text>
                      <Text style={styles.selectCardSubText}>
                        {st.faculty_id} • {st.designation || 'Faculty'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Select Cohort Section (Shows Student Count) */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>3. Target Class Section & Students *</Text>
                <View style={styles.selectOptionsWrap}>
                  {metadata.sections?.map((sec) => (
                    <TouchableOpacity
                      key={sec.id}
                      style={[
                        styles.selectCardOption,
                        String(assignSectionId) === String(sec.id) && styles.selectCardOptionActive,
                      ]}
                      onPress={() => setAssignSectionId(String(sec.id))}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.selectCardName}>
                          {sec.name} ({sec.department_name || 'CSE'})
                        </Text>
                        <View style={styles.previewStudentPill}>
                          <MaterialIcons name="people" size={13} color={C.green} />
                          <Text style={styles.previewStudentPillText}>
                            {sec.student_count || 0} Students
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.selectCardSubText}>
                        Semester {sec.semester || 7} • Batch 2021–2025
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Term & Year */}
              <View style={styles.formRowTwo}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.formLabel}>Academic Year</Text>
                  <TextInput
                    style={styles.formInput}
                    value={assignYear}
                    onChangeText={setAssignYear}
                    placeholder="2025-2026"
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Semester</Text>
                  <TextInput
                    style={styles.formInput}
                    value={assignSemester}
                    onChangeText={setAssignSemester}
                    keyboardType="numeric"
                    placeholder="7"
                  />
                </View>
              </View>

              {/* Live Enrollment Preview Card */}
              {selectedSectionDetails && (
                <View style={styles.liveEnrollmentCard}>
                  <MaterialIcons name="info" size={18} color={C.primary} />
                  <View style={{ marginLeft: 8, flex: 1 }}>
                    <Text style={styles.liveEnrollmentTitle}>Enrolled Student Group</Text>
                    <Text style={styles.liveEnrollmentText}>
                      This subject will be assigned to Section {selectedSectionDetails.name} containing{' '}
                      <Text style={{ fontWeight: '700', color: C.green }}>
                        {selectedSectionDetails.student_count || 0} enrolled students
                      </Text>
                      . Attendance rosters and timetables will automatically link these students.
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setShowAssignModal(false)}
              >
                <Text style={styles.cancelModalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitModalBtn}
                onPress={handleAssignOffering}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.submitModalBtnText}>Confirm Allocation</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNavBar navigation={navigation} activeScreen="SubjectManagement" role="ADMIN" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 90,
  },
  headerBanner: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e8e8f2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.primaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: C.primary,
    letterSpacing: 0.5,
  },
  headerTitle: {
    ...Typography.headlineMedium,
    color: C.text,
    fontWeight: '800',
  },
  headerSubtitle: {
    ...Typography.bodyMedium,
    color: C.muted,
    marginTop: 4,
    maxWidth: 580,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  primaryActionButton: {
    backgroundColor: C.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  primaryActionText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryActionButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: C.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  secondaryActionText: {
    color: C.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  metricCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: C.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8e8f2',
  },
  metricIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: C.text,
  },
  metricLabel: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  tabBarCard: {
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e8e8f2',
    gap: 12,
  },
  tabButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f8',
    paddingBottom: 8,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  tabButtonActive: {
    backgroundColor: C.primaryContainer,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.muted,
  },
  tabButtonTextActive: {
    color: C.primary,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surfaceLow,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: C.text,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: C.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentCard: {
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e8e8f2',
    overflow: 'hidden',
  },
  contentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f8',
  },
  contentCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  contentCardSub: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  addInlineButton: {
    backgroundColor: C.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  addInlineButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  tableWrapper: {
    width: '100%',
  },
  tableHead: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.surfaceLow,
    borderBottomWidth: 1,
    borderBottomColor: '#ededf6',
  },
  thCell: {
    fontSize: 11,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f3fa',
    alignItems: 'center',
  },
  rowAlignCenter: {
    justifyContent: 'center',
  },
  codeBadge: {
    backgroundColor: C.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  codeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.primary,
    letterSpacing: 0.5,
  },
  subjectTitleText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
  },
  deptText: {
    fontSize: 12,
    color: C.muted,
  },
  creditsText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.text,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  allocCountText: {
    fontSize: 12,
    color: C.muted,
    fontWeight: '500',
  },
  deleteIconButton: {
    padding: 6,
    borderRadius: 6,
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: C.muted,
    marginTop: 4,
  },
  loadingContainer: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: C.muted,
  },
  // Allocations tab specific styles
  subjectRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  offeringCode: {
    fontSize: 13,
    fontWeight: '700',
    color: C.primary,
  },
  offeringCredits: {
    fontSize: 11,
    color: C.muted,
    backgroundColor: C.surfaceLow,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  offeringTitle: {
    fontSize: 12,
    color: C.text,
    marginTop: 2,
  },
  facultyWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  facultyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  facultyAvatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.primary,
  },
  facultyName: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
  },
  facultyIdText: {
    fontSize: 11,
    color: C.muted,
  },
  sectionBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
  },
  deptSmallText: {
    fontSize: 11,
    color: C.muted,
    marginTop: 1,
  },
  studentCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.greenBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  studentCountNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: C.green,
  },
  studentCountLabel: {
    fontSize: 11,
    color: C.green,
    fontWeight: '500',
  },
  termYearText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.text,
  },
  termSemText: {
    fontSize: 11,
    color: C.muted,
  },
  // Modals
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
    maxWidth: 540,
    padding: 24,
    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f6',
    paddingBottom: 14,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.text,
  },
  formGroup: {
    marginBottom: 14,
  },
  formRowTwo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: C.text,
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 1,
    borderColor: C.outline,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: C.text,
    backgroundColor: '#ffffff',
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 6,
  },
  typePill: {
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.outline,
  },
  typePillActive: {
    backgroundColor: C.primaryContainer,
    borderColor: C.primary,
  },
  typePillText: {
    fontSize: 12,
    color: C.muted,
    fontWeight: '600',
  },
  typePillTextActive: {
    color: C.primary,
    fontWeight: '700',
  },
  departmentSelectWrap: {
    flexDirection: 'column',
    gap: 6,
  },
  deptOptionPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e8e8f2',
    backgroundColor: C.surfaceLow,
  },
  deptOptionPillActive: {
    backgroundColor: C.primaryContainer,
    borderColor: C.primary,
  },
  deptOptionText: {
    fontSize: 12,
    color: C.muted,
  },
  deptOptionTextActive: {
    color: C.primary,
    fontWeight: '700',
  },
  selectOptionsWrap: {
    flexDirection: 'column',
    gap: 6,
    maxHeight: 140,
  },
  selectCardOption: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e8e8f2',
    backgroundColor: C.surfaceLow,
  },
  selectCardOptionActive: {
    backgroundColor: C.primaryContainer,
    borderColor: C.primary,
  },
  selectCardCode: {
    fontSize: 12,
    fontWeight: '700',
    color: C.primary,
  },
  selectCardCredits: {
    fontSize: 11,
    color: C.muted,
  },
  selectCardTitle: {
    fontSize: 12,
    color: C.text,
    marginTop: 2,
  },
  selectCardName: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
  },
  selectCardSubText: {
    fontSize: 11,
    color: C.muted,
    marginTop: 1,
  },
  previewStudentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.greenBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  previewStudentPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.green,
  },
  liveEnrollmentCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0f4ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#d0dcff',
  },
  liveEnrollmentTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: C.primary,
  },
  liveEnrollmentText: {
    fontSize: 11,
    color: C.text,
    marginTop: 2,
    lineHeight: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f6',
    paddingTop: 14,
  },
  cancelModalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.outline,
  },
  cancelModalBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.muted,
  },
  submitModalBtn: {
    backgroundColor: C.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  submitModalBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});

