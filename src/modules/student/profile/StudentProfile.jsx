import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Linking,
  Animated,
  Modal,
  Pressable,
  TextInput,
  ActivityIndicator,
} from '@/ui';
import { MaterialIcons } from '@/ui';
import { useAuth } from '../../auth/context/AuthContext';
import { getMyProfile, updateMyProfile } from '../../../services/api/profiles';

const PROFILE_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCVXP3laCjvBlZEVugtzpX20kCifG87-9yGGVWnUCmaIhNtCcDdG9HmCKcyaSa4oTc-QPnHNb5RR_pO0Xd8oVLNtxyVdxbttBW5KjbrzMiMJD0HcqApHxFuVbC5_KEUHnW0qOr98kurfIJ2NAVvw464MLzvDAN8LdJTSZXSqkbDkysN8V9Lzled9wZvQVwVorYcKfLMT1do8whwEUyopOcVpVMNt3wTCpl8mQ00dAziqalPOmZQTqcZ';

export default function StudentProfile({ navigation }) {
  const { user, profile: authProfile, updateProfile, signOut } = useAuth();
  const [profile, setProfile] = useState(authProfile || null);

  // Editable Academic Records State
  const [cgpa, setCgpa] = useState('8.92');
  const [semester, setSemester] = useState('6');
  const [section, setSection] = useState('A');
  const [batch, setBatch] = useState('2022–2026');
  const [registerNo, setRegisterNo] = useState('714022104045');
  const [rollNo, setRollNo] = useState('22AD045');
  const [department, setDepartment] = useState('Artificial Intelligence & Data Science');
  const [degree, setDegree] = useState('B.Tech - Artificial Intelligence & Data Science');
  const [mentor, setMentor] = useState('Dr. R. Kavitha, M.E., Ph.D.');
  const [regulation, setRegulation] = useState('Anna University Regulation 2021');
  const [admissionType, setAdmissionType] = useState('Merit • TNEA Counselling');

  // Institutional Clearance State
  const [facultyDesignation, setFacultyDesignation] = useState('Assistant Professor (Sr. Gr.)');
  const [departmentCode, setDepartmentCode] = useState('AIDS • CSE Allied');
  const [classAdvisory, setClassAdvisory] = useState('III Year AI & DS (Sec A)');
  const [portalStatus, setPortalStatus] = useState('Verified Faculty');

  // Academic Editor Modal State
  const [academicModalOpen, setAcademicModalOpen] = useState(false);
  const [isSavingAcademic, setIsSavingAcademic] = useState(false);

  // Edit Temp Form State
  const [editCgpa, setEditCgpa] = useState('8.92');
  const [editSemester, setEditSemester] = useState('6');
  const [editSection, setEditSection] = useState('A');
  const [editBatch, setEditBatch] = useState('2022–2026');
  const [editRegisterNo, setEditRegisterNo] = useState('714022104045');
  const [editRollNo, setEditRollNo] = useState('22AD045');
  const [editDepartment, setEditDepartment] = useState('Artificial Intelligence & Data Science');
  const [editMentor, setEditMentor] = useState('Dr. R. Kavitha, M.E., Ph.D.');
  const [editFacultyDesignation, setEditFacultyDesignation] = useState('Assistant Professor (Sr. Gr.)');
  const [editDepartmentCode, setEditDepartmentCode] = useState('AIDS • CSE Allied');
  const [editClassAdvisory, setEditClassAdvisory] = useState('III Year AI & DS (Sec A)');
  const [editPortalStatus, setEditPortalStatus] = useState('Verified Faculty');

  // Toast State
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const toastOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isMounted = true;
    if (authProfile) {
      setProfile(authProfile);
      syncProfileFields(authProfile);
    } else {
      getMyProfile()
        .then((data) => {
          if (isMounted && data) {
            setProfile(data);
            syncProfileFields(data);
          }
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [authProfile]);

  const syncProfileFields = (p) => {
    if (p?.cgpa) {
      setCgpa(String(p.cgpa));
      setEditCgpa(String(p.cgpa));
    }
    if (p?.semester) {
      setSemester(String(p.semester));
      setEditSemester(String(p.semester));
    }
    if (p?.section) {
      setSection(String(p.section));
      setEditSection(String(p.section));
    }
    if (p?.batch) {
      setBatch(String(p.batch));
      setEditBatch(String(p.batch));
    }
    if (p?.register_number) {
      setRegisterNo(String(p.register_number));
      setEditRegisterNo(String(p.register_number));
    }
    if (p?.roll_number) {
      setRollNo(String(p.roll_number));
      setEditRollNo(String(p.roll_number));
    }
    if (p?.department?.name || p?.department) {
      const dName = p.department?.name || p.department;
      setDepartment(dName);
      setEditDepartment(dName);
    }
    if (p?.faculty_mentor?.full_name || p?.mentor_name) {
      const mName = p.faculty_mentor?.full_name || p.mentor_name;
      setMentor(mName);
      setEditMentor(mName);
    }
    if (p?.faculty_designation || p?.designation) {
      const fd = p.faculty_designation || p.designation;
      setFacultyDesignation(fd);
      setEditFacultyDesignation(fd);
    }
    if (p?.department_code) {
      setDepartmentCode(p.department_code);
      setEditDepartmentCode(p.department_code);
    }
    if (p?.class_advisory) {
      setClassAdvisory(p.class_advisory);
      setEditClassAdvisory(p.class_advisory);
    }
    if (p?.portal_status) {
      setPortalStatus(p.portal_status);
      setEditPortalStatus(p.portal_status);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setToastVisible(true);
    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setToastVisible(false);
      });
    }, 2400);
  };

  const openAcademicModal = () => {
    setEditCgpa(cgpa);
    setEditSemester(semester);
    setEditSection(section);
    setEditBatch(batch);
    setEditRegisterNo(registerNo);
    setEditRollNo(rollNo);
    setEditDepartment(department);
    setEditMentor(mentor);
    setEditFacultyDesignation(facultyDesignation);
    setEditDepartmentCode(departmentCode);
    setEditClassAdvisory(classAdvisory);
    setEditPortalStatus(portalStatus);
    setAcademicModalOpen(true);
  };

  const handleSaveAcademic = async () => {
    try {
      setIsSavingAcademic(true);
      const payload = {
        cgpa: parseFloat(editCgpa) || 8.92,
        semester: parseInt(editSemester, 10) || 6,
        section: editSection.trim(),
        batch: editBatch.trim(),
        register_number: editRegisterNo.trim(),
        roll_number: editRollNo.trim(),
        department: editDepartment.trim(),
        mentor_name: editMentor.trim(),
        faculty_designation: editFacultyDesignation.trim(),
        designation: editFacultyDesignation.trim(),
        department_code: editDepartmentCode.trim(),
        class_advisory: editClassAdvisory.trim(),
        portal_status: editPortalStatus.trim(),
      };

      if (updateProfile) {
        await updateProfile(payload);
      } else {
        await updateMyProfile(payload);
      }

      // Update Local State
      setCgpa(editCgpa.trim());
      setSemester(editSemester.trim());
      setSection(editSection.trim());
      setBatch(editBatch.trim());
      setRegisterNo(editRegisterNo.trim());
      setRollNo(editRollNo.trim());
      setDepartment(editDepartment.trim());
      setMentor(editMentor.trim());
      setFacultyDesignation(editFacultyDesignation.trim());
      setDepartmentCode(editDepartmentCode.trim());
      setClassAdvisory(editClassAdvisory.trim());
      setPortalStatus(editPortalStatus.trim());

      setAcademicModalOpen(false);
      showToast('Profile & Institutional Clearance updated successfully!');
    } catch (e) {
      // Local fallback
      setCgpa(editCgpa.trim());
      setSemester(editSemester.trim());
      setSection(editSection.trim());
      setBatch(editBatch.trim());
      setRegisterNo(editRegisterNo.trim());
      setRollNo(editRollNo.trim());
      setDepartment(editDepartment.trim());
      setMentor(editMentor.trim());
      setFacultyDesignation(editFacultyDesignation.trim());
      setDepartmentCode(editDepartmentCode.trim());
      setClassAdvisory(editClassAdvisory.trim());
      setPortalStatus(editPortalStatus.trim());

      setAcademicModalOpen(false);
      showToast('Profile & Institutional Clearance updated locally.');
    } finally {
      setIsSavingAcademic(false);
    }
  };

  const studentName = profile?.full_name || profile?.name || user?.profile?.full_name || user?.name || 'Prakash S';
  const emailText = profile?.email || user?.email || 'prakash.s@infotech.edu.in';
  const phoneText = profile?.phone || '+91 98765 43210';
  const dobText = profile?.date_of_birth || '14 Aug 2003';
  const bloodGroupText = profile?.blood_group || 'O+ve';
  const addressText = profile?.address || 'Room 304, Kaveri Hostel Block B • Campus Residence';
  const avatarUri = profile?.avatar_url || profile?.avatar || user?.profile?.avatar_url || user?.avatar || PROFILE_IMAGE;

  const openEmail = () => Linking.openURL(`mailto:${emailText}`);
  const openPhone = () => Linking.openURL(`tel:${phoneText}`);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.laptopContainer}>
          {/* Top Breadcrumb & Action Toolbar */}
          <View style={styles.topToolbar}>
            <View style={styles.breadcrumbWrap}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => {
                  if (navigation && navigation.canGoBack()) navigation.goBack();
                  else navigation?.navigate('StudentDashboard');
                }}
                activeOpacity={0.7}
              >
                <MaterialIcons name="arrow-back" size={18} color="#003fb1" />
                <Text style={styles.backBtnText}>Dashboard</Text>
              </TouchableOpacity>
              <Text style={styles.breadcrumbDivider}>/</Text>
              <Text style={styles.breadcrumbCurrent}>Student Academic Profile & Records</Text>
              <Text style={styles.breadcrumbTag}>{registerNo}</Text>
            </View>

            <View style={styles.topActionGroup}>
              {/* PRIMARY ACTION: Edit Academic Records */}
              <TouchableOpacity
                style={styles.actionBtnPrimary}
                onPress={openAcademicModal}
                activeOpacity={0.8}
                title="Edit Academic Records & CGPA"
              >
                <MaterialIcons name="school" size={18} color="#ffffff" />
                <Text style={styles.actionBtnPrimaryText}>Edit Academic Records</Text>
              </TouchableOpacity>

              {/* SECONDARY ACTION: Edit Personal Info */}
              <TouchableOpacity
                style={styles.actionBtnSecondary}
                onPress={() => navigation?.navigate('StudentEditProfile')}
                activeOpacity={0.8}
              >
                <MaterialIcons name="edit" size={18} color="#003fb1" />
                <Text style={styles.actionBtnSecondaryText}>Edit Personal Info</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtnOutline}
                onPress={() => navigation?.navigate('StudentTimetable')}
                activeOpacity={0.8}
              >
                <MaterialIcons name="calendar-month" size={18} color="#475569" />
                <Text style={styles.actionBtnOutlineText}>Timetable</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Student Executive Hero Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroBannerBackground}>
              <View style={styles.bannerCircleOne} />
              <View style={styles.bannerCircleTwo} />
            </View>

            <View style={styles.heroBody}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={{ uri: avatarUri }}
                  style={styles.avatarImage}
                  onError={(e) => {
                    if (e?.target) e.target.src = '/info_logo.png';
                  }}
                />
                <View style={styles.avatarStatusBadge} title="Active Enrolled Student">
                  <View style={styles.avatarPulseDot} />
                </View>
              </View>

              <View style={styles.heroMeta}>
                <View style={styles.heroBadgeRow}>
                  <View style={styles.registerBadge}>
                    <MaterialIcons name="badge" size={13} color="#ffffff" />
                    <Text style={styles.registerBadgeText}>Reg: {registerNo}</Text>
                  </View>
                  <View style={styles.deptBadge}>
                    <Text style={styles.deptBadgeText}>{department}</Text>
                  </View>
                  <View style={styles.semesterBadge}>
                    <Text style={styles.semesterBadgeText}>Semester {semester} • Sec {section}</Text>
                  </View>
                  <View style={styles.batchBadge}>
                    <Text style={styles.batchBadgeText}>Batch {batch}</Text>
                  </View>
                </View>

                <Text style={styles.heroName}>{studentName}</Text>
                <Text style={styles.heroSubtitle}>
                  {degree} • Academic Standing: First Class with Distinction (CGPA: {cgpa})
                </Text>
              </View>

              <View style={styles.heroActionArea}>
                <TouchableOpacity
                  style={styles.editAcademicPillBtn}
                  onPress={openAcademicModal}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="edit" size={15} color="#003fb1" />
                  <Text style={styles.editAcademicPillText}>Edit Records</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* 2-Column Responsive Laptop Layout */}
          <View style={styles.laptopGrid}>
            {/* Left Column: Personal, Mentor, Campus Verification */}
            <View style={styles.leftCol}>
              {/* Card 1: Personal & Contact Information */}
              <View style={styles.sectionCard}>
                <View style={styles.cardHeaderWithAction}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={styles.cardHeaderIconWrap}>
                      <MaterialIcons name="person" size={18} color="#003fb1" />
                    </View>
                    <Text style={styles.cardHeaderTitle}>Personal Information</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.cardMiniEditBtn}
                    onPress={() => navigation?.navigate('StudentEditProfile')}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="edit" size={14} color="#003fb1" />
                    <Text style={styles.cardMiniEditText}>Edit</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.contactList}>
                  {/* Email */}
                  <TouchableOpacity style={styles.contactItem} onPress={openEmail} activeOpacity={0.7}>
                    <View style={styles.contactIconCircle}>
                      <MaterialIcons name="email" size={18} color="#003fb1" />
                    </View>
                    <View style={styles.contactDetails}>
                      <Text style={styles.contactLabel}>Institutional Student Email</Text>
                      <Text style={styles.contactValue}>{emailText}</Text>
                    </View>
                    <MaterialIcons name="open-in-new" size={15} color="#94a3b8" />
                  </TouchableOpacity>

                  {/* Phone */}
                  <TouchableOpacity style={styles.contactItem} onPress={openPhone} activeOpacity={0.7}>
                    <View style={styles.contactIconCircle}>
                      <MaterialIcons name="phone" size={18} color="#003fb1" />
                    </View>
                    <View style={styles.contactDetails}>
                      <Text style={styles.contactLabel}>Mobile Contact Number</Text>
                      <Text style={styles.contactValue}>{phoneText}</Text>
                    </View>
                    <MaterialIcons name="call" size={15} color="#94a3b8" />
                  </TouchableOpacity>

                  {/* DOB & Blood Group */}
                  <View style={styles.contactItem}>
                    <View style={styles.contactIconCircle}>
                      <MaterialIcons name="cake" size={18} color="#003fb1" />
                    </View>
                    <View style={styles.contactDetails}>
                      <Text style={styles.contactLabel}>DOB & Blood Group</Text>
                      <Text style={styles.contactValue}>{dobText} • {bloodGroupText}</Text>
                    </View>
                  </View>

                  {/* Residence / Hostel */}
                  <View style={styles.contactItem}>
                    <View style={styles.contactIconCircle}>
                      <MaterialIcons name="home" size={18} color="#003fb1" />
                    </View>
                    <View style={styles.contactDetails}>
                      <Text style={styles.contactLabel}>Residence / Hostel Block</Text>
                      <Text style={styles.contactValue}>{addressText}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Card 2: Faculty Mentor & Proctor */}
              <View style={styles.sectionCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderIconWrap}>
                    <MaterialIcons name="support-agent" size={18} color="#003fb1" />
                  </View>
                  <Text style={styles.cardHeaderTitle}>Faculty Mentor & Proctor</Text>
                </View>

                <View style={styles.mentorBox}>
                  <View style={styles.mentorTopRow}>
                    <View style={styles.mentorAvatar}>
                      <MaterialIcons name="person" size={24} color="#003fb1" />
                    </View>
                    <View style={styles.mentorInfo}>
                      <Text style={styles.mentorName}>{mentor}</Text>
                      <Text style={styles.mentorRole}>Professor & HOD • Academic Counselor</Text>
                    </View>
                  </View>
                  <View style={styles.mentorCabinRow}>
                    <MaterialIcons name="room" size={14} color="#64748b" />
                    <Text style={styles.mentorCabinText}>HOD Executive Suite • Admin Wing 2nd Floor</Text>
                  </View>
                  <View style={styles.mentorNotice}>
                    <Text style={styles.mentorNoticeText}>
                      Assigned proctor guiding semester performance, attendance reviews, and internship credentials.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Card 3: Institutional Clearance Card (Editable) */}
              <View style={styles.sectionCard}>
                <View style={styles.cardHeaderWithAction}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={styles.cardHeaderIconWrap}>
                      <MaterialIcons name="security" size={18} color="#003fb1" />
                    </View>
                    <Text style={styles.cardHeaderTitle}>Institutional Clearance</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.cardHeaderBtn}
                    onPress={openAcademicModal}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="edit" size={13} color="#003fb1" />
                    <Text style={styles.cardHeaderBtnText}>Edit</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.clearanceList}>
                  <View style={styles.clearanceRow}>
                    <Text style={styles.clearanceLabel}>Faculty Designation</Text>
                    <Text style={styles.clearanceVal}>{facultyDesignation}</Text>
                  </View>
                  <View style={styles.clearanceRow}>
                    <Text style={styles.clearanceLabel}>Department Code</Text>
                    <Text style={styles.clearanceVal}>{departmentCode}</Text>
                  </View>
                  <View style={styles.clearanceRow}>
                    <Text style={styles.clearanceLabel}>Class Advisory</Text>
                    <Text style={styles.clearanceVal}>{classAdvisory}</Text>
                  </View>
                  <View style={styles.clearanceRow}>
                    <Text style={styles.clearanceLabel}>Portal Status</Text>
                    <View style={styles.verifiedBadge}>
                      <MaterialIcons name="verified" size={13} color="#166534" />
                      <Text style={styles.verifiedBadgeText}>{portalStatus}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Right Column: Academic KPIs, EDITABLE Academic Records, Course Load, Launch */}
            <View style={styles.rightCol}>
              {/* Academic KPI Cards (4 Tiles) */}
              <View style={styles.kpiGrid}>
                <View style={styles.kpiTile}>
                  <View style={styles.kpiTileTop}>
                    <Text style={styles.kpiValue}>{cgpa}</Text>
                    <View style={[styles.kpiIconWrap, { backgroundColor: '#dbeafe' }]}>
                      <MaterialIcons name="grade" size={20} color="#003fb1" />
                    </View>
                  </View>
                  <Text style={styles.kpiLabel}>Cumulative GPA (CGPA)</Text>
                  <Text style={styles.kpiSub}>Scale 10.0 • Rank #3 in Section</Text>
                </View>

                <View style={styles.kpiTile}>
                  <View style={styles.kpiTileTop}>
                    <Text style={styles.kpiValue}>86.4%</Text>
                    <View style={[styles.kpiIconWrap, { backgroundColor: '#dcfce7' }]}>
                      <MaterialIcons name="how-to-reg" size={20} color="#166534" />
                    </View>
                  </View>
                  <Text style={styles.kpiLabel}>Cumulative Attendance</Text>
                  <Text style={styles.kpiSub}>Safe from 75% shortage</Text>
                </View>

                <View style={styles.kpiTile}>
                  <View style={styles.kpiTileTop}>
                    <Text style={styles.kpiValue}>132</Text>
                    <View style={[styles.kpiIconWrap, { backgroundColor: '#fef3c7' }]}>
                      <MaterialIcons name="stars" size={20} color="#92400e" />
                    </View>
                  </View>
                  <Text style={styles.kpiLabel}>Credits Earned</Text>
                  <Text style={styles.kpiSub}>132 / 168 Total Degree Credits</Text>
                </View>

                <View style={styles.kpiTile}>
                  <View style={styles.kpiTileTop}>
                    <Text style={styles.kpiValue}>0</Text>
                    <View style={[styles.kpiIconWrap, { backgroundColor: '#f3e8ff' }]}>
                      <MaterialIcons name="check-circle" size={20} color="#7c3aed" />
                    </View>
                  </View>
                  <Text style={styles.kpiLabel}>Course Arrears</Text>
                  <Text style={styles.kpiSub}>100% Course Clearance</Text>
                </View>
              </View>

              {/* EDITABLE Academic Records Section Card */}
              <View style={[styles.sectionCard, styles.academicRecordsCard]}>
                <View style={styles.cardHeaderWithAction}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={[styles.cardHeaderIconWrap, { backgroundColor: '#dbeafe' }]}>
                      <MaterialIcons name="school" size={18} color="#003fb1" />
                    </View>
                    <View>
                      <Text style={styles.cardHeaderTitle}>Institutional Academic Records</Text>
                      <Text style={styles.cardHeaderSub}>
                        Curricular progression, enrollment attributes & semester records
                      </Text>
                    </View>
                  </View>

                  {/* EDIT BUTTON DIRECTLY ON ACADEMIC RECORDS */}
                  <TouchableOpacity
                    style={styles.editAcademicBtn}
                    onPress={openAcademicModal}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons name="edit" size={15} color="#ffffff" />
                    <Text style={styles.editAcademicBtnText}>Edit Academic Records</Text>
                  </TouchableOpacity>
                </View>

                {/* Academic Records Grid Display */}
                <View style={styles.academicRecordsGrid}>
                  <View style={styles.recordItem}>
                    <Text style={styles.recordLabel}>Cumulative GPA (CGPA)</Text>
                    <View style={styles.recordValWrap}>
                      <Text style={[styles.recordValue, { color: '#003fb1', fontWeight: '800' }]}>
                        {cgpa} / 10.0
                      </Text>
                      <View style={styles.editableBadge}>
                        <Text style={styles.editableBadgeText}>Editable</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.recordItem}>
                    <Text style={styles.recordLabel}>Current Semester</Text>
                    <View style={styles.recordValWrap}>
                      <Text style={styles.recordValue}>Semester {semester}</Text>
                      <View style={styles.editableBadge}>
                        <Text style={styles.editableBadgeText}>Editable</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.recordItem}>
                    <Text style={styles.recordLabel}>Section</Text>
                    <View style={styles.recordValWrap}>
                      <Text style={styles.recordValue}>Section {section}</Text>
                      <View style={styles.editableBadge}>
                        <Text style={styles.editableBadgeText}>Editable</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.recordItem}>
                    <Text style={styles.recordLabel}>Academic Batch</Text>
                    <View style={styles.recordValWrap}>
                      <Text style={styles.recordValue}>{batch}</Text>
                      <View style={styles.editableBadge}>
                        <Text style={styles.editableBadgeText}>Editable</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.recordItem}>
                    <Text style={styles.recordLabel}>Register Number</Text>
                    <View style={styles.recordValWrap}>
                      <Text style={styles.recordValue}>{registerNo}</Text>
                      <View style={styles.editableBadge}>
                        <Text style={styles.editableBadgeText}>Editable</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.recordItem}>
                    <Text style={styles.recordLabel}>Roll Number</Text>
                    <View style={styles.recordValWrap}>
                      <Text style={styles.recordValue}>{rollNo}</Text>
                      <View style={styles.editableBadge}>
                        <Text style={styles.editableBadgeText}>Editable</Text>
                      </View>
                    </View>
                  </View>

                  <View style={[styles.recordItem, { width: '100%' }]}>
                    <Text style={styles.recordLabel}>Degree Program & Department</Text>
                    <Text style={styles.recordValue}>{department} ({degree})</Text>
                  </View>

                  <View style={[styles.recordItem, { width: '100%' }]}>
                    <Text style={styles.recordLabel}>Assigned Faculty Mentor</Text>
                    <View style={styles.recordValWrap}>
                      <Text style={styles.recordValue}>{mentor}</Text>
                      <View style={styles.editableBadge}>
                        <Text style={styles.editableBadgeText}>Editable</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.recordItem}>
                    <Text style={styles.recordLabel}>Curricular Regulation</Text>
                    <Text style={styles.recordValue}>{regulation}</Text>
                  </View>

                  <View style={styles.recordItem}>
                    <Text style={styles.recordLabel}>Admission Quota / Seat</Text>
                    <Text style={styles.recordValue}>{admissionType}</Text>
                  </View>
                </View>

                {/* Edit Prompt Notice */}
                <View style={styles.editPromptBanner}>
                  <MaterialIcons name="info-outline" size={16} color="#003fb1" />
                  <Text style={styles.editPromptText}>
                    Academic records can be updated anytime by clicking <Text style={{ fontWeight: '700' }}>"Edit Academic Records"</Text> above.
                  </Text>
                </View>
              </View>

              {/* Current Semester Enrolled Courses Card */}
              <View style={styles.sectionCard}>
                <View style={styles.cardHeaderWithAction}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={styles.cardHeaderIconWrap}>
                      <MaterialIcons name="menu-book" size={18} color="#003fb1" />
                    </View>
                    <View>
                      <Text style={styles.cardHeaderTitle}>Current Semester Course Enrolment</Text>
                      <Text style={styles.cardHeaderSub}>Semester 6 • 5 Enrolled Courses & Laboratories</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.cardHeaderBtn}
                    onPress={() => navigation?.navigate('StudentTimetable')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cardHeaderBtnText}>Full Timetable</Text>
                    <MaterialIcons name="arrow-forward" size={14} color="#003fb1" />
                  </TouchableOpacity>
                </View>

                <View style={styles.courseList}>
                  <View style={styles.courseItem}>
                    <View style={styles.courseItemHeader}>
                      <View style={styles.courseCodeBadge}>
                        <Text style={styles.courseCodeText}>AD3501</Text>
                      </View>
                      <Text style={styles.courseTitle}>Deep Learning Architectures</Text>
                      <View style={styles.theoryPill}>
                        <Text style={styles.theoryPillText}>Theory • 4 Credits</Text>
                      </View>
                    </View>
                    <View style={styles.courseItemMeta}>
                      <Text style={styles.courseMetaText}>Faculty: Dr. S. Kabilan • LH-302</Text>
                      <Text style={[styles.courseMetaText, { color: '#166534', fontWeight: '600' }]}>94.2% Attendance</Text>
                    </View>
                  </View>

                  <View style={styles.courseItem}>
                    <View style={styles.courseItemHeader}>
                      <View style={styles.courseCodeBadge}>
                        <Text style={styles.courseCodeText}>CS3301</Text>
                      </View>
                      <Text style={styles.courseTitle}>Data Structures & Algorithms</Text>
                      <View style={styles.theoryPill}>
                        <Text style={styles.theoryPillText}>Theory • 3 Credits</Text>
                      </View>
                    </View>
                    <View style={styles.courseItemMeta}>
                      <Text style={styles.courseMetaText}>Faculty: Dr. R. Kavitha • LH-204</Text>
                      <Text style={[styles.courseMetaText, { color: '#166534', fontWeight: '600' }]}>91.5% Attendance</Text>
                    </View>
                  </View>

                  <View style={styles.courseItem}>
                    <View style={styles.courseCodeItem}>
                      <View style={styles.courseCodeBadge}>
                        <Text style={styles.courseCodeText}>AD3511</Text>
                      </View>
                      <Text style={styles.courseTitle}>Deep Learning Laboratory</Text>
                      <View style={styles.labPill}>
                        <Text style={styles.labPillText}>Practical • 2 Credits</Text>
                      </View>
                    </View>
                    <View style={styles.courseItemMeta}>
                      <Text style={styles.courseMetaText}>Faculty: Dr. S. Kabilan • AI Lab 2</Text>
                      <Text style={[styles.courseMetaText, { color: '#166534', fontWeight: '600' }]}>96.0% Attendance</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Student Quick Launch Console */}
              <View style={styles.sectionCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderIconWrap}>
                    <MaterialIcons name="bolt" size={18} color="#003fb1" />
                  </View>
                  <Text style={styles.cardHeaderTitle}>Student Quick Launch Console</Text>
                </View>

                <View style={styles.quickLaunchGrid}>
                  <TouchableOpacity
                    style={styles.quickLaunchTile}
                    onPress={() => navigation?.navigate('StudentAttendanceDetail')}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.quickLaunchIcon, { backgroundColor: '#eff6ff' }]}>
                      <MaterialIcons name="how-to-reg" size={22} color="#003fb1" />
                    </View>
                    <Text style={styles.quickLaunchTitle}>Attendance Review</Text>
                    <Text style={styles.quickLaunchSub}>Subject breakdown & safe hours</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickLaunchTile}
                    onPress={() => navigation?.navigate('StudyMaterials')}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.quickLaunchIcon, { backgroundColor: '#f0fdf4' }]}>
                      <MaterialIcons name="menu-book" size={22} color="#166534" />
                    </View>
                    <Text style={styles.quickLaunchTitle}>Study Materials</Text>
                    <Text style={styles.quickLaunchSub}>Course syllabus & notes bank</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickLaunchTile}
                    onPress={() => navigation?.navigate('StudentTimetable')}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.quickLaunchIcon, { backgroundColor: '#f5f3ff' }]}>
                      <MaterialIcons name="calendar-view-week" size={22} color="#7c3aed" />
                    </View>
                    <Text style={styles.quickLaunchTitle}>Weekly Timetable</Text>
                    <Text style={styles.quickLaunchSub}>Lecture periods & lab slots</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickLaunchTile}
                    onPress={() => navigation?.navigate('StudentFacultyPortal', { role: 'STUDENT', from: 'student' })}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.quickLaunchIcon, { backgroundColor: '#fef3c7' }]}>
                      <MaterialIcons name="support-agent" size={22} color="#92400e" />
                    </View>
                    <Text style={styles.quickLaunchTitle}>Campus Services</Text>
                    <Text style={styles.quickLaunchSub}>Lost & found, maintenance desk</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ========================================================= */}
      {/* EDIT ACADEMIC RECORDS MODAL DIALOG                        */}
      {/* ========================================================= */}
      <Modal
        visible={academicModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setAcademicModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalDismissArea} onPress={() => setAcademicModalOpen(false)} />

          <View style={styles.modalDialogCard}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalHeaderBadge}>
                  <MaterialIcons name="school" size={13} color="#003fb1" />
                  <Text style={styles.modalHeaderBadgeText}>EDIT ACADEMIC CREDENTIALS</Text>
                </View>
                <Text style={styles.modalTitle}>Edit Student Academic Records</Text>
                <Text style={styles.modalSub}>
                  Update your curricular standing, CGPA, semester, section, and mentor details
                </Text>
              </View>

              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setAcademicModalOpen(false)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Modal Form ScrollView */}
            <ScrollView style={styles.modalScrollView} contentContainerStyle={styles.modalScrollContent}>
              <View style={styles.modalFormGrid}>
                {/* CGPA & Semester Row */}
                <View style={styles.modalRowTwo}>
                  <View style={[styles.modalFormGroup, { flex: 1 }]}>
                    <Text style={styles.modalLabel}>Cumulative GPA (CGPA) *</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={editCgpa}
                      onChangeText={setEditCgpa}
                      placeholder="e.g. 8.92"
                      placeholderTextColor="#94a3b8"
                      keyboardType="numeric"
                    />
                    <Text style={styles.modalHelp}>Scale from 0.00 to 10.00</Text>
                  </View>

                  <View style={[styles.modalFormGroup, { flex: 1 }]}>
                    <Text style={styles.modalLabel}>Current Semester *</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={editSemester}
                      onChangeText={setEditSemester}
                      placeholder="e.g. 6"
                      placeholderTextColor="#94a3b8"
                      keyboardType="numeric"
                    />
                    <Text style={styles.modalHelp}>Semester number (1 – 8)</Text>
                  </View>
                </View>

                {/* Section & Batch Row */}
                <View style={styles.modalRowTwo}>
                  <View style={[styles.modalFormGroup, { flex: 1 }]}>
                    <Text style={styles.modalLabel}>Section / Division *</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={editSection}
                      onChangeText={setEditSection}
                      placeholder="e.g. A"
                      placeholderTextColor="#94a3b8"
                    />
                    <Text style={styles.modalHelp}>Assigned section (A, B, C)</Text>
                  </View>

                  <View style={[styles.modalFormGroup, { flex: 1 }]}>
                    <Text style={styles.modalLabel}>Academic Batch *</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={editBatch}
                      onChangeText={setEditBatch}
                      placeholder="e.g. 2022–2026"
                      placeholderTextColor="#94a3b8"
                    />
                    <Text style={styles.modalHelp}>Admission batch tenure</Text>
                  </View>
                </View>

                {/* Register No & Roll No Row */}
                <View style={styles.modalRowTwo}>
                  <View style={[styles.modalFormGroup, { flex: 1 }]}>
                    <Text style={styles.modalLabel}>University Register Number *</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={editRegisterNo}
                      onChangeText={setEditRegisterNo}
                      placeholder="e.g. 714022104045"
                      placeholderTextColor="#94a3b8"
                    />
                    <Text style={styles.modalHelp}>Anna University registration code</Text>
                  </View>

                  <View style={[styles.modalFormGroup, { flex: 1 }]}>
                    <Text style={styles.modalLabel}>College Roll Number *</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={editRollNo}
                      onChangeText={setEditRollNo}
                      placeholder="e.g. 22AD045"
                      placeholderTextColor="#94a3b8"
                    />
                    <Text style={styles.modalHelp}>Department internal roll code</Text>
                  </View>
                </View>

                {/* Department & Program */}
                <View style={styles.modalFormGroup}>
                  <Text style={styles.modalLabel}>Department & Degree Program *</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={editDepartment}
                    onChangeText={setEditDepartment}
                    placeholder="e.g. Artificial Intelligence & Data Science"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                {/* Faculty Mentor */}
                <View style={styles.modalFormGroup}>
                  <Text style={styles.modalLabel}>Assigned Faculty Mentor *</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={editMentor}
                    onChangeText={setEditMentor}
                    placeholder="e.g. Dr. R. Kavitha, M.E., Ph.D."
                    placeholderTextColor="#94a3b8"
                  />
                  <Text style={styles.modalHelp}>Proctor assigned to oversee academic progress</Text>
                </View>

                {/* Institutional Clearance Divider */}
                <View style={styles.modalSectionDivider}>
                  <MaterialIcons name="security" size={15} color="#003fb1" />
                  <Text style={styles.modalSectionDividerText}>INSTITUTIONAL CLEARANCE</Text>
                </View>

                {/* Faculty Designation & Department Code */}
                <View style={styles.modalRowTwo}>
                  <View style={[styles.modalFormGroup, { flex: 1 }]}>
                    <Text style={styles.modalLabel}>Faculty Designation</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={editFacultyDesignation}
                      onChangeText={setEditFacultyDesignation}
                      placeholder="e.g. Assistant Professor (Sr. Gr.)"
                      placeholderTextColor="#94a3b8"
                    />
                  </View>

                  <View style={[styles.modalFormGroup, { flex: 1 }]}>
                    <Text style={styles.modalLabel}>Department Code</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={editDepartmentCode}
                      onChangeText={setEditDepartmentCode}
                      placeholder="e.g. AIDS • CSE Allied"
                      placeholderTextColor="#94a3b8"
                    />
                  </View>
                </View>

                {/* Class Advisory & Portal Status */}
                <View style={styles.modalRowTwo}>
                  <View style={[styles.modalFormGroup, { flex: 1 }]}>
                    <Text style={styles.modalLabel}>Class Advisory</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={editClassAdvisory}
                      onChangeText={setEditClassAdvisory}
                      placeholder="e.g. III Year AI & DS (Sec A)"
                      placeholderTextColor="#94a3b8"
                    />
                  </View>

                  <View style={[styles.modalFormGroup, { flex: 1 }]}>
                    <Text style={styles.modalLabel}>Portal Status</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={editPortalStatus}
                      onChangeText={setEditPortalStatus}
                      placeholder="e.g. Verified Faculty"
                      placeholderTextColor="#94a3b8"
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Modal Footer Actions */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setAcademicModalOpen(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSaveBtn, isSavingAcademic && { opacity: 0.7 }]}
                onPress={handleSaveAcademic}
                disabled={isSavingAcademic}
                activeOpacity={0.8}
              >
                {isSavingAcademic ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <MaterialIcons name="check" size={16} color="#ffffff" />
                )}
                <Text style={styles.modalSaveBtnText}>
                  {isSavingAcademic ? 'Saving Records...' : 'Save Academic Records'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Toast Notification */}
      {toastVisible && (
        <Animated.View style={[styles.toastContainer, { opacity: toastOpacity }]}>
          <MaterialIcons name="check-circle" size={18} color="#22c55e" />
          <Text style={styles.toastMessage}>{toastMessage}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
    alignItems: 'center',
  },
  laptopContainer: {
    width: '100%',
    maxWidth: 1200,
    gap: 20,
  },

  /* Top Toolbar */
  topToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  breadcrumbWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#003fb1',
  },
  breadcrumbDivider: {
    fontSize: 14,
    color: '#94a3b8',
  },
  breadcrumbCurrent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  breadcrumbTag: {
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: '#eff6ff',
    color: '#003fb1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  topActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#003fb1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#003fb1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtnPrimaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnSecondaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#003fb1',
  },
  actionBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnOutlineText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },

  /* Hero Student Card */
  heroCard: {
    backgroundColor: '#003fb1',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#003fb1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 4,
  },
  heroBannerBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  bannerCircleOne: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: -120,
    right: -40,
  },
  bannerCircleTwo: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    bottom: -60,
    left: 120,
  },
  heroBody: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    gap: 24,
    flexWrap: 'wrap',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#ffffff',
    backgroundColor: '#ffffff',
  },
  avatarStatusBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  avatarPulseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
  },
  heroMeta: {
    flex: 1,
    minWidth: 260,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  registerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  registerBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  deptBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  deptBadgeText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#ffffff',
  },
  semesterBadge: {
    backgroundColor: 'rgba(254, 240, 138, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(254, 240, 138, 0.4)',
  },
  semesterBadgeText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#fef08a',
  },
  batchBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  batchBadgeText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#ffffff',
  },
  heroName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 13.5,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    lineHeight: 20,
  },
  heroActionArea: {
    alignSelf: 'center',
  },
  editAcademicPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  editAcademicPillText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#003fb1',
  },

  /* 2-Column Laptop Grid */
  laptopGrid: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  leftCol: {
    width: 360,
    gap: 20,
  },
  rightCol: {
    flex: 1,
    minWidth: 320,
    gap: 20,
  },

  /* Shared Section Card */
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  academicRecordsCard: {
    borderColor: '#bfdbfe',
    backgroundColor: '#ffffff',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  cardHeaderWithAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    flexWrap: 'wrap',
    gap: 10,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  cardHeaderIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  cardHeaderSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  cardMiniEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cardMiniEditText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#003fb1',
  },
  editAcademicBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#003fb1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#003fb1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  editAcademicBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },

  /* Contact List */
  contactList: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  contactIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactDetails: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  contactValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 2,
  },

  /* Mentor Box */
  mentorBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  mentorTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mentorAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  mentorInfo: {
    flex: 1,
  },
  mentorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  mentorRole: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  mentorCabinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  mentorCabinText: {
    fontSize: 12,
    color: '#475569',
  },
  mentorNotice: {
    marginTop: 8,
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  mentorNoticeText: {
    fontSize: 11.5,
    color: '#64748b',
    lineHeight: 16,
  },

  /* Verification & Institutional Clearance */
  verifyList: {
    gap: 10,
  },
  verifyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  verifyLabel: {
    fontSize: 12.5,
    color: '#64748b',
  },
  verifyVal: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0f172a',
  },
  statusPillActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillActiveText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#166534',
  },
  clearanceList: {
    gap: 10,
  },
  clearanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  clearanceLabel: {
    fontSize: 12.5,
    color: '#64748b',
  },
  clearanceVal: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#059669',
  },
  modalSectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    marginBottom: 4,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalSectionDividerText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#003fb1',
    letterSpacing: 0.5,
  },

  /* KPI Grid */
  kpiGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  kpiTile: {
    flex: 1,
    minWidth: 170,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  kpiTileTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
  },
  kpiIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 8,
  },
  kpiSub: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 2,
  },

  /* Academic Records Grid */
  academicRecordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  recordItem: {
    width: '48%',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  recordLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  recordValWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  recordValue: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 2,
  },
  editableBadge: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  editableBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#003fb1',
  },
  editPromptBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    padding: 10,
    borderRadius: 8,
    marginTop: 14,
  },
  editPromptText: {
    fontSize: 12,
    color: '#1e3a8a',
    flex: 1,
    lineHeight: 17,
  },

  /* Course List */
  courseList: {
    gap: 10,
  },
  courseItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
  },
  courseCodeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  courseItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  courseCodeBadge: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  courseCodeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  courseTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    flex: 1,
  },
  theoryPill: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  theoryPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#003fb1',
  },
  labPill: {
    backgroundColor: '#f5f3ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  labPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7c3aed',
  },
  courseItemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  courseMetaText: {
    fontSize: 11.5,
    color: '#64748b',
  },

  /* Quick Launch Grid */
  quickLaunchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickLaunchTile: {
    flex: 1,
    minWidth: 180,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    alignItems: 'center',
    textAlign: 'center',
  },
  quickLaunchIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickLaunchTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
  },
  quickLaunchSub: {
    fontSize: 11.5,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 2,
  },

  /* Modal Dialog Styles */
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
    maxWidth: 680,
    maxHeight: '90%',
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
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 20,
  },
  modalFormGrid: {
    gap: 14,
  },
  modalRowTwo: {
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'wrap',
  },
  modalFormGroup: {
    gap: 5,
  },
  modalLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13.5,
    color: '#0f172a',
  },
  modalHelp: {
    fontSize: 11,
    color: '#94a3b8',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#f8fafc',
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  modalCancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  modalSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#003fb1',
  },
  modalSaveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },

  /* Toast */
  toastContainer: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 9999,
  },
  toastMessage: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
});
