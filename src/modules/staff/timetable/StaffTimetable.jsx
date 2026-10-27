import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Linking,
  Modal,
  Pressable,
  Animated,
  TextInput,
  Dimensions,
} from '@/ui';
import { LinearGradient } from '@/ui';
import { MaterialIcons } from '@/ui';
import BottomNavBar from "../../../components/common/BottomNavBar";
import { useAuth } from "../../auth/context/AuthContext";
import { getTodaySchedule, getWeeklyTimetable } from "../../../services/api/timetable";


const PROFILE_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCmMRls2DIbRYqEh_bj0YZhKwj5bQuYM7Lbw7OYOmhmExufT6jPorpyjJ20otc1zTFrUcyXLqDaDCTbkqGRiusTlzHcfCk9XYMHSYEycMzVK5flABhogw7KLkgZNaFYtpcVpvkO9R2QLycxZMAPvyAcSzJpRA72W-_9mJ7tL_C-ZceRZHLt8D6v9gjFwh1zjwpewla_vSS5rdXMdQecYQUX6VOBNtcIuGmeiy0195fBoFT5zidOvpEM";

const TOP_PROFILE_IMG =
  "https://lh3.googleusercontent.com/aida/AEtjO1XvgRt7B_bP_GL-SgPqgkl1O39T8axc-4QY6kiJN9YuOSjZKzzXE9iqg-qdQDvJTxL_HvpwAsOZg9wMH6Tz1uHi0JjZHtBkJ5HdpQOvF-3FMyjiK1FYAym352dqT0Zofpcj1VHe21OK_Cnhpz5lFXRlmP5bq9Sl75qC18iW4KsS-PizFFiEyVv_rUYJsATyPvC-UqSmKGzj31B0prs2dlpJrBVsGmZN-2kCx6-jqx6vJzDAR0KFBi4H5nhEk_sUAftVEV8w7DFXFQ";

const faculty = [
  {
    initials: "DK",
    name: "Dr. Kumar",
    role: "Deep Learning • Cabin #312",
    email: "kumar.ad@infotech.edu.in",
    bg: "#dbe1ff",
    text: "#003fb1",
  },
  {
    initials: "SM",
    name: "Prof. Saravanan M",
    role: "DBMS • Cabin #208",
    email: "saravanan.cs@infotech.edu.in",
    bg: "#dce2f3",
    text: "#5e6572",
  },
  {
    initials: "AR",
    name: "Dr. Arulprakash P",
    role: "Operating Systems • HOD Office",
    email: "hod.aids@infotech.edu.in",
    bg: "#ffdbcf",
    text: "#802a00",
  },
];

const todaySchedule = [
  {
    period: "P1",
    time: "08:45 – 09:35 AM",
    title: "Data Structures & Algorithms",
    section: "III AI & DS – A • Room 302 (Theory Wing)",
    status: "Completed",
    attendance: "Attendance Marked (58/60 Present)",
  },
  {
    period: "P2",
    time: "09:35 – 10:25 AM",
    title: "Data Structures & Algorithms",
    section: "III AI & DS – B • Room 204",
    status: "Completed",
    attendance: "Attendance Marked (54/56 Present)",
  },
  {
    period: "P3",
    time: "10:40 – 11:30 AM",
    title: "Student Mentorship & Office Hours",
    section: "Dept. Staff Cabin 4 • Available for Research Guidance",
    status: "Free / Mentoring",
    mentoring: true,
  },
  {
    period: "P4 & P5",
    time: "11:30 AM – 02:00 PM",
    title: "Data Structures Lab (Practical)",
    section: "II AI & DS – A • AI Advanced Lab 2",
    status: "In Progress",
    lab: true,
  },
  {
    period: "P6",
    time: "02:00 – 02:50 PM",
    title: "Free Period • Substitution Pool",
    section: "Available for emergency substitution or grading activities",
    status: "Available Slot",
    free: true,
  },
];

const weeklySchedule = [
  {
    time: "08:45–09:35",
    mon: ["DS", "DK"],
    tue: ["DBMS", "SM"],
    wed: ["DL", "KM"],
    thu: ["OS", "AR"],
    fri: ["ML", "VG"],
  },
  {
    time: "09:35–10:25",
    mon: ["DBMS", "SM"],
    tue: ["DS", "DK"],
    wed: ["ML", "VG"],
    thu: ["DL", "KM"],
    fri: ["DBMS", "SM"],
  },
  {
    time: "10:40–11:30",
    mon: ["ML", "VG"],
    tue: ["OS", "AR"],
    wed: ["DS", "DK"],
    thu: ["DS*", "DK"],
    fri: ["DL", "KM"],
  },
  {
    time: "11:30–12:20",
    mon: ["DL", "KM"],
    tue: ["ML", "VG"],
    wed: ["DBMS", "SM"],
    thu: ["OS", "AR"],
    fri: ["DS", "DK"],
  },
  {
    time: "01:10–02:00",
    mon: ["OS", "AR"],
    tue: ["DL", "KM"],
    wed: ["ML", "VG"],
    thu: ["DBMS", "SM"],
    fri: ["ML", "VG"],
  },
  {
    time: "02:00–03:50",
    mon: ["AI Lab", "Lab 2"],
    tue: ["AI Lab", "Lab 1"],
    wed: ["DS Lab", "Lab 3"],
    thu: ["ML Lab", "Lab 2"],
    fri: ["Project", "CC 1"],
  },
];

export default function StaffTimetable({ navigation }) {
  const { user, profile } = useAuth();
  const [tab, setTab] = useState("today");
  const [facultyOpen, setFacultyOpen] = useState(false);
  const [lessonOpen, setLessonOpen] = useState(false);
  const [substitutionAccepted, setSubstitutionAccepted] = useState(false);
  const [selectedPeer, setSelectedPeer] = useState("Dr. Arun Kumar");
  const [customNote, setCustomNote] = useState("");
  const [toastText, setToastText] = useState("");
  const toastFade = useRef(new Animated.Value(0)).current;

  const facultyName = profile?.full_name || user?.profile?.full_name || "Dr. Kumar";
  const facultyId = profile?.faculty_id || user?.identifier || "FAC-2022-019";
  const facultyRole = `${profile?.designation || 'Asst. Professor'} • ${profile?.department?.name || 'Dept. of AI & DS'}`;
  const avatarUri = profile?.avatar_url || user?.profile?.avatar_url || PROFILE_AVATAR;

  const showToast = (msg) => {
    setToastText(msg);
    Animated.sequence([
      Animated.timing(toastFade, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(2600),
      Animated.timing(toastFade, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setToastText(""));
  };

  const handleAcceptSubstitution = () => {
    setSubstitutionAccepted(true);
    showToast("Substitution accepted successfully.");
  };

  const peers = [
    {
      name: "Dr. Arun Kumar",
      badge: "Free Period 3",
      desc: "14 Periods this week (Optimal load)",
    },
    {
      name: "Ms. Priya Sharma",
      badge: "Free Period 3",
      desc: "15 Periods this week",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#faf8ff" />

      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => {
              if (navigation && navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation?.navigate("StaffDashboard");
              }
            }}
          >
            <MaterialIcons name="arrow-back" size={24} color="#191b23" />
          </TouchableOpacity>

          <View style={styles.logoBadge}>
            <MaterialIcons name="account-balance" size={20} color="#ffffff" />
          </View>

          <View style={styles.headerTitleWrap}>
            <View style={styles.nexusSubRow}>
              <Text style={styles.nexusText}>NEXUS</Text>
              <Text style={styles.dotSeparator}>•</Text>
              <Text style={styles.collegeSubText}>Info IT</Text>
            </View>
            <Text style={styles.headerMainTitle}>Timetable</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.facultyBadge}>
            <Text style={styles.facultyBadgeText}>Faculty</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.profileButton}
            onPress={() => navigation?.navigate("StaffProfile")}
          >
            <Image
              source={{ uri: avatarUri }}
              style={styles.profileAvatar}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ================= MAIN CONTENT ================= */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContainer}>
          {/* 1. Faculty Profile Header Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileMainRow}>
              <View style={styles.facultyAvatarWrap}>
                <Image
                  source={{ uri: avatarUri }}
                  style={styles.facultyAvatarImg}
                />
                <View style={styles.onlineDot} />
              </View>

              <View style={styles.profileInfoWrap}>
                <View style={styles.profileNameRow}>
                  <Text style={styles.facultyNameText}>{facultyName}</Text>
                  <View style={styles.facultyIdBadge}>
                    <Text style={styles.facultyIdText}>{facultyId}</Text>
                  </View>
                </View>
                <Text style={styles.facultyRoleText}>
                  {facultyRole}
                </Text>
              </View>
            </View>

            <View style={styles.dateBanner}>
              <View style={styles.dateBannerItem}>
                <MaterialIcons name="calendar-today" size={16} color="#003fb1" />
                <Text style={styles.dateBannerText}>Wed, 23 Sep 2026</Text>
              </View>

              <View style={styles.dateBannerItem}>
                <MaterialIcons name="schedule" size={16} color="#585f6c" />
                <Text style={styles.dateBannerText}>Odd Sem • Week 11</Text>
              </View>
            </View>
          </View>

          {/* 2. KPI Cards Grid */}
          <View style={styles.kpiGrid}>
            {[
              ["5", "Classes", "#003fb1"],
              ["2", "Free Periods", "#16a34a"],
              ["1", "Lab Session", "#ad3b00"],
              ["18", "Weekly Load", "#191b23"],
            ].map(([val, label, color]) => (
              <View style={styles.kpiCard} key={label}>
                <Text style={[styles.kpiVal, { color }]}>{val}</Text>
                <Text style={styles.kpiLabel}>{label}</Text>
              </View>
            ))}
          </View>

          {/* 3. Teaching Capacity Card */}
          <View style={styles.capacityCard}>
            <View style={styles.capacityHeader}>
              <View style={styles.capacityTitleLeft}>
                <View style={styles.capacityIconWrap}>
                  <MaterialIcons name="speed" size={20} color="#003fb1" />
                </View>
                <View>
                  <Text style={styles.capacityTitle}>Weekly Teaching Capacity</Text>
                  <Text style={styles.capacitySub}>Optimal balanced quota</Text>
                </View>
              </View>
              <View style={styles.capacityBadge}>
                <Text style={styles.capacityBadgeText}>90% Capacity</Text>
              </View>
            </View>

            <View style={styles.capacityTrack}>
              <View style={[styles.capacityFillTheory, { width: "60%" }]} />
              <View style={[styles.capacityFillLab, { width: "30%" }]} />
            </View>

            <View style={styles.capacityFooter}>
              <View style={styles.capacityLegends}>
                <Text style={styles.theoryLegend}>● Theory: 12 hrs</Text>
                <Text style={styles.labLegend}>● Lab: 6 hrs</Text>
              </View>
              <Text style={styles.capacityTotalText}>18 / 20 Periods</Text>
            </View>
          </View>

          {/* 4. Conflict Shield Banner */}
          <View style={styles.conflictBanner}>
            <MaterialIcons name="verified-user" size={20} color="#003fb1" />
            <Text style={styles.conflictBannerText}>
              <Text style={styles.boldText}>Live Collision Shield Active: </Text>
              Real-time engine monitoring rooms & section crossovers across department tracks.
            </Text>
          </View>

          {/* 5. Assigned Substitution Handover Card */}
          <View style={styles.substitutionCard}>
            <View style={styles.subCardTop}>
              <View style={styles.subIconWrap}>
                <MaterialIcons name="swap-horizontal-circle" size={24} color="#003fb1" />
              </View>
              <View style={styles.subHeadingWrap}>
                <Text style={styles.subLabel}>Assigned Duty Handover</Text>
                <View style={styles.actionRequiredBadge}>
                  <Text style={styles.actionRequiredText}>Action Required</Text>
                </View>
              </View>
            </View>

            <Text style={styles.subCourseTitle}>
              Database Management Systems (DBMS)
            </Text>
            <Text style={styles.subCourseMeta}>
              Period 4 • Friday, 25 Sep • III AI & DS – B (Room 208)
            </Text>

            <View style={styles.delegatedRow}>
              <MaterialIcons name="info" size={16} color="#003fb1" />
              <Text style={styles.delegatedText}>
                Delegated by <Text style={styles.boldText}>Dr. Ravi</Text> (Approved Medical Leave)
              </Text>
            </View>

            <View style={styles.subActionRow}>
              <TouchableOpacity
                style={[
                  styles.acceptBtn,
                  substitutionAccepted && styles.acceptBtnDone,
                ]}
                activeOpacity={0.8}
                onPress={handleAcceptSubstitution}
                disabled={substitutionAccepted}
              >
                <MaterialIcons
                  name={substitutionAccepted ? "verified" : "check"}
                  size={18}
                  color="#ffffff"
                />
                <Text style={styles.acceptBtnText}>
                  {substitutionAccepted ? "Accepted" : "Accept Substitution"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.lessonPlanBtn}
                activeOpacity={0.8}
                onPress={() => setLessonOpen(true)}
              >
                <MaterialIcons name="menu-book" size={18} color="#003fb1" />
                <Text style={styles.lessonPlanBtnText}>Lesson Plan</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 6. Today's Class Schedule List */}
          <View style={styles.scheduleSection}>
            <View style={styles.scheduleHeaderRow}>
              <View style={styles.scheduleHeaderLeft}>
                <MaterialIcons name="calendar-view-day" size={20} color="#003fb1" />
                <Text style={styles.scheduleSectionTitle}>Today's Class Schedule</Text>
              </View>
              <Text style={styles.scheduleDayBadge}>Wednesday</Text>
            </View>

            <View style={styles.scheduleCardList}>
              {todaySchedule.map((item, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.scheduleCard,
                    item.lab && styles.scheduleCardLab,
                    item.status === "Free / Mentoring" && styles.scheduleCardFree,
                  ]}
                >
                  <View style={styles.scheduleCardTop}>
                    <View style={styles.periodTimeGroup}>
                      <View style={styles.periodBadge}>
                        <Text style={styles.periodBadgeText}>{item.period}</Text>
                      </View>
                      <Text style={styles.periodTimeString}>{item.time}</Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadgeWrap,
                        item.status === "Completed" && styles.statusCompleted,
                        item.status === "In Progress" && styles.statusInProgress,
                        item.status.includes("Free") && styles.statusFree,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          item.status === "Completed" && styles.statusCompletedText,
                          item.status === "In Progress" && styles.statusInProgressText,
                          item.status.includes("Free") && styles.statusFreeText,
                        ]}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.scheduleItemTitle}>{item.title}</Text>
                  <Text style={styles.scheduleItemSection}>{item.section}</Text>

                  {item.lab ? (
                    <Text style={styles.labTransitionNotice}>
                      Includes lunch transition window (01:10 – 01:20 PM)
                    </Text>
                  ) : null}

                  {item.attendance ? (
                    <View style={styles.attendanceRow}>
                      <View style={styles.attendanceLeft}>
                        <MaterialIcons name="fact-check" size={16} color="#16a34a" />
                        <Text style={styles.attendanceText}>{item.attendance}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => navigation?.navigate("MarkAttendance")}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.viewLogLink}>View Log ›</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}

                  {item.mentoring ? (
                    <View style={styles.attendanceRow}>
                      <Text style={styles.menteeText}>3 Mentee Bookings confirmed</Text>
                      <TouchableOpacity
                        onPress={() => showToast("Mentee queue opened.")}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.viewLogLink}>Open Queue ›</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}

                  {item.lab ? (
                    <View style={styles.labActionGrid}>
                      <TouchableOpacity
                        style={styles.labPrimaryBtn}
                        activeOpacity={0.8}
                        onPress={() => navigation?.navigate("MarkAttendance")}
                      >
                        <MaterialIcons name="fingerprint" size={18} color="#ffffff" />
                        <Text style={styles.labPrimaryBtnText}>Mark Lab Attendance</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.labSecondaryBtn}
                        activeOpacity={0.8}
                        onPress={() => showToast("Lab Exercise 6 dispatched.")}
                      >
                        <MaterialIcons name="terminal" size={18} color="#003fb1" />
                        <Text style={styles.labSecondaryBtnText}>Console & Rubric</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}

                  {item.free ? (
                    <View style={styles.attendanceRow}>
                      <Text style={styles.menteeText}>No duty assigned yet</Text>
                      <TouchableOpacity
                        onPress={() => showToast("Custom note status updated.")}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.viewLogLink}>Set Custom Note ›</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              ))}
            </View>
          </View>

          {/* 7. Rapid Course Utilities */}
          <View style={styles.utilitiesCard}>
            <Text style={styles.utilityHeading}>Rapid Course Utilities</Text>
            <View style={styles.utilityGrid}>
              {[
                { icon: "checklist", label: "Attendance", screen: "MarkAttendance" },
                { icon: "menu-book", label: "Lesson Plan", action: () => setLessonOpen(true) },
                { icon: "description", label: "Notes & QP", screen: "StaffNotes" },
                { icon: "badge", label: "Roster", action: () => setFacultyOpen(true) },
              ].map((u) => (
                <TouchableOpacity
                  key={u.label}
                  style={styles.utilityBtn}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (u.screen) navigation?.navigate(u.screen);
                    else if (u.action) u.action();
                  }}
                >
                  <View style={styles.utilityIconBox}>
                    <MaterialIcons name={u.icon} size={22} color="#003fb1" />
                  </View>
                  <Text style={styles.utilityBtnLabel}>{u.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 8. Leave & Substitution Dispatch Card */}
          <View style={styles.dispatchCard}>
            <View style={styles.dispatchHeader}>
              <View style={styles.dispatchIconBox}>
                <MaterialIcons name="swap-calls" size={22} color="#003fb1" />
              </View>
              <View style={styles.dispatchHeaderTitles}>
                <Text style={styles.dispatchTitle}>Leave & Substitution Dispatch</Text>
                <Text style={styles.dispatchSubtitle}>
                  Hand over scheduled lectures to verified free colleagues during casual or duty leaves.
                </Text>
              </View>
            </View>

            <View style={styles.targetLectureBox}>
              <Text style={styles.targetLectureTag}>TARGET AFFECTED LECTURE</Text>
              <View style={styles.targetLectureRow}>
                <View style={styles.dateBox}>
                  <Text style={styles.dateBoxMonth}>SEP</Text>
                  <Text style={styles.dateBoxDay}>25</Text>
                </View>
                <View style={styles.targetLectureInfo}>
                  <Text style={styles.targetLectureName}>Machine Learning (ML)</Text>
                  <Text style={styles.targetLectureMeta}>
                    Friday • 10:40 – 11:30 AM • II AI & DS – A (Room 204)
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.peerHeader}>
              <Text style={styles.peerHeaderTitle}>AI Smart Peer Recommendations</Text>
              <Text style={styles.peerHeaderSub}>Based on slot availability</Text>
            </View>

            <View style={styles.peerList}>
              {peers.map((peer) => {
                const isSelected = selectedPeer === peer.name;
                return (
                  <TouchableOpacity
                    key={peer.name}
                    style={[
                      styles.peerCard,
                      isSelected && styles.peerCardSelected,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => setSelectedPeer(peer.name)}
                  >
                    <View style={styles.peerLeft}>
                      <MaterialIcons
                        name={isSelected ? "radio-button-checked" : "radio-button-unchecked"}
                        size={20}
                        color={isSelected ? "#003fb1" : "#737686"}
                      />
                      <View style={styles.peerInfoWrap}>
                        <View style={styles.peerNameRow}>
                          <Text style={styles.peerNameText}>{peer.name}</Text>
                          <View style={styles.peerBadge}>
                            <Text style={styles.peerBadgeText}>{peer.badge}</Text>
                          </View>
                        </View>
                        <Text style={styles.peerDescText}>{peer.desc}</Text>
                      </View>
                    </View>

                    <MaterialIcons
                      name="check-circle"
                      size={20}
                      color={isSelected ? "#003fb1" : "#e2e1ed"}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            <TextInput
              style={styles.noteInput}
              placeholder="e.g., Deliver Module 3: Decision Trees lecture slide 14-35"
              placeholderTextColor="#737686"
              value={customNote}
              onChangeText={setCustomNote}
            />

            <TouchableOpacity
              style={styles.assignBtn}
              activeOpacity={0.8}
              onPress={() => showToast(`Period 3 dispatched to ${selectedPeer}.`)}
            >
              <MaterialIcons name="send" size={18} color="#ffffff" />
              <Text style={styles.assignBtnText}>Assign to {selectedPeer}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.hodEndorseBtn}
              activeOpacity={0.8}
              onPress={() => showToast("HOD endorsement request sent.")}
            >
              <MaterialIcons name="verified" size={18} color="#003fb1" />
              <Text style={styles.hodEndorseBtnText}>Request HOD Endorsement</Text>
            </TouchableOpacity>
          </View>

          {/* 9. Segment Switcher */}
          <View style={styles.segmentWrap}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.segmentTab,
                tab === "today" && styles.segmentTabActive,
              ]}
              onPress={() => setTab("today")}
            >
              <MaterialIcons
                name="view-timeline"
                size={18}
                color={tab === "today" ? "#003fb1" : "#585f6c"}
              />
              <Text
                style={[
                  styles.segmentTabText,
                  tab === "today" && styles.segmentTabTextActive,
                ]}
              >
                Today's Schedule
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.segmentTab,
                tab === "week" && styles.segmentTabActive,
              ]}
              onPress={() => setTab("week")}
            >
              <MaterialIcons
                name="grid-view"
                size={18}
                color={tab === "week" ? "#003fb1" : "#585f6c"}
              />
              <Text
                style={[
                  styles.segmentTabText,
                  tab === "week" && styles.segmentTabTextActive,
                ]}
              >
                Weekly Grid
              </Text>
            </TouchableOpacity>
          </View>

          {/* 10. Weekly Matrix Table (When tab is 'week') */}
          {tab === "week" ? (
            <View style={styles.weeklySection}>
              <View style={styles.scheduleHeaderRow}>
                <Text style={styles.scheduleSectionTitle}>Weekly Timetable Matrix</Text>
                <View style={styles.swipeHint}>
                  <MaterialIcons name="swipe" size={16} color="#003fb1" />
                  <Text style={styles.swipeHintText}>Scroll horizontally</Text>
                </View>
              </View>

              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: "#dbe1ff" }]} />
                  <Text style={styles.legendText}>Core Theory</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: "#ffdbcf" }]} />
                  <Text style={styles.legendText}>Practical Lab</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: "#dce2f3" }]} />
                  <Text style={styles.legendText}>Break / Recess</Text>
                </View>
              </View>

              <View style={styles.tableCard}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.tableInner}>
                    <View style={styles.tableHeaderRow}>
                      {["TIME", "MON", "TUE", "WED (TODAY)", "THU", "FRI"].map(
                        (day, idx) => (
                          <View
                            key={day}
                            style={[
                              styles.tableHeaderCell,
                              idx === 3 && styles.tableHeaderCellActive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.tableHeaderText,
                                idx === 3 && styles.tableHeaderTextActive,
                              ]}
                            >
                              {day}
                            </Text>
                          </View>
                        )
                      )}
                    </View>

                    {weeklySchedule.map((row, idx) => (
                      <View key={row.time} style={styles.tableBodyRow}>
                        <View style={styles.tableTimeCell}>
                          <Text style={styles.tableTimeText}>{row.time}</Text>
                          {idx === 5 ? (
                            <Text style={styles.tableLabSub}>(2h Lab)</Text>
                          ) : null}
                        </View>

                        {[row.mon, row.tue, row.wed, row.thu, row.fri].map(
                          ([subject, teacher], colIdx) => {
                            const isLab = idx === 5;
                            const isToday = colIdx === 2;

                            return (
                              <View
                                key={colIdx}
                                style={[
                                  styles.tableSubjectCell,
                                  isLab
                                    ? styles.cellLab
                                    : isToday
                                    ? styles.cellToday
                                    : styles.cellTheory,
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.cellSubTitle,
                                    isLab && styles.cellSubTitleLab,
                                    isToday && styles.cellSubTitleToday,
                                  ]}
                                >
                                  {subject}
                                </Text>
                                <Text
                                  style={[
                                    styles.cellTeacherText,
                                    isLab && styles.cellTeacherTextLab,
                                    isToday && styles.cellTeacherTextToday,
                                  ]}
                                >
                                  {teacher}
                                </Text>
                              </View>
                            );
                          }
                        )}
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>
          ) : null}

          {/* 11. Tools & Support */}
          <View style={styles.toolsSection}>
            <Text style={styles.toolsHeading}>Timetable Tools & Support</Text>

            <TouchableOpacity
              style={styles.toolCard}
              activeOpacity={0.7}
              onPress={() => setFacultyOpen(true)}
            >
              <View style={[styles.toolIconWrap, { backgroundColor: "#dce2f3" }]}>
                <MaterialIcons name="badge" size={20} color="#003fb1" />
              </View>
              <View style={styles.toolTextWrap}>
                <Text style={styles.toolTitle}>View Faculty Contact Details</Text>
                <Text style={styles.toolSubtitle}>
                  Office hours, cabin numbers & email IDs
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#737686" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolCard}
              activeOpacity={0.7}
              onPress={() => showToast("Downloading timetable PDF.")}
            >
              <View style={[styles.toolIconWrap, { backgroundColor: "#dbe1ff" }]}>
                <MaterialIcons name="file-download" size={20} color="#003fb1" />
              </View>
              <View style={styles.toolTextWrap}>
                <Text style={styles.toolTitle}>Download Offline PDF Timetable</Text>
                <Text style={styles.toolSubtitle}>
                  Official college seal signed copy (Sem 5)
                </Text>
              </View>
              <MaterialIcons name="file-download" size={20} color="#737686" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolCard}
              activeOpacity={0.7}
              onPress={() => showToast("Timetable issue report opened.")}
            >
              <View style={[styles.toolIconWrap, { backgroundColor: "#e2e1ed" }]}>
                <MaterialIcons name="flag" size={20} color="#585f6c" />
              </View>
              <View style={styles.toolTextWrap}>
                <Text style={styles.toolTitle}>Report Timetable Issue / Clash</Text>
                <Text style={styles.toolSubtitle}>
                  Direct ticket to Class Advisor & HOD office
                </Text>
              </View>
              <MaterialIcons name="report" size={20} color="#737686" />
            </TouchableOpacity>
          </View>

          {/* Bottom spacing for bottom nav */}
          <View style={{ height: 80 }} />
        </View>
      </ScrollView>

      {/* ================= BOTTOM NAVIGATION BAR ================= */}
      <BottomNavBar activeItem="timetable" navigation={navigation} />

      {/* ================= FACULTY DIRECTORY MODAL ================= */}
      <Modal
        visible={facultyOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setFacultyOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setFacultyOpen(false)}
          />

          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <MaterialIcons name="school" size={22} color="#003fb1" />
                <Text style={styles.modalHeading}>Faculty Directory</Text>
              </View>
              <TouchableOpacity
                onPress={() => setFacultyOpen(false)}
                style={styles.modalCloseBtn}
              >
                <MaterialIcons name="close" size={20} color="#434654" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ maxHeight: '60vh' }}
              contentContainerStyle={{ padding: 16, gap: 12 }}
            >
              {faculty.map((person) => (
                <View key={person.email} style={styles.facultyItem}>
                  <View style={styles.facultyLeft}>
                    <View
                      style={[
                        styles.facultyAvatar,
                        { backgroundColor: person.bg },
                      ]}
                    >
                      <Text style={[styles.facultyInitials, { color: person.text }]}>
                        {person.initials}
                      </Text>
                    </View>

                    <View style={styles.facultyInfo}>
                      <Text style={styles.facultyName}>{person.name}</Text>
                      <Text style={styles.facultyDetail}>{person.role}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.mailButton}
                    activeOpacity={0.7}
                    onPress={() => Linking.openURL(`mailto:${person.email}`)}
                  >
                    <MaterialIcons name="mail" size={18} color="#003fb1" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.closeModalButton}
                activeOpacity={0.8}
                onPress={() => setFacultyOpen(false)}
              >
                <Text style={styles.closeModalButtonText}>Close Directory</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= LESSON PLAN MODAL ================= */}
      <Modal
        visible={lessonOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setLessonOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setLessonOpen(false)}
          />

          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <MaterialIcons name="auto-stories" size={22} color="#003fb1" />
                <Text style={styles.modalHeading}>Lesson Plan & Lecture Notes</Text>
              </View>
              <TouchableOpacity
                onPress={() => setLessonOpen(false)}
                style={styles.modalCloseBtn}
              >
                <MaterialIcons name="close" size={20} color="#434654" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ maxHeight: '60vh' }}
              contentContainerStyle={{ padding: 16, gap: 12 }}
            >
              <View style={styles.lessonSummaryBox}>
                <Text style={styles.lessonCourseTag}>Course: CS8492 - DBMS</Text>
                <Text style={styles.lessonUnitHeading}>
                  Unit 3: Relational Calculus & SQL Optimization
                </Text>
                <Text style={styles.lessonHandoverNote}>
                  Handover Note from Dr. Ravi: "Students have completed basic joins. Please conduct queries 5 to 12 from Lab Manual Sheet 3."
                </Text>
              </View>

              {[
                ["picture-as-pdf", "Unit3_SlideDeck_v2.pdf"],
                ["dataset", "Practice_Schema_Dump.sql"],
              ].map(([icon, file]) => (
                <View key={file} style={styles.downloadRow}>
                  <View style={styles.downloadFileLeft}>
                    <MaterialIcons name={icon} size={20} color="#003fb1" />
                    <Text style={styles.downloadFileName}>{file}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.downloadFileBtn}
                    activeOpacity={0.7}
                    onPress={() => showToast(`Downloading ${file}`)}
                  >
                    <Text style={styles.downloadFileBtnText}>Download</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.closeModalButton}
                activeOpacity={0.8}
                onPress={() => setLessonOpen(false)}
              >
                <Text style={styles.closeModalButtonText}>Close Preview</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= TOAST NOTIFICATION ================= */}
      {toastText ? (
        <Animated.View style={[styles.toastContainer, { opacity: toastFade }]}>
          <MaterialIcons name="check-circle" size={18} color="#dbe1ff" />
          <Text style={styles.toastMessage}>{toastText}</Text>
        </Animated.View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#faf8ff",
  },

  /* ================= TOP BAR ================= */
  header: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(250,248,255,0.95)",
    borderBottomWidth: 1,
    borderBottomColor: "#e7e7f3",
    zIndex: 40,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#003fb1",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#003fb1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },

  headerTitleWrap: {
    justifyContent: "center",
  },

  nexusSubRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  nexusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#003fb1",
    letterSpacing: 0.8,
  },

  dotSeparator: {
    fontSize: 10,
    color: "#737686",
  },

  collegeSubText: {
    fontSize: 11,
    color: "#585f6c",
  },

  headerMainTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#191b23",
    marginTop: -2,
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  facultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 14,
    backgroundColor: "#dce2f3",
  },

  facultyBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#5e6572",
  },

  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "#003fb1",
  },

  profileAvatar: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  /* ================= SCROLL ================= */
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    width: "100%",
    maxWidth: 540,
    alignSelf: "center",
  },

  mainContainer: {
    gap: 16,
  },

  /* ================= FACULTY PROFILE CARD ================= */
  profileCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e7e7f3",
  },

  profileMainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  facultyAvatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    position: "relative",
  },

  facultyAvatarImg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    resizeMode: "cover",
  },

  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#16a34a",
    borderWidth: 2,
    borderColor: "#ffffff",
  },

  profileInfoWrap: {
    flex: 1,
  },

  profileNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  facultyNameText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#191b23",
  },

  facultyIdBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: "#dbe1ff",
  },

  facultyIdText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#003fb1",
  },

  facultyRoleText: {
    marginTop: 2,
    fontSize: 12,
    color: "#434654",
  },

  dateBanner: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#ededf8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dateBannerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  dateBannerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#434654",
  },

  /* ================= KPI GRID ================= */
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  kpiCard: {
    width: "48.5%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e7e7f3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },

  kpiVal: {
    fontSize: 22,
    fontWeight: "800",
  },

  kpiLabel: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "600",
    color: "#585f6c",
  },

  /* ================= CAPACITY CARD ================= */
  capacityCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e7e7f3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    gap: 12,
  },

  capacityHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  capacityTitleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  capacityIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#dbe1ff",
    alignItems: "center",
    justifyContent: "center",
  },

  capacityTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#191b23",
  },

  capacitySub: {
    fontSize: 11,
    color: "#585f6c",
  },

  capacityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: "#dce2f3",
  },

  capacityBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#003fb1",
  },

  capacityTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ededf8",
    flexDirection: "row",
    overflow: "hidden",
  },

  capacityFillTheory: {
    height: "100%",
    backgroundColor: "#003fb1",
  },

  capacityFillLab: {
    height: "100%",
    backgroundColor: "#ad3b00",
  },

  capacityFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  capacityLegends: {
    flexDirection: "row",
    gap: 10,
  },

  theoryLegend: {
    fontSize: 11,
    fontWeight: "600",
    color: "#003fb1",
  },

  labLegend: {
    fontSize: 11,
    fontWeight: "600",
    color: "#ad3b00",
  },

  capacityTotalText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#191b23",
  },

  /* ================= CONFLICT BANNER ================= */
  conflictBanner: {
    backgroundColor: "#f3f3fe",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderWidth: 1,
    borderColor: "#dbe1ff",
  },

  conflictBannerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: "#434654",
  },

  boldText: {
    fontWeight: "700",
    color: "#191b23",
  },

  /* ================= SUBSTITUTION CARD ================= */
  substitutionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e7e7f3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    gap: 10,
  },

  subCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  subIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#dbe1ff",
    alignItems: "center",
    justifyContent: "center",
  },

  subHeadingWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  subLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#191b23",
  },

  actionRequiredBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "#ffdbcf",
  },

  actionRequiredText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#802a00",
  },

  subCourseTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#003fb1",
  },

  subCourseMeta: {
    fontSize: 12,
    color: "#585f6c",
  },

  delegatedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f3f3fe",
  },

  delegatedText: {
    fontSize: 11,
    color: "#434654",
  },

  subActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },

  acceptBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#003fb1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  acceptBtnDone: {
    backgroundColor: "#16a34a",
  },

  acceptBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },

  lessonPlanBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbe1ff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  lessonPlanBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#003fb1",
  },

  /* ================= SCHEDULE ================= */
  scheduleSection: {
    gap: 12,
  },

  scheduleHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  scheduleHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  scheduleSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#191b23",
  },

  scheduleDayBadge: {
    fontSize: 12,
    fontWeight: "600",
    color: "#003fb1",
  },

  scheduleCardList: {
    gap: 10,
  },

  scheduleCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e7e7f3",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },

  scheduleCardLab: {
    borderLeftWidth: 4,
    borderLeftColor: "#ad3b00",
  },

  scheduleCardFree: {
    borderLeftWidth: 4,
    borderLeftColor: "#16a34a",
  },

  scheduleCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  periodTimeGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  periodBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "#dbe1ff",
  },

  periodBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#003fb1",
  },

  periodTimeString: {
    fontSize: 12,
    fontWeight: "600",
    color: "#585f6c",
  },

  statusBadgeWrap: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },

  statusCompleted: {
    backgroundColor: "#e2e1ed",
  },

  statusInProgress: {
    backgroundColor: "#ffdbcf",
  },

  statusFree: {
    backgroundColor: "#dcfce7",
  },

  statusBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },

  statusCompletedText: { color: "#585f6c" },
  statusInProgressText: { color: "#802a00" },
  statusFreeText: { color: "#166534" },

  scheduleItemTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#191b23",
  },

  scheduleItemSection: {
    fontSize: 12,
    color: "#434654",
  },

  labTransitionNotice: {
    fontSize: 11,
    color: "#ad3b00",
    fontStyle: "italic",
  },

  attendanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#ededf8",
  },

  attendanceLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  attendanceText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#16a34a",
  },

  menteeText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#585f6c",
  },

  viewLogLink: {
    fontSize: 11,
    fontWeight: "700",
    color: "#003fb1",
  },

  labActionGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },

  labPrimaryBtn: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#003fb1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  labPrimaryBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },

  labSecondaryBtn: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbe1ff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  labSecondaryBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#003fb1",
  },

  /* ================= UTILITIES ================= */
  utilitiesCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e7e7f3",
    gap: 12,
  },

  utilityHeading: {
    fontSize: 14,
    fontWeight: "700",
    color: "#191b23",
  },

  utilityGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },

  utilityBtn: {
    alignItems: "center",
    gap: 6,
  },

  utilityIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#dbe1ff",
    alignItems: "center",
    justifyContent: "center",
  },

  utilityBtnLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#434654",
  },

  /* ================= DISPATCH CARD ================= */
  dispatchCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e7e7f3",
    gap: 12,
  },

  dispatchHeader: {
    flexDirection: "row",
    gap: 10,
  },

  dispatchIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#dbe1ff",
    alignItems: "center",
    justifyContent: "center",
  },

  dispatchHeaderTitles: {
    flex: 1,
  },

  dispatchTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#191b23",
  },

  dispatchSubtitle: {
    fontSize: 11,
    color: "#585f6c",
    marginTop: 2,
    lineHeight: 16,
  },

  targetLectureBox: {
    backgroundColor: "#f3f3fe",
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },

  targetLectureTag: {
    fontSize: 10,
    fontWeight: "700",
    color: "#003fb1",
    letterSpacing: 0.5,
  },

  targetLectureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  dateBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#003fb1",
    alignItems: "center",
    justifyContent: "center",
  },

  dateBoxMonth: {
    fontSize: 9,
    fontWeight: "700",
    color: "#dbe1ff",
  },

  dateBoxDay: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
  },

  targetLectureInfo: {
    flex: 1,
  },

  targetLectureName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#191b23",
  },

  targetLectureMeta: {
    fontSize: 11,
    color: "#585f6c",
    marginTop: 2,
  },

  peerHeader: {
    marginTop: 4,
  },

  peerHeaderTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#191b23",
  },

  peerHeaderSub: {
    fontSize: 11,
    color: "#585f6c",
  },

  peerList: {
    gap: 8,
  },

  peerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f3f3fe",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1.5,
    borderColor: "transparent",
  },

  peerCardSelected: {
    borderColor: "#003fb1",
    backgroundColor: "#ffffff",
  },

  peerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },

  peerInfoWrap: {
    flex: 1,
  },

  peerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  peerNameText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#191b23",
  },

  peerBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: "#dce2f3",
  },

  peerBadgeText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#003fb1",
  },

  peerDescText: {
    fontSize: 11,
    color: "#585f6c",
    marginTop: 1,
  },

  noteInput: {
    height: 42,
    borderRadius: 8,
    backgroundColor: "#f3f3fe",
    paddingHorizontal: 12,
    fontSize: 12,
    color: "#191b23",
    borderWidth: 1,
    borderColor: "#e2e1ed",
  },

  assignBtn: {
    height: 42,
    borderRadius: 8,
    backgroundColor: "#003fb1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  assignBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },

  hodEndorseBtn: {
    height: 40,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbe1ff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  hodEndorseBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#003fb1",
  },

  /* ================= SEGMENT ================= */
  segmentWrap: {
    flexDirection: "row",
    backgroundColor: "#ededf8",
    borderRadius: 12,
    padding: 4,
  },

  segmentTab: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  segmentTabActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },

  segmentTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#585f6c",
  },

  segmentTabTextActive: {
    color: "#003fb1",
  },

  /* ================= WEEKLY MATRIX ================= */
  weeklySection: {
    gap: 10,
  },

  swipeHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  swipeHintText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#003fb1",
  },

  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },

  legendText: {
    fontSize: 11,
    color: "#434654",
  },

  tableCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },

  tableInner: {
    minWidth: 580,
    gap: 8,
  },

  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ededf8",
    paddingBottom: 6,
  },

  tableHeaderCell: {
    width: 96,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },

  tableHeaderCellActive: {
    backgroundColor: "#dbe1ff",
    borderRadius: 6,
  },

  tableHeaderText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#585f6c",
  },

  tableHeaderTextActive: {
    color: "#003fb1",
  },

  tableBodyRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  tableTimeCell: {
    width: 96,
    alignItems: "center",
    justifyContent: "center",
  },

  tableTimeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#737686",
  },

  tableLabSub: {
    fontSize: 9,
    color: "#852b00",
    fontWeight: "600",
  },

  tableSubjectCell: {
    width: 92,
    marginHorizontal: 2,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  cellTheory: {
    backgroundColor: "#dbe1ff",
  },

  cellLab: {
    backgroundColor: "#ffdbcf",
  },

  cellToday: {
    backgroundColor: "#003fb1",
  },

  cellSubTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#003fb1",
    textAlign: "center",
  },

  cellSubTitleLab: {
    color: "#802a00",
  },

  cellSubTitleToday: {
    color: "#ffffff",
  },

  cellTeacherText: {
    fontSize: 9,
    color: "#434654",
    marginTop: 1,
  },

  cellTeacherTextLab: {
    color: "#802a00",
  },

  cellTeacherTextToday: {
    color: "rgba(255,255,255,0.85)",
  },

  /* ================= TOOLS ================= */
  toolsSection: {
    gap: 10,
  },

  toolsHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#191b23",
  },

  toolCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },

  toolIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  toolTextWrap: {
    flex: 1,
  },

  toolTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#191b23",
  },

  toolSubtitle: {
    fontSize: 11,
    color: "#585f6c",
    marginTop: 1,
  },

  /* ================= MODALS ================= */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

  modalSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    maxHeight: '80vh',
  },

  modalHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#ededf8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  modalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  modalHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#191b23",
  },

  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ededf8",
    alignItems: "center",
    justifyContent: "center",
  },

  facultyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f3f3fe",
    borderRadius: 12,
    padding: 12,
  },

  facultyLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },

  facultyAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },

  facultyInitials: {
    fontSize: 13,
    fontWeight: "700",
  },

  facultyInfo: {
    flex: 1,
  },

  facultyName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#191b23",
  },

  facultyDetail: {
    fontSize: 11,
    color: "#585f6c",
    marginTop: 1,
  },

  mailButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },

  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#ededf8",
  },

  closeModalButton: {
    backgroundColor: "#003fb1",
    borderRadius: 10,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  closeModalButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },

  lessonSummaryBox: {
    backgroundColor: "#f3f3fe",
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },

  lessonCourseTag: {
    fontSize: 11,
    fontWeight: "700",
    color: "#003fb1",
  },

  lessonUnitHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: "#191b23",
  },

  lessonHandoverNote: {
    fontSize: 12,
    lineHeight: 18,
    color: "#434654",
    fontStyle: "italic",
    marginTop: 4,
  },

  downloadRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e1ed",
  },

  downloadFileLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },

  downloadFileName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#191b23",
  },

  downloadFileBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#dbe1ff",
  },

  downloadFileBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#003fb1",
  },

  /* ================= TOAST ================= */
  toastContainer: {
    position: "absolute",
    bottom: 80,
    alignSelf: "center",
    backgroundColor: "#191b23",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 200,
  },

  toastMessage: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
});
