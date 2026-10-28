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
  Dimensions,
  useBreakpoint,
} from '@/ui';
import { LinearGradient } from '@/ui';
import { MaterialIcons } from '@/ui';
import StudentBottomNav from "../../../components/common/StudentBottomNav";
import { useAuth } from "../../auth/context/AuthContext";
import { getTodaySchedule, getWeeklyTimetable } from "../../../services/api/timetable";


const PROFILE_IMAGE =
  "https://lh3.googleusercontent.com/aida/AEtjO1XvgRt7B_bP_GL-SgPqgkl1O39T8axc-4QY6kiJN9YuOSjZKzzXE9iqg-qdQDvJTxL_HvpwAsOZg9wMH6Tz1uHi0JjZHtBkJ5HdpQOvF-3FMyjiK1FYAym352dqT0Zofpcj1VHe21OK_Cnhpz5lFXRlmP5bq9Sl75qC18iW4KsS-PizFFiEyVv_rUYJsATyPvC-UqSmKGzj31B0prs2dlpJrBVsGmZN-2kCx6-jqx6vJzDAR0KFBi4H5nhEk_sUAftVEV8w7DFXFQ";

const todaySchedule = [
  {
    time: ["08:45", "09:35"],
    period: "P1",
    name: "Data Structures",
    code: "CS3301",
    type: "Theory",
    room: "Room 204",
    status: "Done",
  },
  {
    time: ["09:35", "10:25"],
    period: "P2",
    name: "Database Management",
    code: "CS3352",
    type: "Theory",
    room: "Room 204",
    status: "Done",
  },
  {
    break: true,
    icon: "local-cafe",
    title: "Morning Tea Break & Refreshment",
    time: "10:25 – 10:40",
  },
  {
    time: ["10:40", "11:30"],
    period: "P3",
    name: "Deep Learning",
    code: "AD3501",
    type: "Room 302 (Turing Hall)",
    faculty: "Dr. Kumar",
    status: "NOW",
  },
  {
    time: ["11:30", "12:20"],
    period: "P4",
    name: "Deep Learning Lab",
    code: "AD3511",
    type: "Practical Lab",
    room: "AI Lab 2",
    extra: "Batch 1 & 2 Combined",
    status: "Next Up",
  },
  {
    break: true,
    icon: "restaurant",
    title: "Lunch Recess & Campus Green",
    time: "12:20 – 01:10",
  },
  {
    time: ["01:10", "02:00"],
    period: "P5",
    name: "Operating Systems",
    code: "CS3401",
    type: "Theory",
    room: "Room 302",
  },
  {
    time: ["02:00", "03:50"],
    period: "P6-7",
    name: "Mini-Project Lab",
    code: "AD3512",
    type: "2 Hours",
    room: "Computing Center 1",
  },
];

const weeklyRows = [
  ["08:45–09:35", ["DS", "DK"], ["DBMS", "SM"], ["DL", "KM"], ["OS", "AR"], ["ML", "VG"]],
  ["09:35–10:25", ["DBMS", "SM"], ["DS", "DK"], ["ML", "VG"], ["DL", "KM"], ["DBMS", "SM"]],
  ["10:40–11:30", ["ML", "VG"], ["OS", "AR"], ["DS", "DK"], ["DS*", "DK"], ["DL", "KM"]],
  ["11:30–12:20", ["DL", "KM"], ["ML", "VG"], ["DBMS", "SM"], ["OS", "AR"], ["DS", "DK"]],
  ["01:10–02:00", ["OS", "AR"], ["DL", "KM"], ["ML", "VG"], ["DBMS", "SM"], ["ML", "VG"]],
  ["02:00–03:50", ["AI Lab", "Lab 2"], ["AI Lab", "Lab 1"], ["DS Lab", "Lab 3"], ["ML Lab", "Lab 2"], ["Project", "CC 1"]],
];

const facultyList = [
  {
    initials: "DK",
    name: "Dr. Kumar (KM)",
    detail: "Deep Learning • Cabin #312",
    email: "kumar.ad@infotech.edu.in",
    bg: "#dbe1ff",
    text: "#003fb1",
  },
  {
    initials: "SM",
    name: "Prof. Saravanan M (SM)",
    detail: "DBMS • Cabin #208",
    email: "saravanan.cs@infotech.edu.in",
    bg: "#dce2f3",
    text: "#5e6572",
  },
  {
    initials: "AR",
    name: "Dr. Arulprakash P (HOD)",
    detail: "Operating Systems • HOD Office",
    email: "hod.aids@infotech.edu.in",
    bg: "#ffdbcf",
    text: "#802a00",
  },
];

export default function StudentTimetable({ navigation }) {
  const { user, profile } = useAuth();
  const { isWide } = useBreakpoint();
  const [tab, setTab] = useState("today");
  const [liveSchedule, setLiveSchedule] = useState(todaySchedule);
  const [facultyOpen, setFacultyOpen] = useState(false);
  const [toastText, setToastText] = useState("");
  const toastFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isMounted = true;
    getTodaySchedule()
      .then((data) => {
        if (isMounted && data?.schedule && data.schedule.length > 0) {
          const mapped = data.schedule.map((slot) => ({
            time: [slot.start_time || "09:00", slot.end_time || "09:50"],
            period: slot.period || `P${slot.period_number}`,
            name: slot.title || slot.subject_name || "Class Session",
            code: slot.code || slot.course_code || "",
            type: slot.type || "Theory",
            room: slot.room || slot.room_name || "LH-101",
            status: slot.status || "UPCOMING",
            faculty: slot.faculty || slot.staff_name || "Faculty",
            break: slot.is_break || false,
          }));
          setLiveSchedule(mapped);
        }
      })
      .catch((err) => console.log("Failed to load student schedule:", err));
    return () => { isMounted = false; };
  }, []);

  const studentName = profile?.full_name || user?.profile?.full_name || "Student";
  const registerNo = profile?.register_number || user?.identifier || "24AD012";
  const deptText = `${profile?.department?.name || 'AI & Data Science'} • ${profile?.semester ? 'Sem ' + profile.semester : 'III Year'} • Sec ${profile?.section || 'A'}`;
  const enrolledText = profile?.semester ? `Sem ${profile.semester} Enrolled` : "Sem V Enrolled";
  const initials = studentName.charAt(0).toUpperCase();
  const avatarUri = profile?.avatar_url || user?.profile?.avatar_url || PROFILE_IMAGE;

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#faf8ff" />

      {/* ================= TOP BAR ================= */}
      <View style={styles.header}>
        <View style={styles.headerInner}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.7}
              onPress={() => {
                if (navigation && navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation?.navigate("StudentDashboard");
                }
              }}
            >
              <MaterialIcons name="arrow-back" size={24} color="#191b23" />
            </TouchableOpacity>

            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerMainTitle}>Class Timetable</Text>
              <Text style={{ fontSize: 12, color: '#64748b' }}>Semester 5 • Info IT Academic Schedule</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>AY 2024–2025</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ================= MAIN CONTENT ================= */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContainer}>
          {/* Top Hero Section: Responsive Desktop 2-Column / Mobile Stack */}
          <View style={isWide ? styles.desktopHeroGrid : styles.mobileHeroCol}>
            {/* Left Column: Student Identity + Notice */}
            <View style={isWide ? styles.desktopHeroLeft : styles.fullWidth}>
              {/* 1. Student Identity Header Card */}
              <View style={styles.profileCard}>
                <View style={styles.profileCardTop}>
                  <View style={styles.avatarWrap}>
                    <View style={styles.initialsAvatar}>
                      <Text style={styles.initialsText}>{initials}</Text>
                    </View>
                    <View style={styles.profileTextWrap}>
                      <View style={styles.nameRow}>
                        <Text style={styles.studentName}>{studentName}</Text>
                        <View style={styles.regBadge}>
                          <Text style={styles.regBadgeText}>{registerNo}</Text>
                        </View>
                      </View>
                      <Text style={styles.studentDept}>
                        {deptText}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.enrolledBadge}>
                    <View style={styles.livePulseDot} />
                    <Text style={styles.enrolledText}>{enrolledText}</Text>
                  </View>
                </View>

                <View style={styles.dateBar}>
                  <View style={styles.dateLeft}>
                    <MaterialIcons name="calendar-today" size={16} color="#003fb1" />
                    <Text style={styles.dateText}>Wednesday, 23 September 2026</Text>
                  </View>
                  <Text style={styles.dayOrderText}>Day Order: Day 3</Text>
                </View>
              </View>

              {/* 3. Timetable Notice */}
              <View style={styles.noticeCard}>
                <View style={styles.noticeHeader}>
                  <View style={styles.noticeIconWrap}>
                    <MaterialIcons
                      name="notifications-active"
                      size={18}
                      color="#852b00"
                    />
                  </View>
                  <View style={styles.noticeTitleWrap}>
                    <Text style={styles.noticeHeading}>Timetable Notice</Text>
                    <Text style={styles.noticeApprovedBy}>
                      Approved by Dr. Arulprakash P (HOD)
                    </Text>
                  </View>
                  <View style={styles.substitutedBadge}>
                    <Text style={styles.substitutedBadgeText}>Substituted</Text>
                  </View>
                </View>

                <Text style={styles.noticeContent}>
                  Tomorrow Thursday Period 3:{" "}
                  <Text style={styles.boldText}>Deep Learning</Text> relocated to{" "}
                  <Text style={styles.boldText}>AI Lab 1</Text> due to scheduled
                  Projector Maintenance in Room 302.
                </Text>

                <View style={styles.noticeTransferRow}>
                  <View style={styles.roomOld}>
                    <Text style={styles.roomOldText}>Room 302</Text>
                  </View>
                  <MaterialIcons name="arrow-forward" size={16} color="#852b00" />
                  <View style={styles.roomNew}>
                    <Text style={styles.roomNewText}>AI Lab 1</Text>
                  </View>
                  <Text style={styles.effText}>Eff: 24 Sep</Text>
                </View>
              </View>
            </View>

            {/* Right Column: Live Class Banner Card */}
            <View style={isWide ? styles.desktopHeroRight : styles.fullWidth}>
              <LinearGradient
                colors={["#003fb1", "#1a56db", "#003fb1"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.liveCard, isWide && styles.liveCardDesktop]}
              >
                <View style={styles.liveDecorCircle} />

                <View style={styles.liveCardTop}>
                  <View style={styles.liveTagRow}>
                    <View style={styles.pulsingIndicatorWrap}>
                      <View style={styles.pulsingIndicatorDot} />
                    </View>
                    <Text style={styles.liveTagText}>
                      NOW LIVE • 10:40 AM – 11:30 AM
                    </Text>
                  </View>
                  <View style={styles.periodBadge}>
                    <Text style={styles.periodBadgeText}>Period 3</Text>
                  </View>
                </View>

                <Text style={styles.liveSubjectTitle}>Deep Learning</Text>
                <Text style={styles.liveSubjectSubtitle}>AD3501 • Core Theory</Text>

                <View style={styles.liveMetaGrid}>
                  <View style={styles.liveMetaItem}>
                    <MaterialIcons name="person" size={16} color="#d4dcff" />
                    <Text style={styles.liveMetaValue}>Dr. Kumar</Text>
                    <Text style={styles.liveMetaSub}>(Assoc. Prof)</Text>
                  </View>

                  <View style={styles.liveMetaItem}>
                    <MaterialIcons name="meeting-room" size={16} color="#d4dcff" />
                    <Text style={styles.liveMetaValue}>Turing Hall (Room 302)</Text>
                  </View>
                </View>

                <View style={styles.liveActionRow}>
                  <TouchableOpacity
                    style={styles.liveBtnLight}
                    activeOpacity={0.8}
                    onPress={() => navigation?.navigate("StudyMaterials")}
                  >
                    <MaterialIcons name="menu-book" size={16} color="#003fb1" />
                    <Text style={styles.liveBtnLightText}>View Syllabus</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.liveBtnGlass}
                    activeOpacity={0.8}
                    onPress={() => navigation?.navigate("StudyMaterials")}
                  >
                    <MaterialIcons name="description" size={16} color="#ffffff" />
                    <Text style={styles.liveBtnGlassText}>Lecture Notes</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* 4. Segmented Tab Switcher */}
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

          {/* 5. Schedule Views */}
          {tab === "today" ? (
            <View style={styles.todaySection}>
              <View style={styles.scheduleHeaderRow}>
                <Text style={styles.scheduleTitle}>Wednesday Schedule</Text>
                <Text style={styles.scheduleSubtitle}>
                  7 Periods • 1 Break • 1 Lunch
                </Text>
              </View>

              <View style={[styles.scheduleList, isWide && styles.scheduleListDesktop]}>
                {(liveSchedule || todaySchedule).map((item, i) => {
                  if (item.break) {
                    return (
                      <View key={i} style={[styles.breakRow, isWide && styles.breakRowDesktop]}>
                        <View style={styles.breakIconWrap}>
                          <MaterialIcons
                            name={item.icon}
                            size={18}
                            color="#585f6c"
                          />
                        </View>
                        <View style={styles.breakContent}>
                          <Text style={styles.breakTitle}>{item.title}</Text>
                          <Text style={styles.breakTime}>{item.time}</Text>
                        </View>
                      </View>
                    );
                  }

                  const isLive = item.status === "NOW";
                  const isNext = item.status === "Next Up";
                  const isDone = item.status === "Done";

                  return (
                    <View
                      key={i}
                      style={[
                        styles.periodCard,
                        isWide && styles.periodCardDesktop,
                        isLive && styles.periodCardLive,
                        isNext && styles.periodCardNext,
                        isDone && styles.periodCardDone,
                      ]}
                    >
                      <View
                        style={[
                          styles.periodTimeBox,
                          isLive && styles.periodTimeBoxLive,
                          isNext && styles.periodTimeBoxNext,
                        ]}
                      >
                        <Text
                          style={[
                            styles.periodTimeStart,
                            isLive && styles.textWhite,
                            isNext && styles.textOnSecContainer,
                          ]}
                        >
                          {item.time[0]}
                        </Text>
                        <Text
                          style={[
                            styles.periodTimeEnd,
                            isLive && styles.textWhite70,
                            isNext && styles.textOnSecContainer70,
                          ]}
                        >
                          {item.time[1]}
                        </Text>
                        <View
                          style={[
                            styles.periodPill,
                            isLive && styles.periodPillLive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.periodPillText,
                              isLive && styles.periodPillTextLive,
                            ]}
                          >
                            {item.period}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.periodContent}>
                        <View style={styles.periodTopRow}>
                          <Text
                            style={[
                              styles.periodCourseName,
                              isLive && styles.periodCourseNameLive,
                            ]}
                            numberOfLines={1}
                          >
                            {item.name}
                          </Text>
                          {item.status ? (
                            <View
                              style={[
                                styles.statusBadge,
                                isLive && styles.statusBadgeLive,
                                isNext && styles.statusBadgeNext,
                                isDone && styles.statusBadgeDone,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.statusBadgeText,
                                  isLive && styles.textWhite,
                                  isNext && styles.textOnSecContainer,
                                  isDone && styles.textSecondary,
                                ]}
                              >
                                {item.status === "NOW" ? "● NOW" : item.status}
                              </Text>
                            </View>
                          ) : null}
                        </View>

                        <Text style={styles.periodDetailText}>
                          {item.code} • {item.type}
                          {item.room ? ` • ${item.room}` : ""}
                        </Text>

                        {item.faculty ? (
                          <Text style={styles.periodFacultyText}>
                            Faculty: {item.faculty}
                          </Text>
                        ) : null}

                        {item.extra ? (
                          <Text style={styles.periodExtraText}>
                            {item.extra}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : (
            /* Weekly View */
            <View style={styles.weeklySection}>
              <View style={styles.scheduleHeaderRow}>
                <Text style={styles.scheduleTitle}>Weekly Timetable Matrix</Text>
                <View style={styles.swipeHint}>
                  <MaterialIcons name="swipe" size={16} color="#003fb1" />
                  <Text style={styles.swipeHintText}>Scroll horizontally</Text>
                </View>
              </View>

              {/* Legend */}
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

              {/* Table Wrapper */}
              <View style={styles.tableCard}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.tableInner}>
                    {/* Header Row */}
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

                    {/* Table Rows */}
                    {weeklyRows.map((row, idx) => (
                      <React.Fragment key={idx}>
                        {idx === 2 && (
                          <View style={styles.tableIntervalRow}>
                            <Text style={styles.tableIntervalText}>
                              10:25 – 10:40 • Morning Interval
                            </Text>
                          </View>
                        )}

                        {idx === 4 && (
                          <View style={styles.tableIntervalRow}>
                            <Text style={styles.tableIntervalText}>
                              12:20 – 01:10 • Lunch Interval
                            </Text>
                          </View>
                        )}

                        <View style={styles.tableBodyRow}>
                          <View style={styles.tableTimeCell}>
                            <Text style={styles.tableTimeText}>{row[0]}</Text>
                            {idx === 5 ? (
                              <Text style={styles.tableLabSub}>(2h Lab)</Text>
                            ) : null}
                          </View>

                          {row.slice(1).map(([sub, teacher], colIdx) => {
                            const isLab = idx === 5;
                            const isNow = colIdx === 2 && idx === 2;

                            return (
                              <View
                                key={colIdx}
                                style={[
                                  styles.tableSubjectCell,
                                  isLab
                                    ? styles.cellLab
                                    : isNow
                                    ? styles.cellNow
                                    : styles.cellTheory,
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.cellSubTitle,
                                    isLab && styles.cellSubTitleLab,
                                    isNow && styles.cellSubTitleNow,
                                  ]}
                                >
                                  {sub}
                                </Text>
                                <Text
                                  style={[
                                    styles.cellTeacherText,
                                    isLab && styles.cellTeacherTextLab,
                                    isNow && styles.cellTeacherTextNow,
                                  ]}
                                >
                                  {teacher}
                                </Text>
                              </View>
                            );
                          })}
                        </View>
                      </React.Fragment>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>
          )}

          {/* 6. Tools & Support */}
          <View style={styles.toolsSection}>
            <Text style={styles.toolsHeading}>Timetable Tools & Support</Text>

            <View style={isWide ? styles.toolsGridDesktop : styles.toolsGridMobile}>
              <TouchableOpacity
                style={[styles.toolCard, isWide && styles.toolCardDesktop]}
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
                style={[styles.toolCard, isWide && styles.toolCardDesktop]}
                activeOpacity={0.7}
                onPress={() => showToast("Downloading Sem 5 Timetable PDF...")}
              >
                <View style={[styles.toolIconWrap, { backgroundColor: "#dbe1ff" }]}>
                  <MaterialIcons name="file-download" size={20} color="#003fb1" />
                </View>
                <View style={styles.toolTextWrap}>
                  <Text style={styles.toolTitle}>
                    Download Offline PDF Timetable
                  </Text>
                  <Text style={styles.toolSubtitle}>
                    Official college seal signed copy (Sem 5)
                  </Text>
                </View>
                <MaterialIcons name="file-download" size={20} color="#737686" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toolCard, isWide && styles.toolCardDesktop]}
                activeOpacity={0.7}
                onPress={() =>
                  showToast("Feedback form opened. Reporting to Advisor.")
                }
              >
                <View style={[styles.toolIconWrap, { backgroundColor: "#e2e1ed" }]}>
                  <MaterialIcons name="flag" size={20} color="#585f6c" />
                </View>
                <View style={styles.toolTextWrap}>
                  <Text style={styles.toolTitle}>
                    Report Timetable Issue / Clash
                  </Text>
                  <Text style={styles.toolSubtitle}>
                    Direct ticket to Class Advisor & HOD office
                  </Text>
                </View>
                <MaterialIcons name="report" size={20} color="#737686" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom spacing for bottom nav */}
          <View style={{ height: 80 }} />
        </View>
      </ScrollView>

      {/* ================= BOTTOM NAVIGATION BAR ================= */}
      <StudentBottomNav activeTab="home" navigation={navigation} />

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
                <Text style={styles.modalHeading}>
                  Faculty Directory (Sem 5)
                </Text>
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
              {facultyList.map((f, i) => (
                <View key={i} style={styles.facultyItem}>
                  <View style={styles.facultyLeft}>
                    <View
                      style={[
                        styles.facultyAvatar,
                        { backgroundColor: f.bg },
                      ]}
                    >
                      <Text
                        style={[styles.facultyInitials, { color: f.text }]}
                      >
                        {f.initials}
                      </Text>
                    </View>

                    <View style={styles.facultyInfo}>
                      <Text style={styles.facultyName}>{f.name}</Text>
                      <Text style={styles.facultyDetail}>{f.detail}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.mailButton}
                    activeOpacity={0.7}
                    onPress={() => Linking.openURL(`mailto:${f.email}`)}
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
    paddingHorizontal: 20,
    backgroundColor: "rgba(250,248,255,0.95)",
    borderBottomWidth: 1,
    borderBottomColor: "#e7e7f3",
    zIndex: 40,
    justifyContent: "center",
  },

  headerInner: {
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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

  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 14,
    backgroundColor: "#dce2f3",
  },

  roleBadgeText: {
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
  },

  mainContainer: {
    gap: 16,
  },

  /* ================= RESPONSIVE HERO & LAYOUT ================= */
  desktopHeroGrid: {
    flexDirection: "row",
    gap: 16,
    alignItems: "stretch",
  },

  desktopHeroLeft: {
    flex: 1,
    gap: 16,
    justifyContent: "space-between",
  },

  desktopHeroRight: {
    flex: 1.15,
  },

  mobileHeroCol: {
    gap: 16,
  },

  fullWidth: {
    width: "100%",
  },

  liveCardDesktop: {
    flex: 1,
    minHeight: 230,
    justifyContent: "space-between",
  },

  scheduleListDesktop: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },

  periodCardDesktop: {
    width: "49%",
  },

  breakRowDesktop: {
    width: "100%",
  },

  toolsGridDesktop: {
    flexDirection: "row",
    gap: 14,
  },

  toolsGridMobile: {
    gap: 10,
  },

  toolCardDesktop: {
    flex: 1,
  },

  /* ================= PROFILE CARD ================= */
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

  profileCardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },

  avatarWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },

  initialsAvatar: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#dbe1ff",
    alignItems: "center",
    justifyContent: "center",
  },

  initialsText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#003fb1",
  },

  profileTextWrap: {
    flex: 1,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  studentName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#191b23",
  },

  regBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: "#dbe1ff",
  },

  regBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#003fb1",
  },

  studentDept: {
    marginTop: 2,
    fontSize: 12,
    color: "#434654",
  },

  enrolledBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: "#dce2f3",
  },

  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#003fb1",
  },

  enrolledText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#5e6572",
  },

  dateBar: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#ededf8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dateLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  dateText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#434654",
  },

  dayOrderText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#585f6c",
  },

  /* ================= LIVE CARD ================= */
  liveCard: {
    borderRadius: 16,
    padding: 18,
    position: "relative",
    overflow: "hidden",
    shadowColor: "#003fb1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },

  liveDecorCircle: {
    position: "absolute",
    right: -20,
    bottom: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  liveCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  liveTagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  pulsingIndicatorWrap: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },

  pulsingIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ffffff",
  },

  liveTagText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#d4dcff",
    letterSpacing: 0.5,
  },

  periodBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  periodBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#ffffff",
  },

  liveSubjectTitle: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.3,
  },

  liveSubjectSubtitle: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "500",
    color: "#d4dcff",
  },

  liveMetaGrid: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  liveMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  liveMetaValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },

  liveMetaSub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
  },

  liveActionRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
    flexDirection: "row",
    gap: 10,
  },

  liveBtnLight: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  liveBtnLightText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#003fb1",
  },

  liveBtnGlass: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  liveBtnGlassText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },

  /* ================= NOTICE ================= */
  noticeCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#852b00",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },

  noticeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  noticeIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#ffdbcf",
    alignItems: "center",
    justifyContent: "center",
  },

  noticeTitleWrap: {
    flex: 1,
  },

  noticeHeading: {
    fontSize: 14,
    fontWeight: "700",
    color: "#191b23",
  },

  noticeApprovedBy: {
    fontSize: 11,
    fontWeight: "600",
    color: "#852b00",
  },

  substitutedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "#ffdbcf",
  },

  substitutedBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#802a00",
  },

  noticeContent: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 18,
    color: "#434654",
  },

  boldText: {
    fontWeight: "700",
    color: "#191b23",
  },

  noticeTransferRow: {
    marginTop: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f3f3fe",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  roomOld: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "#e2e1ed",
  },

  roomOldText: {
    fontSize: 11,
    color: "#585f6c",
    textDecorationLine: "line-through",
  },

  roomNew: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "#852b00",
  },

  roomNewText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },

  effText: {
    marginLeft: "auto",
    fontSize: 11,
    color: "#737686",
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

  /* ================= TODAY SCHEDULE ================= */
  todaySection: {
    gap: 10,
  },

  scheduleHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },

  scheduleTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#191b23",
  },

  scheduleSubtitle: {
    fontSize: 11,
    color: "#585f6c",
  },

  scheduleList: {
    gap: 10,
  },

  breakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f3f3fe",
    borderRadius: 12,
    padding: 10,
  },

  breakIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#dce2f3",
    alignItems: "center",
    justifyContent: "center",
  },

  breakContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  breakTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#585f6c",
  },

  breakTime: {
    fontSize: 11,
    color: "#737686",
  },

  periodCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#e7e7f3",
  },

  periodCardLive: {
    borderLeftWidth: 4,
    borderLeftColor: "#003fb1",
    backgroundColor: "#f8faff",
  },

  periodCardNext: {
    borderLeftWidth: 4,
    borderLeftColor: "#1a56db",
  },

  periodCardDone: {
    opacity: 0.75,
  },

  periodTimeBox: {
    width: 60,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#ededf8",
    alignItems: "center",
    justifyContent: "center",
  },

  periodTimeBoxLive: {
    backgroundColor: "#003fb1",
  },

  periodTimeBoxNext: {
    backgroundColor: "#dce2f3",
  },

  periodTimeStart: {
    fontSize: 11,
    fontWeight: "700",
    color: "#191b23",
  },

  periodTimeEnd: {
    fontSize: 10,
    color: "#585f6c",
  },

  periodPill: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: "#e2e1ed",
  },

  periodPillLive: {
    backgroundColor: "#ffffff",
  },

  periodPillText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#585f6c",
  },

  periodPillTextLive: {
    color: "#003fb1",
  },

  periodContent: {
    flex: 1,
  },

  periodTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  periodCourseName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#191b23",
    flex: 1,
  },

  periodCourseNameLive: {
    color: "#003fb1",
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },

  statusBadgeLive: {
    backgroundColor: "#003fb1",
  },

  statusBadgeNext: {
    backgroundColor: "#dce2f3",
  },

  statusBadgeDone: {
    backgroundColor: "#e2e1ed",
  },

  statusBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },

  periodDetailText: {
    marginTop: 2,
    fontSize: 12,
    color: "#434654",
  },

  periodFacultyText: {
    marginTop: 2,
    fontSize: 11,
    color: "#585f6c",
  },

  periodExtraText: {
    marginTop: 2,
    fontSize: 11,
    color: "#585f6c",
  },

  textWhite: { color: "#ffffff" },
  textWhite70: { color: "rgba(255,255,255,0.75)" },
  textOnSecContainer: { color: "#5e6572" },
  textOnSecContainer70: { color: "rgba(94,101,114,0.75)" },
  textSecondary: { color: "#585f6c" },

  /* ================= WEEKLY VIEW ================= */
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
    paddingHorizontal: 2,
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
    width: "100%",
    gap: 8,
  },

  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ededf8",
    paddingBottom: 6,
  },

  tableHeaderCell: {
    flex: 1,
    minWidth: 96,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
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

  tableIntervalRow: {
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#f3f3fe",
    alignItems: "center",
  },

  tableIntervalText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#585f6c",
  },

  tableBodyRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  tableTimeCell: {
    width: 100,
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
    flex: 1,
    minWidth: 92,
    marginHorizontal: 3,
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

  cellNow: {
    backgroundColor: "#003fb1",
    shadowColor: "#003fb1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
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

  cellSubTitleNow: {
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

  cellTeacherTextNow: {
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

  /* ================= MODAL ================= */
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
