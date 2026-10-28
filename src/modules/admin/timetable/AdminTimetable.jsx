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
} from '@/ui';
import { LinearGradient } from '@/ui';
import { MaterialIcons } from '@/ui';
import BottomNavBar from "../../../components/common/BottomNavBar";
import { useAuth } from "../../auth/context/AuthContext";


const PROFILE_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD1t5z-_oQFWEaabU_WJXKo_VqO91Cj1cerTlzKrkGfjfKSqcYLxb4osCTXeFfFjZjt_RwN3XSs7E1IjqHQ43_S6DeISPQpGZI_lcQ6DCjefn5fA5c6dauILyxqbS3i7H0BtINyQEDLxsbF_xi4onTPB9L_t93ppw-qwRTYb9mtB6ZZQgC6rfLajdkVnLkA96olIVw7dGBlx7YQ2Lb8Yr0yoJg7mPl5YPriyQ0Eed4zO8R7r8JS1wHO";

const todaySchedule = [
  {
    start: "08:45",
    end: "09:35",
    period: "P1",
    title: "Data Structures",
    code: "CS3301",
    type: "Theory",
    room: "Room 204",
    status: "done",
  },
  {
    start: "09:35",
    end: "10:25",
    period: "P2",
    title: "Database Management",
    code: "CS3352",
    type: "Theory",
    room: "Room 204",
    status: "done",
  },
  {
    break: true,
    icon: "local-cafe",
    title: "Morning Tea Break & Refreshment",
    time: "10:25 – 10:40",
  },
  {
    start: "10:40",
    end: "11:30",
    period: "P3",
    title: "Deep Learning",
    code: "AD3501",
    type: "Core Theory",
    room: "Room 302 (Turing Hall)",
    faculty: "Dr. Kumar",
    status: "now",
  },
  {
    start: "11:30",
    end: "12:20",
    period: "P4",
    title: "Deep Learning Lab",
    code: "AD3511",
    type: "Practical Lab",
    room: "AI Lab 2",
    note: "Batch 1 & 2 Combined",
    status: "next",
  },
  {
    break: true,
    icon: "restaurant",
    title: "Lunch Recess & Campus Green",
    time: "12:20 – 01:10",
  },
  {
    start: "01:10",
    end: "02:00",
    period: "P5",
    title: "Operating Systems",
    code: "CS3401",
    type: "Theory",
    room: "Room 302",
  },
  {
    start: "02:00",
    end: "03:50",
    period: "P6-7",
    title: "Mini-Project Lab",
    code: "AD3512",
    type: "2 Hours",
    room: "Computing Center 1",
    status: "lab",
  },
];

const weeklyRows = [
  {
    time: "08:45–09:35",
    cells: [
      ["DS", "DK", "theory"],
      ["DBMS", "SM", "theory"],
      ["DL", "KM", "today"],
      ["OS", "AR", "theory"],
      ["ML", "VG", "theory"],
    ],
  },
  {
    time: "09:35–10:25",
    cells: [
      ["DBMS", "SM", "theory"],
      ["DS", "DK", "theory"],
      ["ML", "VG", "theory"],
      ["DL", "KM", "theory"],
      ["DBMS", "SM", "theory"],
    ],
  },
  {
    break: true,
    text: "10:25 – 10:40 • Morning Interval",
  },
  {
    time: "10:40–11:30",
    cells: [
      ["ML", "VG", "theory"],
      ["OS", "AR", "theory"],
      ["DS", "DK", "today"],
      ["DS*", "DK", "lab"],
      ["DL", "KM", "theory"],
    ],
  },
  {
    time: "11:30–12:20",
    cells: [
      ["DL", "KM", "theory"],
      ["ML", "VG", "theory"],
      ["DBMS", "SM", "theory"],
      ["OS", "AR", "theory"],
      ["DS", "DK", "theory"],
    ],
  },
  {
    break: true,
    text: "12:20 – 01:10 • Lunch Interval",
  },
  {
    time: "01:10–02:00",
    cells: [
      ["OS", "AR", "theory"],
      ["DL", "KM", "theory"],
      ["ML", "VG", "theory"],
      ["DBMS", "SM", "theory"],
      ["ML", "VG", "theory"],
    ],
  },
  {
    time: "02:00–03:50",
    labTime: true,
    cells: [
      ["AI Lab", "Lab 2", "lab"],
      ["AI Lab", "Lab 1", "lab"],
      ["DS Lab", "Lab 3", "lab"],
      ["ML Lab", "Lab 2", "lab"],
      ["Project", "CC 1", "lab"],
    ],
  },
];

const facultyList = [
  {
    initials: "DK",
    name: "Dr. Kumar (KM)",
    subject: "Deep Learning • Cabin #312",
    email: "kumar.ad@infotech.edu.in",
    bg: "#dbe1ff",
    text: "#003fb1",
  },
  {
    initials: "SM",
    name: "Prof. Saravanan M (SM)",
    subject: "DBMS • Cabin #208",
    email: "saravanan.cs@infotech.edu.in",
    bg: "#dce2f3",
    text: "#5e6572",
  },
  {
    initials: "AR",
    name: "Dr. Arulprakash P (HOD)",
    subject: "Operating Systems • HOD Office",
    email: "hod.aids@infotech.edu.in",
    bg: "#ffdbcf",
    text: "#802a00",
  },
];

export default function AdminTimetable({ navigation }) {
  const { user, profile } = useAuth();
  const [view, setView] = useState("today");
  const [facultyOpen, setFacultyOpen] = useState(false);
  const [toastText, setToastText] = useState("");
  const toastFade = useRef(new Animated.Value(0)).current;

  const adminName = profile?.full_name || user?.profile?.full_name || "Administrator";
  const adminInitial = adminName.charAt(0).toUpperCase();
  const adminId = profile?.id ? `ADM-${String(profile.id).slice(0, 8).toUpperCase()}` : "Admin";
  const adminDept = profile?.department?.name ? `${profile.department.name} • Institutional Oversight` : "Academic Administration & Department Oversight";
  const avatarUrl = profile?.avatar_url || user?.profile?.avatar_url || PROFILE_IMAGE;

  const adminNavItems = [
    { key: "home", label: "Home", icon: "dashboard", screen: "AdminDashboard" },
    { key: "attendance", label: "Attendance", icon: "how-to-reg", screen: "ReportManagement" },
    { key: "timetable", label: "Timetable", icon: "calendar-month", screen: "AdminTimetable" },
    { key: "history", label: "History", icon: "history", screen: "AttendanceHistory" },
    { key: "profile", label: "Profile", icon: "person", screen: "AdminProfile" },
  ];

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
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => {
              if (navigation && navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation?.navigate("AdminDashboard");
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
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>Admin</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.profileButton}
            onPress={() => navigation?.navigate("AdminProfile")}
          >
            <Image
              source={{ uri: avatarUrl }}
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
          {/* 1. Admin / Institutional Oversight Context Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileCardTop}>
              <View style={styles.avatarWrap}>
                <View style={styles.initialsAvatar}>
                  <Text style={styles.initialsText}>{adminInitial}</Text>
                </View>
                <View style={styles.profileTextWrap}>
                  <View style={styles.nameRow}>
                    <Text style={styles.studentName}>{adminName}</Text>
                    <View style={styles.regBadge}>
                      <Text style={styles.regBadgeText}>{adminId}</Text>
                    </View>
                  </View>
                  <Text style={styles.studentDept}>
                    {adminDept}
                  </Text>
                </View>
              </View>

              <View style={styles.enrolledBadge}>
                <View style={styles.livePulseDot} />
                <Text style={styles.enrolledText}>Active Oversight</Text>
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

          {/* 2. Live Class Banner Card */}
          <LinearGradient
            colors={["#003fb1", "#1a56db", "#003fb1"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.liveCard}
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
                onPress={() => showToast("Syllabus view opened.")}
              >
                <MaterialIcons name="menu-book" size={16} color="#003fb1" />
                <Text style={styles.liveBtnLightText}>View Syllabus</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.liveBtnGlass}
                activeOpacity={0.8}
                onPress={() => showToast("Lecture notes view opened.")}
              >
                <MaterialIcons name="description" size={16} color="#ffffff" />
                <Text style={styles.liveBtnGlassText}>Lecture Notes</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

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

          {/* 4. Tab Switcher (Today's Schedule vs Weekly Grid) */}
          <View style={styles.segmentWrap}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.segmentTab,
                view === "today" && styles.segmentTabActive,
              ]}
              onPress={() => setView("today")}
            >
              <MaterialIcons
                name="view-timeline"
                size={18}
                color={view === "today" ? "#003fb1" : "#585f6c"}
              />
              <Text
                style={[
                  styles.segmentTabText,
                  view === "today" && styles.segmentTabTextActive,
                ]}
              >
                Today's Schedule
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.segmentTab,
                view === "week" && styles.segmentTabActive,
              ]}
              onPress={() => setView("week")}
            >
              <MaterialIcons
                name="grid-view"
                size={18}
                color={view === "week" ? "#003fb1" : "#585f6c"}
              />
              <Text
                style={[
                  styles.segmentTabText,
                  view === "week" && styles.segmentTabTextActive,
                ]}
              >
                Weekly Grid
              </Text>
            </TouchableOpacity>
          </View>

          {/* 5. Schedule Views */}
          {view === "today" ? (
            <View style={styles.todaySection}>
              <View style={styles.scheduleHeaderRow}>
                <Text style={styles.scheduleTitle}>Wednesday Schedule</Text>
                <Text style={styles.scheduleSubtitle}>
                  7 Periods • 1 Break • 1 Lunch
                </Text>
              </View>

              <View style={styles.scheduleList}>
                {todaySchedule.map((item, i) => {
                  if (item.break) {
                    return (
                      <View key={i} style={styles.breakRow}>
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

                  const isLive = item.status === "now";
                  const isNext = item.status === "next";
                  const isDone = item.status === "done";
                  const isLab = item.status === "lab";

                  return (
                    <View
                      key={i}
                      style={[
                        styles.periodCard,
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
                          {item.start}
                        </Text>
                        <Text
                          style={[
                            styles.periodTimeEnd,
                            isLive && styles.textWhite70,
                            isNext && styles.textOnSecContainer70,
                          ]}
                        >
                          {item.end}
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
                            {item.title}
                          </Text>

                          {isDone ? (
                            <View style={[styles.statusBadge, styles.statusDoneBadge]}>
                              <MaterialIcons name="done" size={12} color="#166534" />
                              <Text style={[styles.statusBadgeText, { color: "#166534" }]}>
                                Done
                              </Text>
                            </View>
                          ) : isLive ? (
                            <View style={[styles.statusBadge, styles.statusLiveBadge]}>
                              <View style={styles.livePulseDotWhite} />
                              <Text style={[styles.statusBadgeText, styles.textWhite]}>
                                NOW
                              </Text>
                            </View>
                          ) : isNext ? (
                            <View style={[styles.statusBadge, styles.statusNextBadge]}>
                              <Text style={[styles.statusBadgeText, styles.textOnSecContainer]}>
                                Next Up
                              </Text>
                            </View>
                          ) : isLab ? (
                            <View style={[styles.statusBadge, styles.statusLabBadge]}>
                              <Text style={[styles.statusBadgeText, { color: "#802a00" }]}>
                                2 Hours
                              </Text>
                            </View>
                          ) : null}
                        </View>

                        <Text style={styles.periodDetailText}>
                          {item.code} • {item.type} • {item.room}
                        </Text>

                        {item.faculty ? (
                          <Text style={styles.periodFacultyText}>
                            Faculty: {item.faculty}
                          </Text>
                        ) : null}

                        {item.note ? (
                          <Text style={styles.periodExtraText}>
                            {item.note}
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

                    {weeklyRows.map((row, idx) => {
                      if (row.break) {
                        return (
                          <View key={idx} style={styles.tableIntervalRow}>
                            <Text style={styles.tableIntervalText}>
                              {row.text}
                            </Text>
                          </View>
                        );
                      }

                      return (
                        <View key={idx} style={styles.tableBodyRow}>
                          <View style={styles.tableTimeCell}>
                            <Text style={styles.tableTimeText}>{row.time}</Text>
                            {row.labTime ? (
                              <Text style={styles.tableLabSub}>(2h Lab)</Text>
                            ) : null}
                          </View>

                          {row.cells.map(([sub, teacher, type], colIdx) => {
                            const isLab = type === "lab";
                            const isToday = type === "today";

                            return (
                              <View
                                key={colIdx}
                                style={[
                                  styles.tableSubjectCell,
                                  isLab
                                    ? styles.cellLab
                                    : isToday
                                    ? styles.cellNow
                                    : styles.cellTheory,
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.cellSubTitle,
                                    isLab && styles.cellSubTitleLab,
                                    isToday && styles.cellSubTitleNow,
                                  ]}
                                >
                                  {sub}
                                </Text>
                                <Text
                                  style={[
                                    styles.cellTeacherText,
                                    isLab && styles.cellTeacherTextLab,
                                    isToday && styles.cellTeacherTextNow,
                                  ]}
                                >
                                  {teacher}
                                </Text>
                              </View>
                            );
                          })}
                        </View>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            </View>
          )}

          {/* 6. Tools & Support */}
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
              style={styles.toolCard}
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

          {/* Bottom spacing for bottom nav */}
          <View style={{ height: 80 }} />
        </View>
      </ScrollView>

      {/* ================= BOTTOM NAVIGATION BAR ================= */}
      <BottomNavBar
        items={adminNavItems}
        activeItem="timetable"
        navigation={navigation}
      />

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
                      <Text style={styles.facultyDetail}>{f.subject}</Text>
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
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },

  statusDoneBadge: {
    backgroundColor: "#dcfce7",
  },

  statusLiveBadge: {
    backgroundColor: "#003fb1",
  },

  statusNextBadge: {
    backgroundColor: "#dce2f3",
  },

  statusLabBadge: {
    backgroundColor: "#ffdbcf",
  },

  livePulseDotWhite: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ffffff",
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

  tableIntervalRow: {
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#f3f3fe",
    alignItems: "center",
  },

  tableIntervalText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#585f6c",
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
