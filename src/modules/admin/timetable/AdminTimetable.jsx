import React, { useState, useRef } from "react";
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
} from '@/ui';
import { MaterialIcons } from '@/ui';
import { useAuth } from "../../auth/context/AuthContext";

const PROFILE_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCc4W7vI51fe3ETw2EQX4lwi44xHoVjxhajjHMOpT9y4iEJ2w8FkLsxEKbcnrl10ihCKljH5APzLmaGOBLlDkKSoWlXxQZMUZCZ5ZYFRWfdzsJ5rRxYgOgXDtLucM8yYOpUOWkVomMC1Am6Bw_lboIad4GF0jJFtugTgDmGFGcLEeziTnzKyhlD6Q8oqmQyp73E-3fTq8Ea4twUa7ikmr3uzfZZGX0jipb0oFQobqODLlnQqLmhRmD1";

const todaySchedule = [
  {
    start: "08:45",
    end: "09:35",
    period: "P1",
    title: "Data Structures",
    code: "CS3301",
    type: "Core Theory",
    room: "Room 204",
    faculty: "Dr. R. Kavitha",
    status: "done",
  },
  {
    start: "09:35",
    end: "10:25",
    period: "P2",
    title: "Database Management Systems",
    code: "CS3352",
    type: "Core Theory",
    room: "Room 204",
    faculty: "Prof. M. Selvam",
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
    title: "Deep Learning Architectures",
    code: "AD3501",
    type: "Core Theory",
    room: "Turing Hall (Room 302)",
    faculty: "Dr. S. Kabilan",
    status: "now",
  },
  {
    start: "11:30",
    end: "12:20",
    period: "P4",
    title: "Deep Learning Laboratory",
    code: "AD3511",
    type: "Practical Lab",
    room: "AI Lab 2 • Turing Block",
    faculty: "Dr. S. Kabilan & Lab Team",
    note: "Batch 1 & 2 Combined Practical Session",
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
    title: "Operating Systems & Virtualization",
    code: "CS3401",
    type: "Core Theory",
    room: "Room 302",
    faculty: "Prof. S. Anand",
    status: "scheduled",
  },
  {
    start: "02:00",
    end: "03:50",
    period: "P6-7",
    title: "Mini-Project & Collaborative Lab",
    code: "AD3512",
    type: "Practical (2 Hours)",
    room: "Computing Center 1",
    faculty: "Dr. R. Kavitha & Faculty Mentors",
    status: "lab",
  },
];

const weeklyRows = [
  {
    time: "08:45–09:35",
    cells: [
      ["Data Structures", "Dr. Kavitha", "theory", "CS3301", "LH-204"],
      ["Database Systems", "Prof. Selvam", "theory", "CS3352", "LH-204"],
      ["Deep Learning", "Dr. Kabilan", "today", "AD3501", "LH-302"],
      ["Operating Systems", "Prof. Anand", "theory", "CS3401", "LH-302"],
      ["Machine Learning", "Dr. Vijayalakshmi", "theory", "AD3502", "LH-204"],
    ],
  },
  {
    time: "09:35–10:25",
    cells: [
      ["Database Systems", "Prof. Selvam", "theory", "CS3352", "LH-204"],
      ["Data Structures", "Dr. Kavitha", "theory", "CS3301", "LH-204"],
      ["Machine Learning", "Dr. Vijayalakshmi", "theory", "AD3502", "LH-204"],
      ["Deep Learning", "Dr. Kabilan", "theory", "AD3501", "LH-302"],
      ["Database Systems", "Prof. Selvam", "theory", "CS3352", "LH-204"],
    ],
  },
  {
    break: true,
    text: "10:25 – 10:40 • Morning Tea Break & Interval",
  },
  {
    time: "10:40–11:30",
    cells: [
      ["Machine Learning", "Dr. Vijayalakshmi", "theory", "AD3502", "LH-204"],
      ["Operating Systems", "Prof. Anand", "theory", "CS3401", "LH-302"],
      ["Deep Learning", "Dr. Kabilan", "today", "AD3501", "LH-302"],
      ["DS Practical Lab", "Dr. Kavitha", "lab", "CS3311", "AI Lab 1"],
      ["Deep Learning", "Dr. Kabilan", "theory", "AD3501", "LH-302"],
    ],
  },
  {
    time: "11:30–12:20",
    cells: [
      ["Deep Learning", "Dr. Kabilan", "theory", "AD3501", "LH-302"],
      ["Machine Learning", "Dr. Vijayalakshmi", "theory", "AD3502", "LH-204"],
      ["Deep Learning Lab", "Dr. Kabilan", "today-lab", "AD3511", "AI Lab 2"],
      ["Operating Systems", "Prof. Anand", "theory", "CS3401", "LH-302"],
      ["Data Structures", "Dr. Kavitha", "theory", "CS3301", "LH-204"],
    ],
  },
  {
    break: true,
    text: "12:20 – 01:10 • Lunch Interval & Campus Dining",
  },
  {
    time: "01:10–02:00",
    cells: [
      ["Operating Systems", "Prof. Anand", "theory", "CS3401", "LH-302"],
      ["Deep Learning", "Dr. Kabilan", "theory", "AD3501", "LH-302"],
      ["Operating Systems", "Prof. Anand", "theory", "CS3401", "LH-302"],
      ["Database Systems", "Prof. Selvam", "theory", "CS3352", "LH-204"],
      ["Machine Learning", "Dr. Vijayalakshmi", "theory", "AD3502", "LH-204"],
    ],
  },
  {
    time: "02:00–03:50",
    labTime: true,
    cells: [
      ["AI Practical Lab", "Dr. Kabilan", "lab", "AD3511", "AI Lab 2"],
      ["DBMS Laboratory", "Prof. Selvam", "lab", "CS3361", "CC-1"],
      ["Mini-Project Lab", "Dr. Kavitha", "today-lab", "AD3512", "CC-1"],
      ["OS Laboratory", "Prof. Anand", "lab", "CS3411", "OS Lab"],
      ["Project Mentorship", "Faculty Team", "lab", "PROJ", "Innovation Quad"],
    ],
  },
];

const facultyList = [
  {
    initials: "DK",
    name: "Dr. S. Kabilan (KM)",
    designation: "Associate Professor",
    subject: "Deep Learning • AD3501",
    cabin: "Cabin 312 • Turing Block",
    email: "kabilan.s@infotech.edu.in",
    bg: "#dbeafe",
    text: "#003fb1",
  },
  {
    initials: "SM",
    name: "Prof. M. Selvam (SM)",
    designation: "Assistant Professor",
    subject: "DBMS • CS3352",
    cabin: "Cabin 208 • Computing Block",
    email: "selvam.m@infotech.edu.in",
    bg: "#e0e7ff",
    text: "#4338ca",
  },
  {
    initials: "RK",
    name: "Dr. R. Kavitha (RK)",
    designation: "Professor & HOD",
    subject: "Data Structures • CS3301",
    cabin: "HOD Executive Suite • Admin Wing",
    email: "kavitha.r@infotech.edu.in",
    bg: "#fef3c7",
    text: "#92400e",
  },
  {
    initials: "SA",
    name: "Prof. S. Anand (SA)",
    designation: "Assistant Professor",
    subject: "Operating Systems • CS3401",
    cabin: "Cabin 304 • Software Wing",
    email: "anand.s@infotech.edu.in",
    bg: "#dcfce7",
    text: "#166534",
  },
];

export default function AdminTimetable({ navigation }) {
  const { user, profile } = useAuth();
  const [view, setView] = useState("today"); // 'today' | 'week'
  const [facultyOpen, setFacultyOpen] = useState(false);
  const [toastText, setToastText] = useState("");
  const toastFade = useRef(new Animated.Value(0)).current;

  const adminName = profile?.full_name || profile?.name || user?.profile?.full_name || user?.name || "Dr. K. Arulmozhi";
  const adminId = profile?.id ? `ADM-${String(profile.id).slice(0, 8).toUpperCase()}` : "ADM-001";
  const avatarUrl = profile?.avatar_url || profile?.avatar || user?.profile?.avatar_url || user?.avatar || PROFILE_IMAGE;

  const showToast = (msg) => {
    setToastText(msg);
    Animated.sequence([
      Animated.timing(toastFade, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.delay(2600),
      Animated.timing(toastFade, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => setToastText(""));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.laptopContainer}>
          {/* Top Breadcrumb & Actions Toolbar */}
          <View style={styles.topToolbar}>
            <View style={styles.breadcrumbWrap}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => {
                  if (navigation && navigation.canGoBack()) navigation.goBack();
                  else navigation?.navigate("AdminDashboard");
                }}
                activeOpacity={0.7}
              >
                <MaterialIcons name="arrow-back" size={18} color="#003fb1" />
                <Text style={styles.backBtnText}>Dashboard</Text>
              </TouchableOpacity>
              <Text style={styles.breadcrumbDivider}>/</Text>
              <Text style={styles.breadcrumbCurrent}>Institutional Master Timetable</Text>
              <Text style={styles.breadcrumbTag}>III Year AI & DS • Section A</Text>
            </View>

            <View style={styles.topActionGroup}>
              {/* Segmented View Switcher */}
              <View style={styles.viewSegmentWrap}>
                <TouchableOpacity
                  style={[styles.segmentBtn, view === "today" && styles.segmentBtnActive]}
                  onPress={() => setView("today")}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name="view-timeline"
                    size={16}
                    color={view === "today" ? "#003fb1" : "#64748b"}
                  />
                  <Text style={[styles.segmentBtnText, view === "today" && styles.segmentBtnTextActive]}>
                    Today's Schedule
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.segmentBtn, view === "week" && styles.segmentBtnActive]}
                  onPress={() => setView("week")}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name="grid-view"
                    size={16}
                    color={view === "week" ? "#003fb1" : "#64748b"}
                  />
                  <Text style={[styles.segmentBtnText, view === "week" && styles.segmentBtnTextActive]}>
                    Weekly Matrix Grid
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.actionBtnSecondary}
                onPress={() => setFacultyOpen(true)}
                activeOpacity={0.8}
              >
                <MaterialIcons name="badge" size={18} color="#003fb1" />
                <Text style={styles.actionBtnSecondaryText}>Faculty Directory</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtnPrimary}
                onPress={() => showToast("Downloading Master Timetable (PDF)...")}
                activeOpacity={0.8}
              >
                <MaterialIcons name="file-download" size={18} color="#ffffff" />
                <Text style={styles.actionBtnPrimaryText}>Export PDF</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Institutional Overview Header Card (Widescreen) */}
          <View style={styles.overviewCard}>
            <View style={styles.overviewLeft}>
              <View style={styles.overviewBadgeRow}>
                <View style={styles.activePill}>
                  <View style={styles.livePulseDot} />
                  <Text style={styles.activePillText}>LIVE TIMETABLE SUPERVISION</Text>
                </View>
                <Text style={styles.termTag}>Semester 6 • Academic Year 2026–2027</Text>
              </View>

              <Text style={styles.overviewTitle}>Department of Artificial Intelligence & Data Science</Text>
              <Text style={styles.overviewSubtitle}>
                III Year B.Tech AI & DS • Section A • Central Campus Block LH-204 & Turing Lab
              </Text>
            </View>

            <View style={styles.overviewRight}>
              <View style={styles.statMiniCard}>
                <Text style={styles.statMiniVal}>Day 3</Text>
                <Text style={styles.statMiniLbl}>Current Day Order</Text>
              </View>
              <View style={styles.statMiniCard}>
                <Text style={styles.statMiniVal}>7 Periods</Text>
                <Text style={styles.statMiniLbl}>Today's Workload</Text>
              </View>
              <View style={styles.statMiniCard}>
                <Text style={styles.statMiniVal}>2 Labs</Text>
                <Text style={styles.statMiniLbl}>Practical Blocks</Text>
              </View>
            </View>
          </View>

          {/* VIEW 1: TODAY'S SCHEDULE (2-COLUMN LAPTOP LAYOUT) */}
          {view === "today" ? (
            <View style={styles.laptopGrid}>
              {/* Left Column: Live Class Banner, Notice, & Tools */}
              <View style={styles.leftCol}>
                {/* Live Class Banner Card */}
                <View style={styles.liveCard}>
                  <View style={styles.liveDecorCircleOne} />
                  <View style={styles.liveDecorCircleTwo} />

                  <View style={styles.liveCardContent}>
                    <View style={styles.liveHeaderRow}>
                      <View style={styles.livePill}>
                        <View style={styles.pulsingDot} />
                        <Text style={styles.livePillText}>NOW IN SESSION • 10:40 AM – 11:30 AM</Text>
                      </View>
                      <View style={styles.periodPill}>
                        <Text style={styles.periodPillText}>Period 3</Text>
                      </View>
                    </View>

                    <Text style={styles.liveCourseName}>Deep Learning Architectures</Text>
                    <Text style={styles.liveCourseCode}>AD3501 • Professional Core Theory</Text>

                    <View style={styles.liveDetailGrid}>
                      <View style={styles.liveDetailItem}>
                        <MaterialIcons name="person" size={16} color="#bfdbfe" />
                        <Text style={styles.liveDetailText}>Dr. S. Kabilan (Assoc. Prof)</Text>
                      </View>
                      <View style={styles.liveDetailItem}>
                        <MaterialIcons name="room" size={16} color="#bfdbfe" />
                        <Text style={styles.liveDetailText}>Turing Hall (Room 302)</Text>
                      </View>
                    </View>

                    <View style={styles.liveActionRow}>
                      <TouchableOpacity
                        style={styles.liveActionLight}
                        onPress={() => showToast("Syllabus & Course Outcomes opened.")}
                        activeOpacity={0.8}
                      >
                        <MaterialIcons name="menu-book" size={15} color="#003fb1" />
                        <Text style={styles.liveActionLightText}>View Syllabus</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.liveActionGlass}
                        onPress={() => showToast("Lecture Notes repository opened.")}
                        activeOpacity={0.8}
                      >
                        <MaterialIcons name="description" size={15} color="#ffffff" />
                        <Text style={styles.liveActionGlassText}>Lecture Notes</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Timetable Relocation Notice Card */}
                <View style={styles.noticeCard}>
                  <View style={styles.noticeHeader}>
                    <View style={styles.noticeIconBox}>
                      <MaterialIcons name="notifications-active" size={18} color="#9a3412" />
                    </View>
                    <View style={styles.noticeHeaderInfo}>
                      <Text style={styles.noticeTitle}>Classroom Relocation Notice</Text>
                      <Text style={styles.noticeSub}>Approved by Dr. R. Kavitha (HOD)</Text>
                    </View>
                    <View style={styles.substitutedTag}>
                      <Text style={styles.substitutedTagText}>SUBSTITUTED</Text>
                    </View>
                  </View>

                  <Text style={styles.noticeBody}>
                    Tomorrow Period 3: <Text style={styles.boldText}>Deep Learning</Text> relocated to{" "}
                    <Text style={styles.boldText}>AI Lab 1</Text> due to scheduled projector calibration in Room 302.
                  </Text>

                  <View style={styles.relocationPillRow}>
                    <View style={styles.roomOldPill}>
                      <Text style={styles.roomOldText}>Room 302</Text>
                    </View>
                    <MaterialIcons name="arrow-forward" size={16} color="#9a3412" />
                    <View style={styles.roomNewPill}>
                      <Text style={styles.roomNewText}>AI Lab 1</Text>
                    </View>
                    <Text style={styles.effectiveDateText}>Eff: Tomorrow</Text>
                  </View>
                </View>

                {/* Administrative Tools Card */}
                <View style={styles.toolsCard}>
                  <Text style={styles.toolsCardHeading}>Timetable Controls & Directory</Text>

                  <TouchableOpacity
                    style={styles.toolItem}
                    onPress={() => setFacultyOpen(true)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.toolIconWrap, { backgroundColor: "#eff6ff" }]}>
                      <MaterialIcons name="school" size={20} color="#003fb1" />
                    </View>
                    <View style={styles.toolInfo}>
                      <Text style={styles.toolTitle}>View Faculty Cabins & Contact</Text>
                      <Text style={styles.toolSub}>Office hours, cabin locations & emails</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color="#94a3b8" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.toolItem}
                    onPress={() => showToast("Generating Semester 6 Official Timetable PDF...")}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.toolIconWrap, { backgroundColor: "#f0fdf4" }]}>
                      <MaterialIcons name="file-download" size={20} color="#166534" />
                    </View>
                    <View style={styles.toolInfo}>
                      <Text style={styles.toolTitle}>Download Signed Timetable</Text>
                      <Text style={styles.toolSub}>Official academic seal signed copy</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color="#94a3b8" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.toolItem}
                    onPress={() => showToast("Submitting clash ticket to Academic Office.")}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.toolIconWrap, { backgroundColor: "#fef2f2" }]}>
                      <MaterialIcons name="report-problem" size={20} color="#991b1b" />
                    </View>
                    <View style={styles.toolInfo}>
                      <Text style={styles.toolTitle}>Report Schedule Conflict</Text>
                      <Text style={styles.toolSub}>Direct notification to Dean & HOD office</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Right Column: Full Period Timeline */}
              <View style={styles.rightCol}>
                <View style={styles.timelineContainerCard}>
                  <View style={styles.timelineHeaderRow}>
                    <View>
                      <Text style={styles.timelineMainTitle}>Today's Period Progression</Text>
                      <Text style={styles.timelineSubTitle}>
                        Day Order 3 • 7 Total Periods (2 Completed • 1 In Progress • 4 Scheduled)
                      </Text>
                    </View>

                    <View style={styles.progressCounterBadge}>
                      <MaterialIcons name="check-circle" size={16} color="#166534" />
                      <Text style={styles.progressCounterText}>2 of 7 Completed</Text>
                    </View>
                  </View>

                  <View style={styles.periodList}>
                    {todaySchedule.map((item, idx) => {
                      if (item.break) {
                        return (
                          <View key={idx} style={styles.breakRowCard}>
                            <View style={styles.breakIconCircle}>
                              <MaterialIcons name={item.icon} size={18} color="#003fb1" />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.breakTitle}>{item.title}</Text>
                              <Text style={styles.breakTime}>{item.time}</Text>
                            </View>
                            <View style={styles.recessBadge}>
                              <Text style={styles.recessBadgeText}>CAMPUS INTERVAL</Text>
                            </View>
                          </View>
                        );
                      }

                      const isDone = item.status === "done";
                      const isNow = item.status === "now";
                      const isNext = item.status === "next";
                      const isLab = item.status === "lab";

                      return (
                        <View
                          key={idx}
                          style={[
                            styles.periodCard,
                            isNow && styles.periodCardNow,
                            isDone && styles.periodCardDone,
                          ]}
                        >
                          <View style={styles.periodTimeCol}>
                            <Text style={[styles.periodNumber, isNow && { color: "#003fb1" }]}>
                              {item.period}
                            </Text>
                            <Text style={styles.periodTimeRange}>
                              {item.start} – {item.end}
                            </Text>
                          </View>

                          <View style={styles.periodDividerLine} />

                          <View style={styles.periodInfoCol}>
                            <View style={styles.periodTitleRow}>
                              <Text style={styles.periodCourseTitle}>{item.title}</Text>
                              {isDone ? (
                                <View style={styles.statusPillDone}>
                                  <MaterialIcons name="check" size={12} color="#166534" />
                                  <Text style={styles.statusPillDoneText}>COMPLETED</Text>
                                </View>
                              ) : isNow ? (
                                <View style={styles.statusPillNow}>
                                  <View style={styles.pulsingSmallDot} />
                                  <Text style={styles.statusPillNowText}>IN PROGRESS</Text>
                                </View>
                              ) : isNext ? (
                                <View style={styles.statusPillNext}>
                                  <Text style={styles.statusPillNextText}>UPCOMING</Text>
                                </View>
                              ) : isLab ? (
                                <View style={styles.statusPillLab}>
                                  <Text style={styles.statusPillLabText}>2-HOUR PRACTICAL</Text>
                                </View>
                              ) : (
                                <View style={styles.statusPillSched}>
                                  <Text style={styles.statusPillSchedText}>SCHEDULED</Text>
                                </View>
                              )}
                            </View>

                            <View style={styles.periodMetaRow}>
                              <Text style={styles.metaBadgeCode}>{item.code}</Text>
                              <Text style={styles.metaBadgeType}>{item.type}</Text>
                              <Text style={styles.metaBullet}>•</Text>
                              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                                <MaterialIcons name="location-on" size={14} color="#64748b" />
                                <Text style={styles.metaRoomText}>{item.room}</Text>
                              </View>
                              {item.faculty ? (
                                <>
                                  <Text style={styles.metaBullet}>•</Text>
                                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                                    <MaterialIcons name="person" size={14} color="#64748b" />
                                    <Text style={styles.metaFacultyText}>{item.faculty}</Text>
                                  </View>
                                </>
                              ) : null}
                            </View>

                            {item.note ? (
                              <View style={styles.noteBanner}>
                                <MaterialIcons name="info-outline" size={14} color="#003fb1" />
                                <Text style={styles.noteBannerText}>{item.note}</Text>
                              </View>
                            ) : null}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            </View>
          ) : (
            /* VIEW 2: WEEKLY TIMETABLE MATRIX GRID (FULL WIDESCREEN LAPTOP VIEW) */
            <View style={styles.weeklyCard}>
              <View style={styles.weeklyHeaderRow}>
                <View>
                  <Text style={styles.weeklyMainTitle}>Institutional Master Timetable Grid</Text>
                  <Text style={styles.weeklySubTitle}>
                    Department of Artificial Intelligence & Data Science • Semester 6 (Batch 2023–2027)
                  </Text>
                </View>

                {/* Legend Row */}
                <View style={styles.legendRow}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendBox, { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }]} />
                    <Text style={styles.legendLabel}>Core Theory</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendBox, { backgroundColor: "#fef3c7", borderColor: "#fde68a" }]} />
                    <Text style={styles.legendLabel}>Practical Lab</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendBox, { backgroundColor: "#dbeafe", borderColor: "#003fb1", borderWidth: 2 }]} />
                    <Text style={styles.legendLabel}>Wednesday (Today)</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendBox, { backgroundColor: "#f1f5f9", borderColor: "#e2e8f0" }]} />
                    <Text style={styles.legendLabel}>Break / Recess</Text>
                  </View>
                </View>
              </View>

              {/* Master Matrix Table */}
              <View style={styles.tableCard}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.matrixTable}>
                    {/* Header Row */}
                    <View style={styles.matrixHeaderRow}>
                      <View style={[styles.matrixHeaderCell, styles.matrixTimeHeaderCell]}>
                        <Text style={styles.matrixHeaderCellText}>PERIOD / TIME</Text>
                      </View>
                      <View style={styles.matrixHeaderCell}>
                        <Text style={styles.matrixHeaderCellText}>MONDAY</Text>
                      </View>
                      <View style={styles.matrixHeaderCell}>
                        <Text style={styles.matrixHeaderCellText}>TUESDAY</Text>
                      </View>
                      <View style={[styles.matrixHeaderCell, styles.matrixHeaderCellToday]}>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}>
                          <Text style={[styles.matrixHeaderCellText, { color: "#003fb1" }]}>WEDNESDAY</Text>
                          <View style={styles.todayPillBadge}>
                            <Text style={styles.todayPillBadgeText}>TODAY</Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.matrixHeaderCell}>
                        <Text style={styles.matrixHeaderCellText}>THURSDAY</Text>
                      </View>
                      <View style={styles.matrixHeaderCell}>
                        <Text style={styles.matrixHeaderCellText}>FRIDAY</Text>
                      </View>
                    </View>

                    {/* Table Body Rows */}
                    {weeklyRows.map((row, rIdx) => {
                      if (row.break) {
                        return (
                          <View key={rIdx} style={styles.matrixBreakRow}>
                            <MaterialIcons name="coffee" size={16} color="#003fb1" />
                            <Text style={styles.matrixBreakText}>{row.text}</Text>
                          </View>
                        );
                      }

                      return (
                        <View key={rIdx} style={styles.matrixBodyRow}>
                          <View style={[styles.matrixCell, styles.matrixTimeCell]}>
                            <Text style={styles.matrixTimeText}>{row.time}</Text>
                            {row.labTime ? (
                              <View style={styles.labDurationBadge}>
                                <Text style={styles.labDurationBadgeText}>2-HR BLOCK</Text>
                              </View>
                            ) : null}
                          </View>

                          {row.cells.map(([sub, teacher, type, code, room], cIdx) => {
                            const isLab = type === "lab" || type === "today-lab";
                            const isToday = cIdx === 2; // Wednesday column

                            return (
                              <View
                                key={cIdx}
                                style={[
                                  styles.matrixCell,
                                  isLab ? styles.matrixCellLab : styles.matrixCellTheory,
                                  isToday && styles.matrixCellTodayHighlight,
                                ]}
                              >
                                <View style={styles.cellTopRow}>
                                  <Text style={styles.cellCodeText}>{code}</Text>
                                  <Text style={styles.cellRoomText}>{room}</Text>
                                </View>
                                <Text style={styles.cellSubTitle} numberOfLines={2}>
                                  {sub}
                                </Text>
                                <View style={styles.cellTeacherRow}>
                                  <MaterialIcons name="person" size={12} color="#64748b" />
                                  <Text style={styles.cellTeacherText}>{teacher}</Text>
                                </View>
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
        </View>
      </ScrollView>

      {/* ================= DESKTOP FACULTY DIRECTORY MODAL ================= */}
      <Modal
        visible={facultyOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setFacultyOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setFacultyOpen(false)} />

          <View style={styles.modalDialog}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <View style={styles.modalIconWrap}>
                  <MaterialIcons name="school" size={22} color="#003fb1" />
                </View>
                <View>
                  <Text style={styles.modalHeading}>Course Faculty Directory</Text>
                  <Text style={styles.modalSubheading}>
                    Semester 6 Academic Advisors, Instructors & Cabins
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setFacultyOpen(false)}
                style={styles.modalCloseBtn}
              >
                <MaterialIcons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: "65vh" }} contentContainerStyle={{ padding: 20, gap: 12 }}>
              {facultyList.map((f, i) => (
                <View key={i} style={styles.facultyItem}>
                  <View style={styles.facultyLeft}>
                    <View style={[styles.facultyAvatar, { backgroundColor: f.bg }]}>
                      <Text style={[styles.facultyInitials, { color: f.text }]}>{f.initials}</Text>
                    </View>

                    <View style={styles.facultyInfo}>
                      <Text style={styles.facultyName}>{f.name}</Text>
                      <Text style={styles.facultyRole}>{f.designation} • {f.subject}</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
                        <MaterialIcons name="meeting-room" size={13} color="#64748b" />
                        <Text style={styles.facultyCabin}>{f.cabin}</Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.mailButton}
                    activeOpacity={0.7}
                    onPress={() => Linking.openURL(`mailto:${f.email}`)}
                    title={`Email ${f.name}`}
                  >
                    <MaterialIcons name="mail" size={16} color="#003fb1" />
                    <Text style={styles.mailButtonText}>Email</Text>
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
          <MaterialIcons name="check-circle" size={18} color="#ffffff" />
          <Text style={styles.toastMessage}>{toastText}</Text>
        </Animated.View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    paddingBottom: 48,
  },
  laptopContainer: {
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 20,
  },

  /* Top Breadcrumb Toolbar */
  topToolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  breadcrumbWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#e0e7ff",
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#003fb1",
  },
  breadcrumbDivider: {
    fontSize: 14,
    color: "#94a3b8",
  },
  breadcrumbCurrent: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  breadcrumbTag: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  topActionGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  viewSegmentWrap: {
    flexDirection: "row",
    backgroundColor: "#e2e8f0",
    padding: 3,
    borderRadius: 8,
    gap: 2,
  },
  segmentBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  segmentBtnActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentBtnText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#64748b",
  },
  segmentBtnTextActive: {
    color: "#003fb1",
    fontWeight: "700",
  },
  actionBtnSecondary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  actionBtnSecondaryText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#003fb1",
  },
  actionBtnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: "#003fb1",
    shadowColor: "#003fb1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtnPrimaryText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#ffffff",
  },

  /* Institutional Overview Header Card */
  overviewCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
    flexWrap: "wrap",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  overviewLeft: {
    flex: 1,
    minWidth: 320,
    gap: 6,
  },
  overviewBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  activePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#003fb1",
  },
  activePillText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#003fb1",
    letterSpacing: 0.5,
  },
  termTag: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.2,
  },
  overviewSubtitle: {
    fontSize: 13,
    color: "#475569",
  },
  overviewRight: {
    flexDirection: "row",
    gap: 12,
  },
  statMiniCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
    minWidth: 100,
  },
  statMiniVal: {
    fontSize: 16,
    fontWeight: "800",
    color: "#003fb1",
  },
  statMiniLbl: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },

  /* Laptop Two-Column Layout */
  laptopGrid: {
    flexDirection: "row",
    gap: 20,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  leftCol: {
    flex: 1,
    minWidth: 320,
    gap: 20,
  },
  rightCol: {
    flex: 2,
    minWidth: 460,
    gap: 20,
  },

  /* Live Class Card */
  liveCard: {
    backgroundColor: "#003fb1",
    borderRadius: 14,
    position: "relative",
    overflow: "hidden",
    shadowColor: "#003fb1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 3,
  },
  liveDecorCircleOne: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  liveDecorCircleTwo: {
    position: "absolute",
    bottom: -50,
    right: 80,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  liveCardContent: {
    padding: 20,
    gap: 10,
    position: "relative",
    zIndex: 2,
  },
  liveHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22c55e",
  },
  livePillText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  periodPill: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  periodPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },
  liveCourseName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.2,
  },
  liveCourseCode: {
    fontSize: 13,
    color: "#bfdbfe",
    fontWeight: "500",
  },
  liveDetailGrid: {
    gap: 6,
    marginTop: 4,
  },
  liveDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  liveDetailText: {
    fontSize: 13,
    color: "#e0e7ff",
  },
  liveActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  liveActionLight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ffffff",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  liveActionLightText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#003fb1",
  },
  liveActionGlass: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  liveActionGlassText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#ffffff",
  },

  /* Notice Card */
  noticeCard: {
    backgroundColor: "#fff7ed",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#fed7aa",
    padding: 18,
    gap: 10,
  },
  noticeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  noticeIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#ffedd5",
    alignItems: "center",
    justifyContent: "center",
  },
  noticeHeaderInfo: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#9a3412",
  },
  noticeSub: {
    fontSize: 11,
    color: "#c2410c",
  },
  substitutedTag: {
    backgroundColor: "#ea580c",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  substitutedTagText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  noticeBody: {
    fontSize: 12.5,
    color: "#7c2d12",
    lineHeight: 18,
  },
  boldText: {
    fontWeight: "700",
  },
  relocationPillRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  roomOldPill: {
    backgroundColor: "#ffedd5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roomOldText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#9a3412",
    textDecorationLine: "line-through",
  },
  roomNewPill: {
    backgroundColor: "#fed7aa",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roomNewText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#7c2d12",
  },
  effectiveDateText: {
    fontSize: 11,
    color: "#9a3412",
    fontStyle: "italic",
    marginLeft: "auto",
  },

  /* Tools Card */
  toolsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 20,
    gap: 12,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  toolsCardHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 2,
  },
  toolItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  toolIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  toolInfo: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  toolSub: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 1,
  },

  /* Right Column: Timeline Container */
  timelineContainerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 20,
    gap: 16,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  timelineHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 14,
    flexWrap: "wrap",
    gap: 8,
  },
  timelineMainTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
  },
  timelineSubTitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  progressCounterBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  progressCounterText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#166534",
  },
  periodList: {
    gap: 10,
  },
  periodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 14,
    gap: 14,
  },
  periodCardNow: {
    backgroundColor: "#eff6ff",
    borderColor: "#003fb1",
    borderWidth: 1.5,
    shadowColor: "#003fb1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  periodCardDone: {
    backgroundColor: "#f8fafc",
    opacity: 0.85,
  },
  periodTimeCol: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
  },
  periodNumber: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  periodTimeRange: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
    fontWeight: "500",
  },
  periodDividerLine: {
    width: 1,
    height: "80%",
    backgroundColor: "#e2e8f0",
  },
  periodInfoCol: {
    flex: 1,
    gap: 4,
  },
  periodTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  periodCourseTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#0f172a",
  },
  periodMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  metaBadgeCode: {
    fontSize: 11,
    fontWeight: "700",
    color: "#003fb1",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  metaBadgeType: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "500",
  },
  metaBullet: {
    fontSize: 12,
    color: "#cbd5e1",
  },
  metaRoomText: {
    fontSize: 11.5,
    color: "#475569",
    fontWeight: "500",
  },
  metaFacultyText: {
    fontSize: 11.5,
    color: "#475569",
    fontWeight: "500",
  },
  statusPillDone: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusPillDoneText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#166534",
  },
  statusPillNow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#dbeafe",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pulsingSmallDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#003fb1",
  },
  statusPillNowText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#003fb1",
  },
  statusPillNext: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusPillNextText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#475569",
  },
  statusPillLab: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusPillLabText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#92400e",
  },
  statusPillSched: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusPillSchedText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748b",
  },
  noteBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#eff6ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 2,
  },
  noteBannerText: {
    fontSize: 11,
    color: "#003fb1",
    fontWeight: "500",
  },

  /* Break Row */
  breakRowCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
  },
  breakIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  breakTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },
  breakTime: {
    fontSize: 11,
    color: "#64748b",
  },
  recessBadge: {
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  recessBadgeText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#475569",
    letterSpacing: 0.5,
  },

  /* Weekly View */
  weeklyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 20,
    gap: 16,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  weeklyHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 14,
  },
  weeklyMainTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  weeklySubTitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flexWrap: "wrap",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendBox: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 1,
  },
  legendLabel: {
    fontSize: 11.5,
    color: "#475569",
    fontWeight: "500",
  },
  tableCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },
  matrixTable: {
    minWidth: 960,
  },
  matrixHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  matrixHeaderCell: {
    flex: 1,
    minWidth: 160,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
  },
  matrixTimeHeaderCell: {
    flex: 0.8,
    minWidth: 130,
    backgroundColor: "#f1f5f9",
  },
  matrixHeaderCellToday: {
    backgroundColor: "#eff6ff",
    borderTopWidth: 2,
    borderTopColor: "#003fb1",
  },
  matrixHeaderCellText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#475569",
    letterSpacing: 0.5,
  },
  todayPillBadge: {
    backgroundColor: "#003fb1",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  todayPillBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#ffffff",
  },
  matrixBodyRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  matrixCell: {
    flex: 1,
    minWidth: 160,
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: "#f1f5f9",
    gap: 4,
    justifyContent: "center",
  },
  matrixTimeCell: {
    flex: 0.8,
    minWidth: 130,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    borderRightColor: "#e2e8f0",
  },
  matrixTimeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  labDurationBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 4,
  },
  labDurationBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#92400e",
  },
  matrixCellTheory: {
    backgroundColor: "#ffffff",
  },
  matrixCellLab: {
    backgroundColor: "rgba(254, 243, 199, 0.4)",
  },
  matrixCellTodayHighlight: {
    backgroundColor: "rgba(219, 234, 254, 0.35)",
  },
  cellTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cellCodeText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#003fb1",
  },
  cellRoomText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748b",
  },
  cellSubTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 16,
  },
  cellTeacherRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  cellTeacherText: {
    fontSize: 10.5,
    color: "#475569",
    fontWeight: "500",
  },
  matrixBreakRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#f8fafc",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  matrixBreakText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#475569",
    letterSpacing: 0.3,
  },

  /* Faculty Modal Dialog */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalDialog: {
    width: "100%",
    maxWidth: 580,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  modalHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  modalSubheading: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  facultyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 12,
  },
  facultyLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  facultyAvatar: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  facultyInitials: {
    fontSize: 15,
    fontWeight: "700",
  },
  facultyInfo: {
    flex: 1,
  },
  facultyName: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0f172a",
  },
  facultyRole: {
    fontSize: 12,
    color: "#475569",
    marginTop: 1,
  },
  facultyCabin: {
    fontSize: 11,
    color: "#64748b",
  },
  mailButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  mailButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#003fb1",
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    alignItems: "flex-end",
    backgroundColor: "#f8fafc",
  },
  closeModalButton: {
    backgroundColor: "#003fb1",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  closeModalButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ffffff",
  },

  /* Toast Notification */
  toastContainer: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    backgroundColor: "#0f172a",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 9999,
  },
  toastMessage: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ffffff",
  },
});
