import React, { useState, useMemo, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Linking,
  StatusBar,
  Platform,
  Share,
  Modal,
  Dimensions,
  useWindowDimensions,
  Alert,
} from '@/ui';

import { MaterialIcons } from '@/ui';
import { BlurView } from '@/ui';
import { LinearGradient } from '@/ui';


const COLORS = {
  primaryFixed: "#dbe1ff",
  onSurfaceVariant: "#434654",
  tertiaryFixed: "#ffdbcf",
  onTertiary: "#ffffff",
  onSecondaryContainer: "#5e6572",
  tertiaryFixedDim: "#ffb59a",
  onSurface: "#191b23",
  onTertiaryContainer: "#ffd4c5",
  surfaceContainerLow: "#f3f3fe",
  primary: "#003fb1",
  onTertiaryFixed: "#380d00",
  secondary: "#585f6c",
  onPrimaryFixed: "#00174d",
  surfaceContainerHigh: "#e7e7f3",
  inverseOnSurface: "#f0f0fb",
  error: "#ba1a1a",
  primaryFixedDim: "#b5c4ff",
  tertiary: "#852b00",
  onBackground: "#191b23",
  surfaceContainerLowest: "#ffffff",
  tertiaryContainer: "#ad3b00",
  secondaryFixedDim: "#c0c7d6",
  surfaceContainerHighest: "#e2e1ed",
  inversePrimary: "#b5c4ff",
  onErrorContainer: "#93000a",
  surface: "#faf8ff",
  onSecondaryFixed: "#151c27",
  surfaceVariant: "#e2e1ed",
  secondaryFixed: "#dce2f3",
  surfaceContainer: "#ededf8",
  outlineVariant: "#c3c5d7",
  onError: "#ffffff",
  onPrimaryFixedVariant: "#003dab",
  outline: "#737686",
  onTertiaryFixedVariant: "#802a00",
  onPrimary: "#b5c4ff",
  onSecondary: "#ffffff",
  onPrimaryContainer: "#d4dcff",
  surfaceTint: "#1353d8",
  onSecondaryFixedVariant: "#404754",
  surfaceDim: "#d9d9e4",
  background: "#faf8ff",
  inverseSurface: "#2e3039",
  primaryContainer: "#1a56db",
  surfaceBright: "#faf8ff",
  errorContainer: "#ffdad6",
  secondaryContainer: "#dce2f3",
};

const LOGO_URL = "/info_logo.png";

const ABOUT_HERO_LOGO = "/info_logo.png";

const CAMPUS_BANNER =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB2w7F-xb43eaugvpQiI9wgTD_G0iNKVI60BRaM6CsvUWyEhADP7A-n43uappZPvz87jIEfCd-r8NRL5IB5OAJJ93UA_G5wDqLc_lx-26Obi7d0tnJOl8zyS_ZDm04PJURwPIjmLNAbZ2F1LkMEHV-uwQRsu66d4xmDHMoVtWE641-VccdTPVkIqOWBzrD0cQt--3y_8DgQ9jTx-IHSVjcMNGyNCbdUBhiAfxu4gNs35qmbZbGLfmB3";

const COLLEGE_CREST = "/info_logo.png";

const QFIX_LOGO =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCx6E3-GQ8z-16S2X4wAfJG5rljnzMl1XATUZWc688SYv98QXGEGTsoaEAq16QM3QrOz0KFxVihkSwFcID1QG2pEJi1q7O9TWouexXI6uqLKptQF0rMyoRnJzk1fk2sTrx2AqYhIN3ar6ZVar92pc7F5iJKsmcaDbE7jICTfcvTt8MVWJ1CReuOOi784VBSBVVycX0nqpPe7AZNltojurAJHGoMii5kL-y1_nIKuDGJr4-ow2ZE4_RzahCzK7Ki4UIo5w";

import TIMETABLE_IMAGE from '@/assets/timetable-3yr.jpeg';
import KAMESH_IMAGE from '@/assets/kamesh-n.png';
import CHRIST_NOBLE_IMAGE from '@/assets/christ-noble-s.png';
import ABISHEK_RK_IMAGE from '@/assets/abishek-rk.png';

const COLLEGE_BADGE = "/info_logo.png";

const ACHIEVEMENT_IMAGES = {
  hackathon:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCBYlGepkcaccZMtLW2-tdsOaQkO5QOvVAxvGhHgdRrJ7qz8wILJOm01Q7L0KSvYKppyH0y7k8yNaqN9CGh1pzS5FsHOOO3t_NpyszkZaamvSMfU4f28vs28X79TlvDDoiqq9Hy5YuYPWkAkAYU9xWc5NvwQNDR315CMtS7YDiKH2nAOqoSM0wOIPBJ64QfwPnbJQXM2XgpemMAOYt3vvCm2JYSb-APMUeb4QOoYNk6mK2PLi4-mN6X",

  placement:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBFXhsVIpH9bKzC2SDt8tRYIIB1b2LXNMerku4bg3ZktYomkP_mBO23dOcdB4P4vXlICvxU0FihNc1fVjUENynfteEhnKqAl46aEhfWcVdkEkTBuGqnoCXkFYA6rmsEhp3VZRyHrQbqpUFHSW3ALSc5PC1oIxKfF5PFwYLOOb6GjsFjZ6RqiyIoGri6d2dsZh3Ksh2X9sG5Hsmn4sViccPs0wZTy_eUmd0Db82oB49_6KC__SLLyQth",

  research:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBwia7oJLHJNavqWPkKzbHlgcR7ZeuXB0PPHE4HgECAbqm_9HXG2eXjMYkWue2jq9NrJ2I8Ek3hxM5Ms1CI_gH2GFCACA9vVGOHp32P62FwawiT6DgoswPLS-gaYhOgtAiQH8mCa_EFLSLiR6WYEjRLhS-EK05Wf7mpw5IwZ95BvjLWStJ16VOI5hsrPcJmFauqJ6YjVgKNtRsOKIVNWeF9EdG48Gdq2Fw_ZcuhGGceHQnypgPEXcDC",

  patent:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB2XcgoR0eySDyAivvOLIol_YNAB6AIxRrqA9OzQfbpRFFeRXm3ntrdCfP1wIAQ4QUPLWeXmNIbnYGQG0_SjnqNNhjUX-ab6yzuREqjb65f2dYTg1mD51BLmjwJY0GEaxg0fk2yKPxqw3HIVSepm6f8EckyoxaFyzrH34XnSpuF1Lim7sl_dE_vA9rNezUtUPT2hd3nJE5NQ-trZIYYLF6ypi7PCffyHeTs-OuaAsC3LLKIHTlZAqRE",
};

const ESAKKI_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBw_x1_sYEtiZvL9LEuy85afPQcK7Ro9P_6Ugk1BWEdBnb1bLTyCMYFLPTa5QMK13id2DCnUfxQJdzM14f_Tg7JNCewgYZAdo4FH0E68z0A8Y2lx0T6TSn6q3PqSiO0B6gLuwSaTekJEiXTCbD4UEIlR-JYMqv7n-pV7tZZ8KCp39WsWUdv69NI60bhhL6FvzSQ3_FaDjdz01sXtln4PrPV-U2LOJAOImv6NYKOPph6l7xndsj4LLEbDRIi2gRAnMd5JA";

const PRAKASH_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAVWzdjy1esZbSP1pskYsTDxJgmtFIKgkg3tAGnITtGmcGOHM0WpAR86TbmJUQ1QpQ6FESJoN2qAXiNyGuB76z1wkAt-e3OOAvVIMVLWYS7Wm7jLZsp0VtMNHv_Pelm0pFq-_idZ60eYFVOIvTKBWS3_sVD9YrzUn-jwz6fRKevHieh_IKcztzIgcw8IJ0wowVbNNMSzad8LXpwOFwhGOWZsOdiO9AO9J59UtlVyIk3tDDPBl9fPoLcKSKSZ2wuK3iOOw";

// ---------------------------------------------------------
// DATA: ACHIEVEMENTS
// ---------------------------------------------------------

const achievements = [
  {
    id: 1,
    category: "hackathons",
    icon: "emoji-events",
    iconBg: COLORS.tertiaryFixed,
    iconColor: COLORS.onTertiaryFixed,
    badge: "National Champion",
    badgeBg: COLORS.tertiaryFixedDim,
    badgeColor: COLORS.onTertiaryFixed,
    prize: "1st Prize ₹1,00,000",
    prizeColor: COLORS.tertiary,
    title: "Smart India Hackathon 2024 Winners",
    image: ACHIEVEMENT_IMAGES.hackathon,
    imageIcon: "memory",
    imageLabel: "Autonomous Agrotech Drone",
    description:
      "Developed by the Department of Artificial Intelligence & Data Science team. The system autonomously maps crop health, detects localized infestations, and deploys organic pest deterrents in real time with 98.4% edge inference accuracy.",
    footerIcon: "groups",
    footerColor: COLORS.primary,
    footerText: "AI & DS Dept • Cohort 2024",
    buttonText: "Case Study",
  },
  {
    id: 2,
    category: "placements",
    icon: "corporate-fare",
    iconBg: COLORS.primaryFixed,
    iconColor: COLORS.primary,
    badge: "Placement Milestone",
    badgeBg: COLORS.primaryFixedDim,
    badgeColor: COLORS.onPrimaryFixed,
    prize: "₹24.5 LPA",
    prizeColor: COLORS.primary,
    title: "Highest CTC Placement 2024-25",
    image: ACHIEVEMENT_IMAGES.placement,
    imageIcon: "cloud-done",
    imageLabel: "Amazon AWS • Cloud Engineer",
    description:
      "Final-year B.Tech Computer Science & Engineering scholar secured a marquee package at Amazon Web Services (AWS) after clearing three rounds of rigorous cloud infrastructure, distributed systems, and algorithmic challenges.",
    footerIcon: "verified",
    footerColor: COLORS.secondary,
    footerText: "Info IT Career Development Cell",
    buttonText: "Student Interview",
  },
  {
    id: 3,
    category: "research",
    icon: "account-balance",
    iconBg: COLORS.surfaceContainerHigh,
    iconColor: COLORS.primary,
    badge: "State Honor",
    badgeBg: COLORS.secondaryContainer,
    badgeColor: COLORS.onSecondaryContainer,
    prize: "TNHED Council",
    prizeColor: COLORS.secondary,
    title: "Best Autonomous Engineering College",
    image: ACHIEVEMENT_IMAGES.research,
    imageIcon: "school",
    imageLabel: "Ranked #1 for Curriculum Innovation",
    description:
      "Conferred by the Tamil Nadu Higher Education Council in recognition of Info Institute of Technology's pioneering NEP-aligned curriculum, industry co-designed electives, and exceptional graduate employability metrics across Coimbatore region.",
    footerIcon: "verified-user",
    footerColor: COLORS.secondary,
    footerText: "State Education Review Board",
    buttonText: "Read Citation",
  },
  {
    id: 4,
    category: "research",
    icon: "biotech",
    iconBg: COLORS.tertiaryFixed,
    iconColor: COLORS.tertiary,
    badge: "Intellectual Property",
    badgeBg: COLORS.tertiaryFixedDim,
    badgeColor: COLORS.onTertiaryFixed,
    prize: "Indian Patent Office",
    prizeColor: COLORS.tertiary,
    title: "Patents Filed: Edge AI Diagnostics",
    image: ACHIEVEMENT_IMAGES.patent,
    imageIcon: "local-hospital",
    imageLabel: "Patent App No. 202441098271",
    description:
      "Lead Investigator Dr. Sarah Williams alongside the Student Research Cohort filed dual patents on wearable low-latency Edge AI modules for immediate arrhythmia prediction and non-invasive pulmonary biomarker analysis.",
    footerIcon: "person",
    footerColor: COLORS.primary,
    footerText: "Dr. Sarah Williams • R&D Wing",
    buttonText: "Patent Dossier",
  },
];

const achievementFilters = [
  { id: "all", label: "All Laurels", icon: "stars" },
  { id: "hackathons", label: "Hackathons & AI", icon: "code" },
  { id: "research", label: "Research & Patents", icon: "science" },
  { id: "placements", label: "Placements", icon: "apartment" },
  { id: "sports", label: "Sports & Culturals", icon: "sports-tennis" },
];

// ---------------------------------------------------------
// DATA: CIRCULARS
// ---------------------------------------------------------

const circulars = [
  {
    category: "coe",
    ref: "CIR/INFO/2024-25/089",
    title: "Revaluation & Paper Viewing Window - June/July Session",
    department: "Controller of Examinations",
    date: "18 Oct 2024",
    tag: "Autonomous",
    badge: "CoE",
    badgeType: "blue",
    heading:
      "Revaluation & Answer Script Verification Window for UG Sem II & IV",
    description:
      "Candidates interested in script xerox copies and subsequent revaluation are requested to register through their student portal before October 26, 2024. Nominal fee of ₹400 per course applies.",
    footerIcon: "verified",
    footer: "Signed by Dr. K. Ramanathan",
  },
  {
    category: "placement",
    ref: "T&P/2024-25/042",
    title: "Campus Placement Drive by HexaCorp Tech Solutions",
    department: "Training & Placement Cell",
    date: "17 Oct 2024",
    tag: "Eligible: CSE/ECE/IT",
    badge: "T&P",
    badgeType: "gray",
    heading:
      "Campus Recruitment Drive 2025 Batch: HexaCorp Solutions (CTC 9.5 LPA)",
    description:
      "Online technical assessment will be conducted at Campus Lab 4 & 5 on Saturday, Oct 21. Students with minimum CGPA 7.5 and no standing arrears must report in formal dress code by 8:30 AM.",
    footerIcon: "apartment",
    footer: "Venue: Seminar Hall III",
  },
  {
    category: "academic",
    ref: "ACAD/REG/2024/118",
    title: "Internal Assessment II Schedule & Syllabus Coverage",
    department: "Office of Academic Affairs",
    date: "15 Oct 2024",
    tag: "Dean Academics",
    badge: "ACD",
    badgeType: "blueDim",
    heading:
      "Schedule for Continuous Internal Assessment Test (CIA-II)",
    description:
      "CIA-II for all higher semester UG & PG programmes will commence from November 4, 2024. Question paper pattern follows Bloom's Taxonomy Level 3 & 4. Portions include Units III & IV.",
    footerIcon: "verified",
    footer: "Approved by Principal",
  },
  {
    category: "events",
    ref: "CIR/ADM/GEN/2024/097",
    title: "Diwali Holidays and Hostel Dispersal Advisory",
    department: "Administrative Office",
    date: "12 Oct 2024",
    tag: "All Campuses",
    badge: "ADM",
    badgeType: "orange",
    heading:
      "Diwali Festival Vacation & Hostel Vacation Guidelines",
    description:
      "The college will remain closed for students and faculty from October 30 to November 3, 2024, on account of Deepavali. Hostel residents must register their outpass biometric by Oct 29 noon.",
    footerIcon: "celebration",
    footer: "Hostel Gate Closes: 6:00 PM",
  },
];

const filters = [
  { label: "All", value: "all" },
  { label: "CoE", value: "coe" },
  { label: "Placement", value: "placement" },
  { label: "Academic", value: "academic" },
  { label: "Events", value: "events" },
];

// ---------------------------------------------------------
// DATA: CALENDAR
// ---------------------------------------------------------

const monthConfigs = {
  jan: {
    name: "January 2025",
    workDays: "20 Work Days",
    days: [
      ["30", "outside"],
      ["31", "outside"],
      ["1", "holiday"],
      ["2", "normal"],
      ["3", "normal"],
      ["4", "sat"],
      ["5", "sun"],
      ["6", "normal"],
      ["7", "normal"],
      ["8", "normal"],
      ["9", "normal"],
      ["10", "normal"],
      ["11", "sat"],
      ["12", "sun"],
      ["13", "holiday"],
      ["14", "holiday"],
      ["15", "holiday"],
      ["16", "normal"],
      ["17", "normal"],
      ["18", "sat"],
      ["19", "sun"],
      ["20", "normal"],
      ["21", "normal"],
      ["22", "normal"],
      ["23", "normal"],
      ["24", "normal"],
      ["25", "sat"],
      ["26", "holiday"],
      ["27", "normal"],
      ["28", "normal"],
      ["29", "normal"],
      ["30", "normal"],
      ["31", "normal"],
      ["1", "outside"],
      ["2", "outside"],
    ],
  },
  feb: {
    name: "February 2025",
    workDays: "20 Work Days",
    days: [
      ["27", "outside"],
      ["28", "outside"],
      ["29", "outside"],
      ["30", "outside"],
      ["31", "outside"],
      ["1", "sat"],
      ["2", "sun"],
      ["3", "normal"],
      ["4", "normal"],
      ["5", "normal"],
      ["6", "normal"],
      ["7", "normal"],
      ["8", "sat"],
      ["9", "sun"],
      ["10", "exam"],
      ["11", "exam"],
      ["12", "exam"],
      ["13", "exam"],
      ["14", "exam"],
      ["15", "exam"],
      ["16", "sun"],
      ["17", "normal"],
      ["18", "normal"],
      ["19", "normal"],
      ["20", "normal"],
      ["21", "normal"],
      ["22", "sat"],
      ["23", "sun"],
      ["24", "normal"],
      ["25", "normal"],
      ["26", "exam"],
      ["27", "normal"],
      ["28", "normal"],
      ["1", "outside"],
      ["2", "outside"],
    ],
  },
  mar: {
    name: "March 2025",
    workDays: "22 Work Days",
    days: [
      ["24", "outside"],
      ["25", "outside"],
      ["26", "outside"],
      ["27", "outside"],
      ["28", "outside"],
      ["1", "sat"],
      ["2", "sun"],
      ["3", "normal"],
      ["4", "normal"],
      ["5", "normal"],
      ["6", "normal"],
      ["7", "normal"],
      ["8", "sat"],
      ["9", "sun"],
      ["10", "normal"],
      ["11", "normal"],
      ["12", "normal"],
      ["13", "normal"],
      ["14", "normal"],
      ["15", "sat"],
      ["16", "sun"],
      ["17", "normal"],
      ["18", "normal"],
      ["19", "normal"],
      ["20", "normal"],
      ["21", "normal"],
      ["22", "sat"],
      ["23", "sun"],
      ["24", "today"],
      ["25", "normal"],
      ["26", "normal"],
      ["27", "exam"],
      ["28", "event"],
      ["29", "event"],
      ["30", "sun"],
      ["31", "special"],
      ["1", "outside"],
      ["2", "outside"],
      ["3", "outside"],
      ["4", "outside"],
      ["5", "outside"],
      ["6", "outside"],
    ],
  },
  apr: {
    name: "April 2025",
    workDays: "22 Work Days",
    days: [
      ["31", "outside"],
      ["1", "normal"],
      ["2", "normal"],
      ["3", "normal"],
      ["4", "normal"],
      ["5", "sat"],
      ["6", "sun"],
      ["7", "exam"],
      ["8", "exam"],
      ["9", "exam"],
      ["10", "exam"],
      ["11", "exam"],
      ["12", "exam"],
      ["13", "sun"],
      ["14", "holiday"],
      ["15", "normal"],
      ["16", "normal"],
      ["17", "normal"],
      ["18", "holiday"],
      ["19", "sat"],
      ["20", "sun"],
      ["21", "normal"],
      ["22", "normal"],
      ["23", "normal"],
      ["24", "normal"],
      ["25", "normal"],
      ["26", "sat"],
      ["27", "sun"],
      ["28", "normal"],
      ["29", "normal"],
      ["30", "today"],
      ["1", "outside"],
      ["2", "outside"],
      ["3", "outside"],
      ["4", "outside"],
    ],
  },
  may: {
    name: "May 2025",
    workDays: "16 Exam Days",
    days: [
      ["28", "outside"],
      ["29", "outside"],
      ["30", "outside"],
      ["1", "holiday"],
      ["2", "normal"],
      ["3", "sat"],
      ["4", "sun"],
      ["5", "exam"],
      ["6", "exam"],
      ["7", "exam"],
      ["8", "exam"],
      ["9", "exam"],
      ["10", "sat"],
      ["11", "sun"],
      ["12", "normal"],
      ["13", "normal"],
      ["14", "normal"],
      ["15", "normal"],
      ["16", "normal"],
      ["17", "sat"],
      ["18", "sun"],
      ["19", "finalExam"],
      ["20", "finalExam"],
      ["21", "finalExam"],
      ["22", "finalExam"],
      ["23", "finalExam"],
      ["24", "sat"],
      ["25", "sun"],
      ["26", "finalExam"],
      ["27", "finalExam"],
      ["28", "finalExam"],
      ["29", "finalExam"],
      ["30", "finalExam"],
      ["31", "outside"],
      ["1", "outside"],
    ],
  },
};

const HUB_NAV_ITEMS = [
  { key: "portal", label: "Overview", icon: "grid-view", isInternal: true },
  { key: "circulars", label: "Circulars", icon: "campaign", isInternal: true },
  { key: "calendar", label: "Calendar", icon: "calendar-month", isInternal: true },
  { key: "more", label: "Laurels & Wins", icon: "emoji-events", isInternal: true },
];

export default function CommonPortal({ route, navigation }) {
  const [activeScreen, setActiveScreen] = useState("portal");

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={activeScreen === "portal" ? "light-content" : "dark-content"}
        backgroundColor={activeScreen === "portal" ? "#0a142d" : COLORS.surface}
      />

      {/* ================= HEADER ================= */}
      <View style={[styles.headerWrapper, activeScreen === "portal" && styles.headerWrapperPortal]}>
        <BlurView
          intensity={activeScreen === "portal" ? 60 : 80}
          tint={activeScreen === "portal" ? "dark" : "light"}
          style={[
            styles.headerBlur,
            activeScreen === "portal" && styles.headerBlurPortal
          ]}
        >
          <View style={[styles.header, styles.hubHeader]}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                style={[
                  styles.headerBackBtn,
                  activeScreen === "portal" && styles.headerBackBtnPortal
                ]}
                onPress={() => {
                  if (navigation && navigation.canGoBack()) {
                    navigation.goBack();
                  } else if (navigation) {
                    navigation.navigate('Login');
                  }
                }}
                activeOpacity={0.7}
                title="Go back"
              >
                <MaterialIcons name="arrow-back" size={20} color={activeScreen === "portal" ? "#ffffff" : COLORS.primary} />
              </TouchableOpacity>
              <View style={[styles.logoCircle, activeScreen === "portal" && styles.logoCirclePortal]}>
                <Image
                  source={{ uri: "/info_logo.png" }}
                  style={styles.headerLogo}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.headerTextContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[styles.nexusText, activeScreen === "portal" && styles.nexusTextPortal]}>NEXUS</Text>
                  <View style={[styles.hubBadge, activeScreen === "portal" && styles.hubBadgePortal]}>
                    <Text style={[styles.hubBadgeText, activeScreen === "portal" && styles.hubBadgeTextPortal]}>Info IT</Text>
                  </View>
                </View>

                <Text
                  style={[styles.collegeText, activeScreen === "portal" && styles.collegeTextPortal]}
                  numberOfLines={1}
                >
                  CAMPUS HUB
                </Text>
              </View>
            </View>

            {/* Center: Navigation Pills (Matching the Student Header design) */}
            <nav className="hub-header-nav" aria-label="Campus hub header navigation">
              {HUB_NAV_ITEMS.map((item) => {
                const isActive = item.isInternal && activeScreen === item.key;
                const isDark = activeScreen === 'portal';
                return (
                  <button
                    key={item.key}
                    type="button"
                    className={`hub-nav-btn${isActive ? ' active' : ''}${isDark ? ' dark-mode' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => {
                      if (item.isInternal) {
                        setActiveScreen(item.key);
                      } else if (item.screen) {
                        navigation?.navigate(item.screen);
                      }
                    }}
                  >
                    <MaterialIcons
                      name={item.icon}
                      size={18}
                      color={
                        isActive
                          ? (isDark ? '#ffffff' : '#003fb1')
                          : (isDark ? 'rgba(255,255,255,0.85)' : '#475569')
                      }
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right: Login button */}
            <div className="hub-header-right">
              <button
                type="button"
                className={`hub-header-login-btn${activeScreen === 'portal' ? ' dark-mode' : ''}`}
                onClick={() => navigation?.navigate('Login')}
                title="Login to Institutional Portals"
              >
                <MaterialIcons name="login" size={18} />
                <span className="hub-login-text">Login</span>
              </button>
            </div>
          </View>
        </BlurView>
      </View>

      {/* ================= BODY SCREEN CONTENT ================= */}
      {activeScreen === "portal" && <PortalScreen navigation={navigation} />}
      {activeScreen === "circulars" && <CircularsScreen />}
      {activeScreen === "calendar" && <CalendarScreen />}
      {activeScreen === "more" && <MoreScreen />}

      {/* ================= BOTTOM NAV ================= */}
      <View className="bottom-nav-wrapper-hub" style={[styles.bottomNavWrapper, activeScreen === "portal" && styles.bottomNavWrapperPortal]}>
        <BlurView
          intensity={activeScreen === "portal" ? 60 : 85}
          tint={activeScreen === "portal" ? "dark" : "light"}
          style={[
            styles.bottomBlur,
            activeScreen === "portal" && styles.bottomBlurPortal
          ]}
        >
          <View style={styles.bottomNav}>
            <BottomNavItem
              icon="dashboard"
              label="Portal"
              active={activeScreen === "portal"}
              onPress={() => setActiveScreen("portal")}
              isDarkPortal={activeScreen === "portal"}
            />

            <BottomNavItem
              icon="campaign"
              label="Circulars"
              active={activeScreen === "circulars"}
              onPress={() => setActiveScreen("circulars")}
              isDarkPortal={activeScreen === "portal"}
            />

            <BottomNavItem
              icon="calendar-month"
              label="Calendar"
              active={activeScreen === "calendar"}
              onPress={() => setActiveScreen("calendar")}
              isDarkPortal={activeScreen === "portal"}
            />

            <BottomNavItem
              icon="more-horiz"
              label="More"
              active={activeScreen === "more"}
              onPress={() => setActiveScreen("more")}
              isDarkPortal={activeScreen === "portal"}
            />
          </View>
        </BlurView>
      </View>
    </SafeAreaView>
  );
}

/* =========================================================
   PORTAL SCREEN - FULL-SCREEN CAMPUS HERO SLIDESHOW
========================================================= */

const CAMPUS_SLIDES = [
  {
    image: "/assets/campus/info_campus_main.jpg",
    title: "Main Academic Campus Block",
    subtitle: "State-of-the-art engineering blocks & research facilities",
  },
  {
    image: "/assets/campus/college.jpg",
    title: "Campus Front Promenade",
    subtitle: "Lush green modern university campus",
  },
  {
    image: "/assets/campus/info_campus_library.jpg",
    title: "Central Digital Library",
    subtitle: "High-tech learning center with expansive digital repositories",
  },
  {
    image: "/assets/campus/main_campus.jpg",
    title: "Main Academic Complex",
    subtitle: "Advanced learning halls and seminar theaters",
  },
  {
    image: "/assets/campus/info_campus_labs.jpg",
    title: "Advanced AI & Robotics Labs",
    subtitle: "Modern laboratories with industry-standard testbeds",
  },
  {
    image: "/assets/campus/top_view.jpg",
    title: "Campus Panorama",
    subtitle: "Eco-friendly campus sprawling across world-class infrastructure",
  },
];

function PortalScreen({ navigation }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto slide transitions every 5.5s
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAMPUS_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        setCurrentSlide((prev) => (prev === 0 ? CAMPUS_SLIDES.length - 1 : prev - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentSlide((prev) => (prev + 1) % CAMPUS_SLIDES.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? CAMPUS_SLIDES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % CAMPUS_SLIDES.length);
  };

  const openWebsite = async () => {
    await Linking.openURL("http://www.infoengg.com/");
  };

  const openQfix = async () => {
    await Linking.openURL("https://www.eduqfix.com/PayDirect/#/student");
  };

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ================= FULL-SCREEN CAMPUS HERO SLIDESHOW ================= */}
      <div
        className="campus-hero-container"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Slides */}
        {CAMPUS_SLIDES.map((slide, index) => (
          <div
            key={slide.image}
            className={`campus-hero-slide ${index === currentSlide ? "active" : ""}`}
            style={{
              backgroundImage: `url(${slide.image})`,
            }}
            aria-hidden={index !== currentSlide}
          />
        ))}

        {/* Dark Transparent Gradient Overlay */}
        <div className="campus-hero-overlay" />

        {/* Live System Indicator Badge */}
        <div className="campus-hero-live-badge">
          <span className="campus-live-dot" />
          <span>Live System</span>
        </div>

        {/* Main Welcome Content */}
        <div className="campus-hero-content">
          {/* Welcome Label with Logo */}
          <div className="campus-welcome-label">
            <div className="campus-crest-badge">
              <img
                src="/info_logo.png"
                alt="Info Institute of Technology"
              />
            </div>
            <span className="campus-welcome-text">
              Welcome to Info Institute of Technology
            </span>
          </div>

          {/* Large Main Heading */}
          <h1 className="campus-main-heading">
            {"Welcome to\nOur Campus"}
          </h1>

          {/* Action Buttons Row: Qfix & Institutional Website side-by-side */}
          <div className="campus-hero-buttons-row">
            {/* Button 1: Qfix */}
            <button
              type="button"
              className="campus-btn-qfix"
              onClick={openQfix}
              aria-label="Open Direct Qfix Portal Checkout"
            >
              <MaterialIcons name="bolt" size={20} color="#ffffff" />
              <span>Qfix Portal</span>
            </button>

            {/* Button 2: Institutional Website */}
            <button
              type="button"
              className="campus-btn-website"
              onClick={openWebsite}
              aria-label="Visit Institutional Website"
            >
              <MaterialIcons name="public" size={20} color="#00897b" />
              <span>Institutional Website</span>
            </button>
          </div>
        </div>

        {/* Left & Right Slideshow Arrow Controls */}
        <button
          type="button"
          className="campus-slide-arrow prev"
          onClick={prevSlide}
          aria-label="Previous slide"
        >
          <MaterialIcons name="chevron-left" size={32} color="#ffffff" />
        </button>

        <button
          type="button"
          className="campus-slide-arrow next"
          onClick={nextSlide}
          aria-label="Next slide"
        >
          <MaterialIcons name="chevron-right" size={32} color="#ffffff" />
        </button>

        {/* Bottom Slide Indicators */}
        <div className="campus-slide-indicators">
          {CAMPUS_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`campus-indicator-dot ${i === currentSlide ? "active" : ""}`}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CIRCULARS SCREEN
========================================================= */

function CircularsScreen() {
  const [search, setSearch] = useState("");
  const [currentFilter, setCurrentFilter] = useState("all");

  const filteredCirculars = useMemo(() => {
    const term = search.toLowerCase().trim();

    return circulars.filter((item) => {
      const matchesCategory =
        currentFilter === "all" || item.category === currentFilter;

      const searchableText = `
        ${item.title}
        ${item.ref}
        ${item.department}
        ${item.heading}
        ${item.description}
        ${item.footer}
        ${item.date}
        ${item.tag}
      `.toLowerCase();

      const matchesSearch =
        !term || searchableText.includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [search, currentFilter]);

  const resetFilters = () => {
    setSearch("");
    setCurrentFilter("all");
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.main}>

        {/* ================= SEARCH BAR ================= */}
        <View style={styles.searchContainer}>
          <MaterialIcons
            name="search"
            size={22}
            color={COLORS.outline}
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search circulars, reference number..."
            placeholderTextColor={COLORS.outline}
            style={styles.searchInput}
          />

          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch("")}
              style={styles.clearButton}
            >
              <MaterialIcons
                name="close"
                size={20}
                color={COLORS.onSurfaceVariant}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* ================= FILTER CHIPS ================= */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {filters.map((filter) => {
            const active = currentFilter === filter.value;

            return (
              <TouchableOpacity
                key={filter.value}
                onPress={() => setCurrentFilter(filter.value)}
                activeOpacity={0.8}
                style={[
                  styles.filterChip,
                  active
                    ? styles.activeFilter
                    : styles.inactiveFilter,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    active
                      ? styles.activeFilterText
                      : styles.inactiveFilterText,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ================= URGENT NOTICE ================= */}
        <View style={styles.urgentCard}>
          <View style={styles.urgentTop}>
            <View style={styles.urgentLeft}>
              <View style={styles.urgentBadge}>
                <MaterialIcons
                  name="push-pin"
                  size={14}
                  color={COLORS.onTertiaryFixed}
                />

                <Text style={styles.urgentBadgeText}>
                  Urgent Notice
                </Text>
              </View>

              <Text style={styles.controllerText}>
                Controller of Examinations
              </Text>
            </View>
          </View>

          <View style={styles.noticeContent}>
            <Text style={styles.noticeTitle}>
              Autonomous End-Semester Practical & Theory Examination
              Schedule Nov/Dec 2024
            </Text>

            <Text style={styles.noticeDescription}>
              Timetable released for B.E/B.Tech (Sem III, V, VII) and M.E
              programs under Autonomous Curriculum 2022 Regulation. Hall
              tickets available on portal from Nov 20.
            </Text>
          </View>

          <Text style={styles.reference}>
            Ref: COE/AUT/2024-25/112
          </Text>
        </View>

        {/* ================= RECENT GAZETTES ================= */}
        <View style={styles.gazetteHeader}>
          <Text style={styles.gazetteTitle}>
            Recent Gazettes
          </Text>

          <View style={styles.verifiedStatus}>
            <View style={styles.blueDot} />

            <Text style={styles.verifiedText}>
              Autonomous Cell Verified
            </Text>
          </View>
        </View>

        {/* ================= CIRCULARS ================= */}
        <View style={styles.circularList}>
          {filteredCirculars.map((item, index) => (
            <CircularCard
              key={index}
              item={item}
            />
          ))}
        </View>

        {/* ================= NO RESULTS ================= */}
        {filteredCirculars.length === 0 && (
          <View style={styles.noResults}>
            <View style={styles.folderIcon}>
              <MaterialIcons
                name="folder-off"
                size={32}
                color={COLORS.outline}
              />
            </View>

            <Text style={styles.noResultsTitle}>
              No Matching Circulars
            </Text>

            <Text style={styles.noResultsDescription}>
              We couldn't find any notices matching your query. Check
              reference number or clear filters.
            </Text>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetFilters}
              activeOpacity={0.8}
            >
              <Text style={styles.resetText}>
                Reset All Filters
              </Text>
            </TouchableOpacity>
          </View>
        )}

      </View>
    </ScrollView>
  );
}

/* =========================================================
   TIMETABLE SCREEN
========================================================= */

function TimetableScreen() {
  const [semester, setSemester] = useState(3);
  const [departmentSelected, setDepartmentSelected] = useState(true);

  return (
    <ScrollView
      style={styles.main}
      contentContainerStyle={styles.mainContent}
      showsVerticalScrollIndicator={false}
    >
      {/* PAGE TITLE */}
      <View style={styles.pageHeader}>
        <View style={styles.pageHeaderText}>
          <Text style={styles.academicPortal}>ACADEMIC PORTAL</Text>
          <Text style={styles.pageTitle}>Time Table</Text>
        </View>

        <SemesterSelector
          semester={semester}
          setSemester={setSemester}
        />
      </View>

      {/* DEPARTMENT */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.departmentScroll}
      >
        <DepartmentChip
          selected={departmentSelected}
          setSelected={setDepartmentSelected}
        />
      </ScrollView>

      {/* OFFICIAL DOCUMENT */}
      <OfficialDocument />
    </ScrollView>
  );
}

function SemesterSelector({ semester, setSemester }) {
  return (
    <View style={styles.semesterSelector}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setSemester(3)}
        style={[
          styles.semesterButton,
          semester === 3 && styles.semesterButtonActive,
        ]}
      >
        <Text
          style={[
            styles.semesterText,
            semester === 3 && styles.semesterTextActive,
          ]}
        >
          Sem 3
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setSemester(5)}
        style={[
          styles.semesterButton,
          semester === 5 && styles.semesterButtonActive,
        ]}
      >
        <Text
          style={[
            styles.semesterText,
            semester === 5 && styles.semesterTextActive,
          ]}
        >
          Sem 5
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function DepartmentChip({ selected, setSelected }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => setSelected(!selected)}
      style={[
        styles.departmentChip,
        selected && styles.departmentChipActive,
      ]}
    >
      <MaterialIcons
        name="psychology"
        size={16}
        color={selected ? COLORS.onPrimary : COLORS.onSurfaceVariant}
      />

      <Text
        style={[
          styles.departmentText,
          selected && styles.departmentTextActive,
        ]}
      >
        AI & DS
      </Text>
    </TouchableOpacity>
  );
}

function OfficialDocument() {
  const [showFullSize, setShowFullSize] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message:
          "Department of Artificial Intelligence & Data Science - Odd Semester Class Time Table",
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <View style={styles.documentSection}>
        {/* DOCUMENT HEADER */}
        <View style={styles.documentHeader}>
          <View style={styles.documentHeaderLeft}>
            <MaterialIcons
              name="description"
              size={18}
              color={COLORS.primary}
            />

            <Text style={styles.documentTitle}>Official Document</Text>
          </View>

          <View style={styles.semesterBadge}>
            <Text style={styles.semesterBadgeText}>Odd Semester 2024-25</Text>
          </View>
        </View>

        {/* IMAGE CARD */}
        <View style={styles.documentCard}>
          <View style={styles.zoomBadge}>
            <MaterialIcons
              name="zoom-in"
              size={16}
              color={COLORS.primary}
            />

            <Text style={styles.zoomText}>Pinch to Zoom</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.95}
            onPress={() => setShowFullSize(true)}
            style={styles.timetableImageContainer}
          >
            <Image
              source={TIMETABLE_IMAGE}
              style={styles.timetableImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowFullSize(true)}
            style={styles.fullSizeButton}
          >
            <MaterialIcons
              name="fullscreen"
              size={18}
              color={COLORS.onPrimary}
            />

            <Text style={styles.fullSizeText}>View Full Size</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleShare}
            style={styles.shareButton}
          >
            <MaterialIcons
              name="share"
              size={18}
              color={COLORS.onSurfaceVariant}
            />

            <Text style={styles.shareText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* FULL SIZE MODAL */}
      <Modal
        visible={showFullSize}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFullSize(false)}
      >
        <View style={styles.modalBackground}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowFullSize(false)}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name="close"
              size={26}
              color="#ffffff"
            />
          </TouchableOpacity>

          <ScrollView
            maximumZoomScale={4}
            minimumZoomScale={1}
            centerContent
            contentContainerStyle={styles.fullImageScroll}
          >
            <Image
              source={TIMETABLE_IMAGE}
              style={styles.fullSizeImage}
              resizeMode="contain"
            />
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

/* =========================================================
   CALENDAR SCREEN
========================================================= */

const MONTH_KEYS = ["jan", "feb", "mar", "apr", "may"];

function CalendarScreen() {
  const [selectedMonth, setSelectedMonth] = useState("mar");
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  const currentIndex = MONTH_KEYS.indexOf(selectedMonth);
  const prevMonthKey = MONTH_KEYS[(currentIndex - 1 + MONTH_KEYS.length) % MONTH_KEYS.length];
  const nextMonthKey = MONTH_KEYS[(currentIndex + 1) % MONTH_KEYS.length];

  const handlePrev = () => setSelectedMonth(prevMonthKey);
  const handleNext = () => setSelectedMonth(nextMonthKey);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.calendarContentContainer}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <View style={styles.calendarMainWrapper}>
        <PlannerHeader />

        <MonthTabs
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
        />

        {/* 3-CARD CAROUSEL VIEW */}
        <View style={styles.carouselContainer}>
          {isDesktop && (
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handlePrev}
              style={[styles.sideCardWrapper, styles.leftCardWrapper]}
            >
              <MiniMonthCard monthKey={prevMonthKey} />
            </TouchableOpacity>
          )}

          {/* LEFT FLOATING ARROW BUTTON */}
          <TouchableOpacity
            style={styles.floatingNavButtonLeft}
            onPress={handlePrev}
            activeOpacity={0.8}
          >
            <MaterialIcons name="chevron-left" size={26} color="#1d4ed8" />
          </TouchableOpacity>

          {/* ACTIVE CENTER CARD */}
          <View style={styles.centerCardWrapper}>
            <ActiveMonthCard monthKey={selectedMonth} />
          </View>

          {/* RIGHT FLOATING ARROW BUTTON */}
          <TouchableOpacity
            style={styles.floatingNavButtonRight}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <MaterialIcons name="chevron-right" size={26} color="#1d4ed8" />
          </TouchableOpacity>

          {isDesktop && (
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleNext}
              style={[styles.sideCardWrapper, styles.rightCardWrapper]}
            >
              <MiniMonthCard monthKey={nextMonthKey} />
            </TouchableOpacity>
          )}
        </View>

        <ActionButtons />
      </View>
    </ScrollView>
  );
}

function PlannerHeader() {
  return (
    <View style={styles.plannerHeader}>
      <View style={styles.plannerHeaderLeft}>
        <Text style={styles.academicPlanner}>ACADEMIC PLANNER • EVEN SEMESTER 2024–25</Text>
        <View style={styles.paceQuickRow}>
          <Text style={styles.paceQuickText}>
            Day <Text style={styles.paceHighlightDay}>68</Text> / 90 Working Days (75.5% Complete)
          </Text>
          <View style={styles.quickProgressBar}>
            <View style={styles.quickProgressFill} />
          </View>
        </View>
      </View>

      <View style={styles.autonomousBadge}>
        <MaterialIcons
          name="settings"
          size={18}
          color="#1d4ed8"
        />
        <Text style={styles.autonomousText}>Autonomous</Text>
      </View>
    </View>
  );
}

function MonthTabs({ selectedMonth, setSelectedMonth }) {
  const months = [
    ["jan", "January"],
    ["feb", "February"],
    ["mar", "March"],
    ["apr", "April"],
    ["may", "May"],
  ];

  return (
    <View style={styles.monthTabsWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.monthScroll}
      >
        {months.map(([key, label]) => {
          const active = selectedMonth === key;

          return (
            <TouchableOpacity
              key={key}
              onPress={() => setSelectedMonth(key)}
              style={[
                styles.monthTab,
                active && styles.monthTabActive,
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.monthTabText,
                  active && styles.monthTabTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function ActiveMonthCard({ monthKey }) {
  const data = monthConfigs[monthKey] || monthConfigs.mar;

  return (
    <View style={styles.activeCard}>
      {/* CARD DARK NAVY HEADER */}
      <View style={styles.activeCardHeader}>
        <View style={styles.activeCardTitleRow}>
          <MaterialIcons
            name="calendar-today"
            size={24}
            color="#ffffff"
          />
          <Text style={styles.activeCardTitle}>{data.name}</Text>
        </View>

        <View style={styles.activeWorkDaysBadge}>
          <Text style={styles.activeWorkDaysText}>{data.workDays}</Text>
        </View>
      </View>

      {/* CARD BODY */}
      <View style={styles.activeCardBody}>
        {/* WEEKDAYS HEADER */}
        <View style={styles.weekHeader}>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
            <Text
              key={index}
              style={[
                styles.weekDay,
                index >= 5 && styles.weekDayWeekend,
              ]}
            >
              {day}
            </Text>
          ))}
        </View>

        {/* DAYS GRID */}
        <View style={styles.calendarGrid}>
          {data.days.map(([day, type], index) => (
            <CalendarDay
              key={`${day}-${index}`}
              day={day}
              type={type}
              colIndex={index % 7}
              isCenter={true}
            />
          ))}
        </View>

        {/* LEGEND */}
        <CalendarLegend />
      </View>
    </View>
  );
}

function MiniMonthCard({ monthKey }) {
  const data = monthConfigs[monthKey] || monthConfigs.feb;

  return (
    <View style={styles.miniCard}>
      {/* MINI HEADER */}
      <View style={styles.miniCardHeader}>
        <View style={styles.miniCardTitleRow}>
          <MaterialIcons
            name="calendar-today"
            size={20}
            color="#64748b"
          />
          <Text style={styles.miniCardTitle}>{data.name}</Text>
        </View>

        <View style={styles.miniWorkDaysBadge}>
          <Text style={styles.miniWorkDaysText}>{data.workDays}</Text>
        </View>
      </View>

      {/* MINI WEEKDAYS */}
      <View style={styles.miniWeekHeader}>
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
          <Text
            key={index}
            style={[
              styles.miniWeekDay,
              index >= 5 && styles.miniWeekDayWeekend,
            ]}
          >
            {day}
          </Text>
        ))}
      </View>

      {/* MINI DAYS GRID */}
      <View style={styles.calendarGrid}>
        {data.days.map(([day, type], index) => (
          <CalendarDay
            key={`${day}-${index}`}
            day={day}
            type={type}
            colIndex={index % 7}
            isCenter={false}
          />
        ))}
      </View>
    </View>
  );
}

function CalendarDay({ day, type, colIndex, isCenter }) {
  const isWeekendCol = colIndex === 5 || colIndex === 6;

  let cellBg = isWeekendCol ? (isCenter ? styles.dayWeekendCol : styles.miniDayWeekendCol) : null;
  let textStyle = isCenter ? styles.dayTextNormal : styles.miniDayTextNormal;
  let hasDot = false;
  let dotColor = "#2563eb";

  if (type === "outside") {
    cellBg = isWeekendCol ? (isCenter ? styles.dayWeekendCol : styles.miniDayWeekendCol) : null;
    textStyle = styles.dayTextOutside;
  } else if (isWeekendCol) {
    textStyle = styles.dayTextWeekend;
  }

  let customPillStyle = null;

  if (type === "today") {
    customPillStyle = styles.pillToday;
    textStyle = styles.dayTextToday;
    hasDot = true;
    dotColor = "#2563eb";
  } else if (type === "exam") {
    customPillStyle = styles.pillExam;
    textStyle = styles.dayTextExam;
    hasDot = true;
    dotColor = "#ea580c";
  } else if (type === "event") {
    customPillStyle = styles.pillEvent;
    textStyle = styles.dayTextEvent;
    hasDot = true;
    dotColor = "#7c3aed";
  } else if (type === "holiday") {
    customPillStyle = styles.pillHoliday;
    textStyle = styles.dayTextHoliday;
    hasDot = true;
    dotColor = "#dc2626";
  } else if (type === "special") {
    textStyle = styles.dayTextSpecial;
  }

  return (
    <View style={[styles.calendarDayCell, cellBg]}>
      <View style={[styles.dayContentBox, customPillStyle]}>
        <Text style={[styles.dayNumberText, textStyle, !isCenter && styles.miniDayNumberText]}>{day}</Text>
      </View>
      {hasDot && isCenter && (
        <View style={[styles.dayBottomDot, { backgroundColor: dotColor }]} />
      )}
    </View>
  );
}

function CalendarLegend() {
  return (
    <View style={styles.legendContainer}>
      <LegendItem color="#2563eb" label="Working Days (Mon–Fri)" />
      <LegendItem color="#dc2626" label="Weekends & Holidays" />
      <LegendItem color="#ea580c" label="Exams/ CIA" />
      <LegendItem color="#7c3aed" label="College Events" />
    </View>
  );
}

function LegendItem({ color, label }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendCircle, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function ActionButtons() {
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);

  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const syncCalendar = () => {
    if (syncing) return;
    setSyncing(true);

    setTimeout(() => {
      setSyncing(false);
      setSynced(true);
      setTimeout(() => {
        setSynced(false);
      }, 2500);
    }, 1200);
  };

  const downloadPdf = () => {
    if (downloading) return;
    setDownloading(true);

    setTimeout(() => {
      setDownloading(false);
      setDownloaded(true);
      setTimeout(() => {
        setDownloaded(false);
      }, 2500);
    }, 1000);
  };

  return (
    <View style={styles.actionContainer}>
      <TouchableOpacity
        style={[
          styles.primaryButton,
          synced && styles.syncedButton,
        ]}
        onPress={syncCalendar}
        activeOpacity={0.85}
      >
        <MaterialIcons
          name={syncing ? "sync" : synced ? "done" : "sync"}
          size={20}
          color="#ffffff"
        />
        <Text style={styles.primaryButtonText}>
          {syncing
            ? "Syncing..."
            : synced
            ? "Synced with Calendar!"
            : "Sync with Calendar"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={downloadPdf}
        activeOpacity={0.85}
      >
        <MaterialIcons
          name={
            downloading
              ? "downloading"
              : downloaded
              ? "check-circle"
              : "download"
          }
          size={20}
          color="#1d4ed8"
        />
        <Text style={styles.secondaryButtonText}>
          {downloading
            ? "Preparing PDF..."
            : downloaded
            ? "PDF Downloaded!"
            : "Download PDF"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/* =========================================================
   MORE SCREEN (LAURELS & ABOUT NEXUS TABS)
========================================================= */

function MoreScreen() {
  const [moreSubTab, setMoreSubTab] = useState("about");

  return (
    <View style={{ flex: 1 }}>
      {/* SUB-TAB SELECTOR (ABOUT NEXUS / LAURELS) */}
      <View style={styles.moreSubNavWrapper}>
        <View style={styles.moreSubNav}>
          <TouchableOpacity
            style={[
              styles.moreSubTabButton,
              moreSubTab === "about" && styles.moreSubTabButtonActive,
            ]}
            onPress={() => setMoreSubTab("about")}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name="info"
              size={18}
              color={
                moreSubTab === "about"
                  ? COLORS.onPrimary
                  : COLORS.onSurfaceVariant
              }
            />
            <Text
              style={[
                styles.moreSubTabText,
                moreSubTab === "about" && styles.moreSubTabTextActive,
              ]}
            >
              About NEXUS
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.moreSubTabButton,
              moreSubTab === "laurels" && styles.moreSubTabButtonActive,
            ]}
            onPress={() => setMoreSubTab("laurels")}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name="workspace-premium"
              size={18}
              color={
                moreSubTab === "laurels"
                  ? COLORS.onPrimary
                  : COLORS.onSurfaceVariant
              }
            />
            <Text
              style={[
                styles.moreSubTabText,
                moreSubTab === "laurels" && styles.moreSubTabTextActive,
              ]}
            >
              Hall of Excellence
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {moreSubTab === "about" ? <AboutNexusView /> : <LaurelsView />}
    </View>
  );
}

/* =========================================================
   ABOUT NEXUS VIEW
========================================================= */

const INITIAL_CREATORS = [
  {
    id: "kamesh",
    image: KAMESH_IMAGE,
    initials: "KN",
    name: "KAMESH N",
    roll: "715024243040",
    department: "B.Tech AI & Data Science (2024-2028)",
    description:
      "Spearheaded overall system architecture, database schema, end-to-end responsive UI/UX system, timetable engine, and mobile viewport optimizations.",
    tags: ["System Design", "UI/UX", "API Integration"],
  },
  {
    id: "prakash",
    image: PRAKASH_IMAGE,
    initials: "GP",
    name: "GNANA PRAKASH V",
    roll: "715024243030",
    department: "B.Tech AI & Data Science (2024-2028)",
    description:
      "Architected the real-time attendance analytics engine, automated margin calculator, multi-role authentication security, and session management.",
    tags: ["Cloud Backend", "Attendance Engine", "Security"],
  },
  {
    id: "abishek",
    image: ABISHEK_RK_IMAGE,
    initials: "AR",
    name: "ABISHEK R K",
    roll: "715024243004",
    department: "B.Tech AI & Data Science (2024-2028)",
    description:
      "Core developer contributing to frontend interfaces, module data binding, student portal integrations, and cross-device responsiveness.",
    tags: ["Frontend UI", "Module Integration", "Component Design"],
  },
  {
    id: "christ-noble",
    image: CHRIST_NOBLE_IMAGE,
    initials: "CN",
    name: "CHRIST NOBLE S",
    roll: "715024243017",
    department: "B.Tech AI & Data Science (2024-2028)",
    description:
      "Core developer contributing to system features, component integration, data pipeline workflows, and UI testing.",
    tags: ["Frontend UI", "Testing & QA", "API Integration"],
  },
];

function AboutNexusView() {
  const [creators, setCreators] = useState(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const saved = window.localStorage.getItem("nexus_creators_list");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch (e) {}
    return INITIAL_CREATORS;
  });

  const openEmail = () => {
    Linking.openURL("mailto:nexus.aids@infotech.edu.in");
  };


  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.aboutContentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* HERO */}
      <View style={styles.heroCard}>
        <View style={styles.heroGlowTop} />
        <View style={styles.heroGlowBottom} />

        <View style={styles.heroLogoContainer}>
          <Image
            source={{ uri: ABOUT_HERO_LOGO }}
            style={styles.heroLogo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.projectBadge}>
          <MaterialIcons
            name="code"
            size={16}
            color={COLORS.onPrimaryFixed}
          />
          <Text style={styles.projectBadgeText}>
            Capstone Project • Dept of AI & DS
          </Text>
        </View>

        <Text style={styles.projectTitle}>NEXUS</Text>

        <Text style={styles.projectSubtitle}>
          Academic Governance & Attendance Management
        </Text>

        <Text style={styles.projectDescription}>
          Info Institute of Technology • Academic Year 2026-2027
        </Text>

        <View style={styles.versionContainer}>
          <View style={styles.versionTag}>
            <Text style={styles.versionText}>Version 2.4</Text>
          </View>
          <View style={styles.normalTag}>
            <Text style={styles.normalTagText}>Responsive PWA</Text>
          </View>
          <View style={styles.normalTag}>
            <Text style={styles.normalTagText}>Expo & React Native</Text>
          </View>
          <View style={styles.normalTag}>
            <Text style={styles.normalTagText}>Cloud Backend</Text>
          </View>
        </View>
      </View>

      {/* PROJECT CREATORS */}
      <View style={styles.aboutSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Project Creators</Text>
            <Text style={styles.sectionSubtitle}>
              Core Development & Architecture Team
            </Text>
          </View>

          <View style={styles.studentLeadsTag}>
            <Text style={styles.studentLeadsText}>Student Leads</Text>
          </View>
        </View>

        {creators.map((creator) => (
          <StudentCard
            key={creator.id}
            image={creator.image}
            initials={creator.initials}
            name={creator.name}
            roll={creator.roll}
            department={creator.department}
            description={creator.description}
            tags={creator.tags}
          />
        ))}
      </View>

      {/* SYSTEM HIGHLIGHTS */}
      <View style={styles.aboutSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>System Highlights</Text>
          </View>
          <Text style={styles.deliveredModules}>Delivered Modules</Text>
        </View>

        <View style={styles.moduleGrid}>
          <ModuleCard
            icon="fact-check"
            title="Smart Attendance"
            subtitle="80% target safety alerts"
            backgroundColor={COLORS.primaryFixed}
            iconColor={COLORS.primary}
          />
          <ModuleCard
            icon="calendar-today"
            title="Dynamic Timetable"
            subtitle="Live day order tracking"
            backgroundColor={COLORS.secondaryFixed}
            iconColor={COLORS.secondary}
          />
          <ModuleCard
            icon="library-books"
            title="5-Year QP Bank"
            subtitle="Past semester papers"
            backgroundColor={COLORS.tertiaryFixed}
            iconColor={COLORS.tertiary}
          />
          <ModuleCard
            icon="support-agent"
            title="Q-Fix Support"
            subtitle="Grievance resolution"
            backgroundColor={COLORS.surfaceContainerHigh}
            iconColor={COLORS.onSurfaceVariant}
          />
        </View>
      </View>

      {/* FEEDBACK & COLLABORATION */}
      <View style={styles.aboutSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Feedback & Collaboration</Text>
          </View>
          <Text style={styles.academicGuidance}>Connect</Text>
        </View>

        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackText}>
            Have suggestions, bug reports, or feature requests for future
            iterations of the NEXUS portal? Reach out directly to the student
            developer team.
          </Text>

          <TouchableOpacity
            style={styles.contactButton}
            onPress={openEmail}
            activeOpacity={0.75}
          >
            <View style={styles.contactLeft}>
              <View style={styles.contactIcon}>
                <MaterialIcons
                  name="mail"
                  size={18}
                  color={COLORS.primary}
                />
              </View>
              <View>
                <Text style={styles.contactTitle}>Email Project Team</Text>
                <Text style={styles.contactSubtitle}>
                  nexus.aids@infotech.edu.in
                </Text>
              </View>
            </View>
            <MaterialIcons
              name="send"
              size={20}
              color={COLORS.secondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* FOOTER */}
      <View style={styles.aboutFooter}>
        <Text style={styles.footerMain}>
          Crafted with ❤️ by Department of AI & DS Students.
        </Text>
        <Text style={styles.footerSub}>
          Info Institute of Technology • Coimbatore
        </Text>
      </View>
    </ScrollView>
  );
}

function StudentCard({ image, initials, name, roll, department, description, tags }) {
  return (
    <View style={styles.profileCard}>
      <View style={styles.profileTop}>
        <View style={styles.profileAvatarWrapper}>
          {image ? (
            <Image source={{ uri: image }} style={styles.profileImage} />
          ) : (
            <View style={styles.initialAvatar}>
              <Text style={styles.initialText}>
                {initials || (name ? name.substring(0, 2).toUpperCase() : "ST")}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.profileInfo}>
          <View style={styles.profileHeaderRow}>
            <Text style={styles.profileName} numberOfLines={1}>
              {name}
            </Text>
          </View>
          <Text style={styles.profileSub}>
            {department
              ? `${department}${roll ? ` • Roll: ${roll}` : ""}`
              : `B.Tech AI & Data Science (2024–2029) • Roll: ${roll}`}
          </Text>
        </View>
      </View>

      <Text style={styles.profileDescription}>{description}</Text>

      <View style={styles.cardDivider} />

      <View style={styles.profileBottom}>
        <View style={styles.tagsContainer}>
          {(tags || []).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.iconActions}>
          <MaterialIcons
            name="terminal"
            size={18}
            color={COLORS.primary}
          />
          <MaterialIcons
            name="link"
            size={18}
            color={COLORS.secondary}
          />
        </View>
      </View>
    </View>
  );
}

function MentorCard({ initials, name, role, department, quote, description }) {
  return (
    <View style={styles.profileCard}>
      <View style={styles.profileTop}>
        <View style={styles.initialAvatar}>
          <Text style={styles.initialText}>{initials}</Text>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.profileName} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.mentorRole}>{role}</Text>
          <Text style={styles.profileSub}>{department}</Text>
        </View>
      </View>

      {quote ? (
        <View style={styles.quoteBox}>
          <Text style={styles.quoteText}>{quote}</Text>
        </View>
      ) : (
        <Text style={styles.profileDescription}>{description}</Text>
      )}
    </View>
  );
}

function ModuleCard({ icon, title, subtitle, backgroundColor, iconColor }) {
  return (
    <View style={styles.moduleCard}>
      <View style={[styles.moduleIcon, { backgroundColor }]}>
        <MaterialIcons name={icon} size={22} color={iconColor} />
      </View>

      <View style={styles.moduleInfo}>
        <Text style={styles.moduleTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.moduleSubtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

/* =========================================================
   LAURELS / HALL OF EXCELLENCE VIEW
========================================================= */

function LaurelsView() {
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filteredAchievements =
    selectedFilter === "all"
      ? achievements
      : achievements.filter((item) => item.category === selectedFilter);

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.aboutContentContainer}
      showsVerticalScrollIndicator={false}
    >
      <InstitutionCard />

      <FilterPills
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
      />

      <View style={styles.cardsContainer}>
        {filteredAchievements.map((item) => (
          <AchievementCard key={item.id} item={item} />
        ))}
      </View>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

function InstitutionCard() {
  return (
    <View style={styles.institutionCard}>
      <View style={styles.badgeImageContainer}>
        <Image
          source={{ uri: COLLEGE_BADGE }}
          style={styles.collegeBadge}
          resizeMode="contain"
        />
      </View>

      <View style={styles.institutionText}>
        <View style={styles.excellenceBadge}>
          <MaterialIcons
            name="workspace-premium"
            size={14}
            color={COLORS.onPrimaryFixed}
          />
          <Text style={styles.excellenceText}>Hall of Excellence</Text>
        </View>

        <Text style={styles.mainTitle}>Campus Achievements & Laurels</Text>
        <Text style={styles.subtitle}>
          Celebrating Academic, Research, Hackathon & Sports Excellence
        </Text>
      </View>
    </View>
  );
}

function FilterPills({ selectedFilter, setSelectedFilter }) {
  return (
    <View style={styles.filterSection}>
      <View style={styles.filterHeader}>
        <Text style={styles.browseDomains}>Browse Domains</Text>
        <Text style={styles.showingText}>
          Showing{" "}
          {
            achievements.filter(
              (item) =>
                selectedFilter === "all" || item.category === selectedFilter
            ).length
          }{" "}
          of 4
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {achievementFilters.map((filter) => {
          const active = selectedFilter === filter.id;

          return (
            <TouchableOpacity
              key={filter.id}
              onPress={() => setSelectedFilter(filter.id)}
              activeOpacity={0.8}
              style={[
                styles.filterButton,
                active && styles.filterButtonActive,
              ]}
            >
              <MaterialIcons
                name={filter.icon}
                size={16}
                color={active ? COLORS.onPrimary : COLORS.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.filterText,
                  active && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function AchievementCard({ item }) {
  const handleAction = () => {
    Alert.alert(item.buttonText, item.title);
  };

  return (
    <View style={styles.achievementCard}>
      <View style={styles.cardTop}>
        <View
          style={[styles.achievementIcon, { backgroundColor: item.iconBg }]}
        >
          <MaterialIcons
            name={item.icon}
            size={24}
            color={item.iconColor}
          />
        </View>

        <View style={styles.cardHeading}>
          <View style={styles.badgesRow}>
            <View
              style={[
                styles.smallBadge,
                { backgroundColor: item.badgeBg },
              ]}
            >
              <Text
                style={[
                  styles.smallBadgeText,
                  { color: item.badgeColor },
                ]}
              >
                {item.badge}
              </Text>
            </View>

            <Text
              style={[styles.prizeText, { color: item.prizeColor }]}
            >
              {item.prize}
            </Text>
          </View>

          <Text style={styles.cardTitle}>{item.title}</Text>
        </View>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.achievementImage}
          resizeMode="cover"
        />

        <View style={styles.imageLabel}>
          <MaterialIcons
            name={item.imageIcon}
            size={14}
            color={COLORS.primary}
          />
          <Text style={styles.imageLabelText}>{item.imageLabel}</Text>
        </View>
      </View>

      <Text style={styles.description}>{item.description}</Text>

      <View style={styles.cardFooter}>
        <View style={styles.footerInfo}>
          <MaterialIcons
            name={item.footerIcon}
            size={16}
            color={item.footerColor}
          />
          <Text style={styles.footerText}>{item.footerText}</Text>
        </View>

        <TouchableOpacity
          style={styles.cardAction}
          onPress={handleAction}
          activeOpacity={0.7}
        >
          <Text style={styles.cardActionText}>{item.buttonText}</Text>
          <MaterialIcons
            name="chevron-right"
            size={16}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SubmitAchievement() {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      Alert.alert(
        "Submission Received",
        "Your laurel nomination has been sent to the Dean's Office for verification."
      );
    }, 1500);
  };

  return (
    <View style={styles.submitCard}>
      <View style={styles.submitLeft}>
        <View style={styles.submitIcon}>
          <MaterialIcons
            name={submitting ? "check" : "add-task"}
            size={20}
            color={COLORS.onPrimary}
          />
        </View>

        <View style={styles.submitTextContainer}>
          <Text style={styles.submitTitle}>Won a Laurels Award?</Text>
          <Text style={styles.submitSubtitle}>
            Submit your victory to the Dean's Honour Roll
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        activeOpacity={0.8}
      >
        {submitting ? (
          <>
            <MaterialIcons
              name="check"
              size={16}
              color={COLORS.onPrimary}
            />
            <Text style={styles.submitButtonText}>Opening...</Text>
          </>
        ) : (
          <>
            <Text style={styles.submitButtonText}>Submit</Text>
            <MaterialIcons
              name="arrow-forward"
              size={16}
              color={COLORS.onPrimary}
            />
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

/* =========================================================
   CIRCULAR CARD
========================================================= */

function CircularCard({ item }) {
  let badgeStyle = styles.badgeBlue;
  let badgeTextStyle = styles.badgeBlueText;

  if (item.badgeType === "gray") {
    badgeStyle = styles.badgeGray;
    badgeTextStyle = styles.badgeGrayText;
  }

  if (item.badgeType === "blueDim") {
    badgeStyle = styles.badgeBlueDim;
    badgeTextStyle = styles.badgeBlueText;
  }

  if (item.badgeType === "orange") {
    badgeStyle = styles.badgeOrange;
    badgeTextStyle = styles.badgeOrangeText;
  }

  return (
    <View style={styles.circularCard}>
      {/* TOP */}
      <View style={styles.circularTop}>
        <View style={styles.departmentRow}>
          <View style={[styles.departmentBadge, badgeStyle]}>
            <Text style={badgeTextStyle}>{item.badge}</Text>
          </View>

          <View style={styles.departmentInfo}>
            <Text style={styles.departmentName} numberOfLines={1}>
              {item.department}
            </Text>
            <Text style={styles.referenceText} numberOfLines={1}>
              {item.ref}
            </Text>
          </View>
        </View>

        <View style={styles.dateContainer}>
          <Text style={styles.dateBadge}>{item.date}</Text>
          <Text
            style={[
              styles.dateTag,
              item.category === "placement" && styles.placementTag,
            ]}
          >
            {item.tag}
          </Text>
        </View>
      </View>

      {/* CONTENT */}
      <View style={styles.circularContent}>
        <Text style={styles.circularTitle}>{item.heading}</Text>
        <Text style={styles.circularDescription}>{item.description}</Text>
      </View>

      {/* FOOTER */}
      <View style={styles.circularFooter}>
        <View style={styles.footerContent}>
          <MaterialIcons
            name={item.footerIcon}
            size={15}
            color={
              item.category === "events"
                ? COLORS.tertiary
                : COLORS.primary
            }
          />
          <Text style={styles.footerText}>{item.footer}</Text>
        </View>
      </View>
    </View>
  );
}

/* =========================================================
   BOTTOM NAV ITEM
========================================================= */

function BottomNavItem({ icon, label, active, onPress, isDarkPortal }) {
  const iconColor = active
    ? (isDarkPortal ? "#38bdf8" : COLORS.primary)
    : (isDarkPortal ? "rgba(255,255,255,0.70)" : COLORS.onSurfaceVariant);

  const labelStyle = active
    ? (isDarkPortal ? { color: "#38bdf8", fontWeight: "700" } : styles.activeNavLabel)
    : (isDarkPortal ? { color: "rgba(255,255,255,0.70)" } : styles.inactiveNavLabel);

  return (
    <TouchableOpacity
      style={styles.navItem}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <MaterialIcons
        name={icon}
        size={22}
        color={iconColor}
      />

      <Text
        style={[
          styles.navLabel,
          labelStyle,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },

  /* ================= HEADER ================= */
  headerWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },

  headerBlur: {
    overflow: "hidden",
    backgroundColor: "rgba(250,248,255,0.80)",
  },

  header: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,

    elevation: 2,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: COLORS.surfaceContainer,
    marginRight: 8,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },

  headerLogo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  headerTextContainer: {
    flex: 1,
  },

  nexusText: {
    fontFamily: Platform.OS === "android" ? "sans-serif" : undefined,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600",
    color: COLORS.onSurface,
    letterSpacing: -0.3,
  },

  collegeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    color: COLORS.primary,
  },

  notificationButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
  },

  notificationDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },

  /* ================= MORE SUB-NAVIGATION ================= */
  moreSubNavWrapper: {
    paddingTop: 72,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: COLORS.surface,
  },

  moreSubNav: {
    flexDirection: "row",
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 12,
    padding: 4,
  },

  moreSubTabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },

  moreSubTabButtonActive: {
    backgroundColor: COLORS.primary,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },

  moreSubTabText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
  },

  moreSubTabTextActive: {
    color: COLORS.onPrimary,
  },

  /* ================= ABOUT NEXUS VIEW ================= */
  aboutContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 110,
  },

  heroCard: {
    position: "relative",
    width: "100%",
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  heroGlowTop: {
    position: "absolute",
    width: 176,
    height: 176,
    borderRadius: 88,
    right: -48,
    top: -48,
    backgroundColor: "rgba(219,225,255,0.35)",
  },

  heroGlowBottom: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    left: -48,
    bottom: -48,
    backgroundColor: "rgba(255,219,207,0.35)",
  },

  heroLogoContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.surfaceContainerLow,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  heroLogo: {
    width: "100%",
    height: "100%",
    borderRadius: 44,
  },

  projectBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.primaryFixed,
    marginBottom: 8,
  },

  projectBadgeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: COLORS.onPrimaryFixed,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  projectTitle: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: 4,
  },

  projectSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: COLORS.primary,
    letterSpacing: 0.5,
    textAlign: "center",
    marginBottom: 8,
  },

  projectDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    marginBottom: 16,
  },

  versionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },

  versionTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: COLORS.primaryFixed,
  },

  versionText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    color: COLORS.onPrimaryFixed,
  },

  normalTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceContainerHigh,
  },

  normalTagText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
  },

  aboutSection: {
    width: "100%",
    marginTop: 20,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  sectionHeading: {
    flex: 1,
    marginRight: 8,
  },

  sectionTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  sectionSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
  },

  studentLeadsTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: COLORS.primaryFixed,
  },

  studentLeadsText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: COLORS.onPrimaryFixed,
  },

  academicGuidance: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
  },

  deliveredModules: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: COLORS.primary,
  },

  profileCard: {
    width: "100%",
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  profileTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    flexShrink: 0,
    borderWidth: 1,
    borderColor: "rgba(0,63,177,0.2)",
  },

  initialAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },

  initialText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
  },

  profileInfo: {
    flex: 1,
    minWidth: 0,
  },

  profileHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
    gap: 8,
  },



  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },

  creatorModalCard: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(195,197,215,0.3)",
  },

  creatorModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
  },

  creatorModalIconBg: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },

  creatorModalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  creatorModalCloseBtn: {
    padding: 4,
    borderRadius: 16,
  },

  modalFieldGroup: {
    marginBottom: 12,
  },

  modalFieldRow: {
    flexDirection: "row",
    gap: 12,
  },

  modalFieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
    marginBottom: 4,
  },

  modalInput: {
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderColor: "rgba(195,197,215,0.4)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: COLORS.onSurface,
  },

  creatorModalActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerHigh,
  },

  creatorDeleteBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.errorContainer,
    marginRight: "auto",
  },

  creatorCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceContainer,
  },

  creatorCancelBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
  },

  creatorSaveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },

  creatorSaveBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ffffff",
  },

  profileAvatarWrapper: {
    position: "relative",
    flexShrink: 0,
    cursor: "pointer",
  },

  avatarEditOverlay: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },

  modalPhotoSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 12,
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(195,197,215,0.4)",
  },

  modalPhotoPreviewContainer: {
    position: "relative",
    width: 58,
    height: 58,
    borderRadius: 29,
    overflow: "hidden",
    flexShrink: 0,
    borderWidth: 2,
    borderColor: COLORS.primary,
    cursor: "pointer",
  },

  modalPhotoPreview: {
    width: "100%",
    height: "100%",
    borderRadius: 27,
  },

  modalPhotoPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 27,
    backgroundColor: COLORS.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },

  modalPhotoInitials: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
  },

  modalPhotoOverlayIcon: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: "rgba(0, 63, 177, 0.75)",
    alignItems: "center",
    justifyContent: "center",
  },

  modalPhotoActions: {
    flex: 1,
  },

  modalUploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.surfaceContainerLowest,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 63, 177, 0.3)",
    cursor: "pointer",
  },

  modalUploadBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
  },

  modalRemovePhotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fff1f2",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(225, 29, 72, 0.2)",
    cursor: "pointer",
  },

  modalRemovePhotoBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.error,
  },

  modalPhotoHint: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    marginTop: 6,
  },

  profileName: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: 2,
    flex: 1,
  },

  profileSub: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "400",
    color: COLORS.onSurfaceVariant,
  },

  profileDescription: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "400",
    color: COLORS.onSurfaceVariant,
    marginTop: 12,
  },

  cardDivider: {
    height: 1,
    backgroundColor: "rgba(231,231,243,0.6)",
    marginTop: 12,
    marginBottom: 8,
  },

  profileBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 1,
    gap: 6,
    marginRight: 8,
  },

  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceContainerLow,
  },

  tagText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "500",
    color: COLORS.onSurfaceVariant,
  },

  iconActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  mentorRole: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 2,
  },

  quoteBox: {
    backgroundColor: COLORS.surfaceContainerLow,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },

  quoteText: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.onSurfaceVariant,
    fontStyle: "italic",
  },

  moduleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },

  moduleCard: {
    width: "48%",
    minHeight: 84,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  moduleIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  moduleInfo: {
    flex: 1,
    minWidth: 0,
  },

  moduleTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: 2,
  },

  moduleSubtitle: {
    fontSize: 12,
    lineHeight: 15,
    color: COLORS.onSurfaceVariant,
  },

  feedbackCard: {
    width: "100%",
    backgroundColor: COLORS.surfaceContainerLowest,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  feedbackText: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.onSurfaceVariant,
    marginBottom: 12,
  },

  contactButton: {
    width: "100%",
    minHeight: 58,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  contactLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  contactIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  contactTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  contactSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.onSurfaceVariant,
  },

  aboutFooter: {
    marginTop: 24,
    marginBottom: 16,
    alignItems: "center",
  },

  footerMain: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
  },

  footerSub: {
    fontSize: 12,
    lineHeight: 20,
    color: COLORS.outline,
    textAlign: "center",
    marginTop: 2,
  },

  /* ================= SCROLL / LAYOUT ================= */
  scrollContent: {
    paddingTop: 80,
    paddingBottom: 100,
  },

  mainContainer: {
    width: "100%",
    paddingHorizontal: 16,
    gap: 16,
  },

  scroll: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },

  content: {
    paddingTop: 80,
    paddingBottom: 100,
  },

  main: {
    paddingHorizontal: 16,
  },

  mainContent: {
    paddingTop: 80,
    paddingHorizontal: 16,
    paddingBottom: 90,
  },

  calendarContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 66,
    paddingBottom: 90,
    alignItems: "center",
  },

  calendarMainWrapper: {
    maxWidth: 1360,
    width: "100%",
    gap: 18,
    alignItems: "center",
  },

  scrollView: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },

  // INSTITUTION CARD
  institutionCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },

  badgeImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: COLORS.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },

  collegeBadge: {
    width: "100%",
    height: "100%",
    padding: 4,
  },

  institutionText: {
    flex: 1,
    minWidth: 0,
  },

  excellenceBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryFixed,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 4,
  },

  excellenceText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: COLORS.onPrimaryFixed,
    marginLeft: 4,
  },

  mainTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600",
    color: COLORS.onSurface,
    letterSpacing: -0.2,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },

  // FILTER
  filterSection: {
    marginBottom: 16,
  },

  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
    marginBottom: 6,
  },

  browseDomains: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
  },

  showingText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: COLORS.primary,
  },

  filterScroll: {
    paddingVertical: 4,
    gap: 8,
  },

  filterButton: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceContainer,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  filterButtonActive: {
    backgroundColor: COLORS.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  cardsContainer: {
    gap: 16,
  },

  achievementCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  cardHeading: {
    flex: 1,
  },

  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },

  smallBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },

  smallBadgeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
  },

  prizeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },

  cardTitle: {
    fontSize: 20,
    lineHeight: 27,
    fontWeight: "600",
    color: COLORS.onSurface,
    marginTop: 2,
  },

  imageContainer: {
    width: "100%",
    height: 144,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
    marginBottom: 12,
  },

  achievementImage: {
    width: "100%",
    height: "100%",
  },

  imageLabel: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.90)",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  imageLabelText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: COLORS.onSurface,
    marginLeft: 4,
  },

  description: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
    color: COLORS.onSurfaceVariant,
    marginBottom: 12,
  },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 4,
  },

  footerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 8,
  },

  footerText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
    marginLeft: 4,
    flexShrink: 1,
  },

  cardAction: {
    flexDirection: "row",
    alignItems: "center",
  },

  cardActionText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    color: COLORS.primary,
  },

  // SUBMIT CARD
  submitCard: {
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },

  submitLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },

  submitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  submitTextContainer: {
    flex: 1,
  },

  submitTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  submitSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
    marginTop: 1,
  },

  submitButton: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  submitButtonText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: COLORS.onPrimary,
    marginRight: 4,
  },

  bottomSpace: {
    height: 10,
  },

  /* ================= PAGE HEADER ================= */
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  pageHeaderText: {
    flex: 1,
  },

  academicPortal: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: COLORS.primary,
    letterSpacing: 1.1,
    marginBottom: 2,
  },

  pageTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  /* ================= SEMESTER ================= */
  semesterSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 4,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainerHigh,
    elevation: 2,
  },

  semesterButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  semesterButtonActive: {
    backgroundColor: COLORS.primary,
    elevation: 2,
  },

  semesterText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
  },

  semesterTextActive: {
    color: COLORS.onPrimary,
  },

  /* ================= DEPARTMENT ================= */
  departmentScroll: {
    paddingBottom: 16,
  },

  departmentChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceContainer,
  },

  departmentChipActive: {
    backgroundColor: COLORS.primary,
    elevation: 2,
  },

  departmentText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    color: COLORS.onSurfaceVariant,
  },

  departmentTextActive: {
    color: COLORS.onPrimary,
  },

  /* ================= DOCUMENT SECTION ================= */
  documentSection: {
    width: "100%",
    gap: 16,
  },

  documentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },

  documentHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },

  documentTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  semesterBadge: {
    backgroundColor: COLORS.surfaceContainerHigh,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    marginLeft: 8,
  },

  semesterBadgeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    color: COLORS.onSurfaceVariant,
  },

  documentCard: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: "rgba(195,197,215,0.30)",
    elevation: 2,
    position: "relative",
  },

  zoomBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(250,248,255,0.88)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    elevation: 2,
  },

  zoomText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    color: COLORS.onSurface,
  },

  timetableImageContainer: {
    width: "100%",
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },

  timetableImage: {
    width: "100%",
    aspectRatio: 937 / 1302,
    borderRadius: 8,
  },

  actionRow: {
    flexDirection: "row",
    gap: 8,
  },

  fullSizeButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    elevation: 2,
  },

  fullSizeText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    color: COLORS.onPrimary,
  },

  shareButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainerHigh,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  shareText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    color: COLORS.onSurface,
  },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.94)",
  },

  closeButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 25,
    right: 20,
    zIndex: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  fullImageScroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  fullSizeImage: {
    width: "100%",
    maxWidth: 640,
    aspectRatio: 937 / 1302,
  },

  /* ================= PLANNER HEADER ================= */
  plannerHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.85)",
    shadowColor: "#0256d0",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  plannerHeaderLeft: {
    flex: 1,
  },

  academicPlanner: {
    fontSize: 15.5,
    fontWeight: "800",
    letterSpacing: 0.5,
    color: "#1d4ed8",
  },

  paceQuickRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 6,
  },

  paceQuickText: {
    fontSize: 13.5,
    color: "#475569",
    fontWeight: "500",
  },

  paceHighlightDay: {
    fontWeight: "800",
    color: "#1d4ed8",
  },

  quickProgressBar: {
    width: 170,
    height: 9,
    borderRadius: 999,
    backgroundColor: "#e2e8f0",
    overflow: "hidden",
  },

  quickProgressFill: {
    width: "75.5%",
    height: "100%",
    backgroundColor: "#1d4ed8",
    borderRadius: 999,
  },

  autonomousBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#dbeafe",
  },

  autonomousText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#1d4ed8",
  },

  /* ================= MONTH TABS ================= */
  monthTabsWrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 6,
  },

  monthScroll: {
    gap: 14,
    paddingVertical: 6,
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  monthTab: {
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#edf2f7",
  },

  monthTabActive: {
    backgroundColor: "#0b57d0",
    elevation: 3,
    shadowColor: "#0b57d0",
    shadowOpacity: 0.32,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  monthTabText: {
    fontSize: 14.5,
    fontWeight: "600",
    color: "#475569",
  },

  monthTabTextActive: {
    fontWeight: "700",
    color: "#ffffff",
  },

  /* ================= 3-CARD CAROUSEL ================= */
  carouselContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginVertical: 6,
  },

  sideCardWrapper: {
    width: 360,
    opacity: 0.72,
    transform: [{ scale: 0.94 }],
    zIndex: 1,
  },

  leftCardWrapper: {
    marginRight: -40,
  },

  rightCardWrapper: {
    marginLeft: -40,
  },

  centerCardWrapper: {
    width: 560,
    maxWidth: "100%",
    zIndex: 10,
  },

  floatingNavButtonLeft: {
    position: "absolute",
    left: 20,
    top: "50%",
    marginTop: -22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 30,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.95)",
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 7,
  },

  floatingNavButtonRight: {
    position: "absolute",
    right: 20,
    top: "50%",
    marginTop: -22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 30,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.95)",
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 7,
  },

  /* ================= ACTIVE CENTER CARD ================= */
  activeCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(195,197,215,0.35)",
    shadowColor: "#0f172a",
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },

  activeCardHeader: {
    backgroundColor: "#182d56",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 26,
    paddingVertical: 18,
  },

  activeCardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  activeCardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
  },

  activeWorkDaysBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
  },

  activeWorkDaysText: {
    fontSize: 13,
    color: "#ffffff",
    fontWeight: "600",
  },

  activeCardBody: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 22,
  },

  /* ================= MINI SIDE CARDS ================= */
  miniCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.9)",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  miniCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
  },

  miniCardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  miniCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
  },

  miniWorkDaysBadge: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },

  miniWorkDaysText: {
    fontSize: 11.5,
    color: "#1d4ed8",
    fontWeight: "600",
  },

  /* ================= CALENDAR HEADERS & GRID ================= */
  weekHeader: {
    flexDirection: "row",
    paddingBottom: 10,
    marginBottom: 4,
  },

  weekDay: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
  },

  weekDayWeekend: {
    color: "#dc2626",
  },

  miniWeekHeader: {
    flexDirection: "row",
    paddingBottom: 6,
    marginBottom: 3,
  },

  miniWeekDay: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },

  miniWeekDayWeekend: {
    color: "#dc2626",
  },

  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  calendarDayCell: {
    width: "14.2857%",
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
    position: "relative",
  },

  dayWeekendCol: {
    backgroundColor: "#fff1f2",
  },

  miniDayWeekendCol: {
    backgroundColor: "#fff1f2",
  },

  dayContentBox: {
    width: 42,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  dayNumberText: {
    fontSize: 15.5,
    fontWeight: "600",
  },

  miniDayNumberText: {
    fontSize: 12.5,
  },

  dayTextNormal: {
    color: "#2563eb",
  },

  miniDayTextNormal: {
    color: "#2563eb",
  },

  dayTextOutside: {
    color: "#cbd5e1",
    fontWeight: "400",
  },

  dayTextWeekend: {
    color: "#dc2626",
    fontWeight: "700",
  },

  dayTextSpecial: {
    color: "#0f172a",
    fontWeight: "700",
  },

  pillToday: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    shadowColor: "#2563eb",
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 3,
  },

  dayTextToday: {
    color: "#ffffff",
    fontWeight: "800",
  },

  pillExam: {
    backgroundColor: "#ffedd5",
    borderRadius: 10,
  },

  dayTextExam: {
    color: "#c2410c",
    fontWeight: "700",
  },

  pillEvent: {
    backgroundColor: "#ede9fe",
    borderRadius: 10,
  },

  dayTextEvent: {
    color: "#6d28d9",
    fontWeight: "700",
  },

  pillHoliday: {
    backgroundColor: "#fee2e2",
    borderRadius: 10,
  },

  dayTextHoliday: {
    color: "#dc2626",
    fontWeight: "800",
  },

  dayBottomDot: {
    position: "absolute",
    bottom: 2,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },

  /* ================= CALENDAR LEGEND ================= */
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingHorizontal: 8,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  legendCircle: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },

  legendText: {
    fontSize: 12.5,
    color: "#475569",
    fontWeight: "500",
  },

  /* ================= ACTION BUTTONS ================= */
  actionContainer: {
    flexDirection: "row",
    gap: 16,
    marginTop: 16,
    width: "100%",
    maxWidth: 860,
    justifyContent: "center",
  },

  primaryButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#0256d0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    elevation: 3,
    shadowColor: "#0256d0",
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },

  syncedButton: {
    backgroundColor: "#16a34a",
  },

  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },

  secondaryButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "rgba(195,197,215,0.5)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    elevation: 1,
  },

  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0256d0",
  },

  /* ================= CAMPUS BANNER ================= */
  campusBanner: {
    height: 144,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: COLORS.surfaceContainerHigh,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },

  bannerImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  bannerGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },

  bannerContent: {
    flex: 1,
    padding: 16,
    justifyContent: "flex-end",
    flexDirection: "row",
    alignItems: "center",
  },

  bannerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  crestContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceContainerLowest,
    padding: 4,
    marginRight: 8,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },

  crestImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },

  portalTitle: {
    flex: 1,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600",
    color: COLORS.surface,
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(250,248,255,0.20)",
    marginLeft: 8,
  },

  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#34d399",
    marginRight: 5,
  },

  liveText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: COLORS.surface,
  },

  /* ================= CARDS ================= */
  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 12,
    padding: 16,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  overviewCardTitle: {
    marginLeft: 8,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  naacBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: COLORS.tertiaryFixed,
  },

  naacText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: COLORS.onTertiaryFixed,
  },

  /* ================= WEBSITE ================= */
  websiteButton: {
    minHeight: 56,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.primaryFixed,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  websiteLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },

  websiteTextContainer: {
    flex: 1,
    marginLeft: 8,
  },

  websiteTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: COLORS.onPrimaryFixed,
  },

  websiteSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: COLORS.onPrimaryFixedVariant,
    marginTop: 2,
  },

  /* ================= QFIX ================= */
  qfixHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  qfixLogoContainer: {
    height: 32,
    width: 130,
    justifyContent: "center",
  },

  qfixLogo: {
    height: "100%",
    width: "100%",
    resizeMode: "contain",
  },

  securedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: COLORS.secondaryContainer,
  },

  securedText: {
    marginLeft: 3,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: COLORS.onSecondaryContainer,
  },

  qfixDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
    color: COLORS.onSurfaceVariant,
  },

  qfixButton: {
    marginTop: 8,
    width: "100%",
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.primary,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },

  qfixButtonText: {
    marginLeft: 8,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    color: COLORS.onPrimary,
  },

  /* ================= STUDENT / STAFF ================= */
  portalToggle: {
    height: 44,
    padding: 4,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceContainerLow,
    flexDirection: "row",
    marginBottom: 12,
  },

  tabButton: {
    flex: 1,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },

  activeTab: {
    backgroundColor: COLORS.surfaceContainerLowest,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },

  tabText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    color: COLORS.onSurfaceVariant,
  },

  activeTabText: {
    color: COLORS.onSurface,
    fontWeight: "600",
  },

  regInput: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    paddingHorizontal: 12,

    fontSize: 14,
    color: COLORS.onSurface,
    backgroundColor: COLORS.surfaceContainerLowest,
  },

  /* ================= SEARCH ================= */
  searchContainer: {
    height: 48,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,

    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },

  searchInput: {
    flex: 1,
    height: 46,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.onSurface,
  },

  clearButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  /* ================= FILTER ================= */
  filterRow: {
    paddingVertical: 12,
    gap: 8,
  },

  filterChip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  activeFilter: {
    backgroundColor: COLORS.primary,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },

  inactiveFilter: {
    backgroundColor: COLORS.surfaceContainerLow,
  },

  filterText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
  },

  filterTextActive: {
    color: "#b5c4ff",
    fontWeight: "700",
  },

  activeFilterText: {
    color: "#b5c4ff",
    fontWeight: "700",
  },

  inactiveFilterText: {
    color: COLORS.onSurfaceVariant,
  },

  /* ================= URGENT ================= */
  urgentCard: {
    borderRadius: 12,
    backgroundColor: COLORS.tertiary,
    padding: 16,
    marginTop: 4,

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },

  urgentTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  urgentLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },

  urgentBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: COLORS.tertiaryFixed,
  },

  urgentBadgeText: {
    marginLeft: 4,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
    color: COLORS.onTertiaryFixed,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  controllerText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: COLORS.tertiaryFixed,
  },

  noticeTime: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: COLORS.tertiaryFixedDim,
  },

  noticeContent: {
    marginTop: 10,
  },

  noticeTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600",
    color: COLORS.onTertiary,
  },

  noticeDescription: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.onTertiary,
    opacity: 0.9,
  },

  reference: {
    marginTop: 12,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.tertiaryFixed,
    opacity: 0.8,
  },

  /* ================= GAZETTE ================= */
  gazetteHeader: {
    marginTop: 20,
    paddingHorizontal: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  gazetteTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  verifiedStatus: {
    flexDirection: "row",
    alignItems: "center",
  },

  blueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: 6,
  },

  verifiedText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
  },

  /* ================= CIRCULAR LIST ================= */
  circularList: {
    marginTop: 16,
    gap: 16,
  },

  circularCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 12,
    padding: 16,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },

  circularTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  departmentRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },

  departmentBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  badgeBlue: {
    backgroundColor: COLORS.primaryFixed,
  },

  badgeBlueDim: {
    backgroundColor: "#b5c4ff",
  },

  badgeGray: {
    backgroundColor: COLORS.secondaryContainer,
  },

  badgeOrange: {
    backgroundColor: COLORS.tertiaryFixedDim,
  },

  badgeBlueText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
  },

  badgeGrayText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.onSecondaryContainer,
  },

  badgeOrangeText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.tertiary,
  },

  departmentInfo: {
    flex: 1,
  },

  departmentName: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: COLORS.primary,
  },

  referenceText: {
    marginTop: 1,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.outline,
  },

  dateContainer: {
    alignItems: "flex-end",
    marginLeft: 8,
  },

  dateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceContainer,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.onSurfaceVariant,
  },

  dateTag: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 14,
    color: COLORS.outline,
  },

  placementTag: {
    color: COLORS.tertiary,
    fontWeight: "600",
  },

  /* ================= CIRCULAR CONTENT ================= */
  circularContent: {
    marginTop: 12,
  },

  circularTitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  circularDescription: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.onSurfaceVariant,
  },

  /* ================= FOOTER ================= */
  circularFooter: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainer,
  },

  footerContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  /* ================= NO RESULTS ================= */
  noResults: {
    marginTop: 16,
    padding: 32,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainerLowest,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },

  folderIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  noResultsTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  noResultsDescription: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    maxWidth: 280,
  },

  resetButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },

  resetText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: COLORS.onPrimary,
  },

  /* ================= BOTTOM NAV ================= */
  bottomNavWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },

  bottomBlur: {
    overflow: "hidden",
    backgroundColor: "rgba(250,248,255,0.85)",
  },

  bottomNav: {
    height: 64,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 12,

    elevation: 4,
  },

  navItem: {
    minWidth: 56,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  navLabel: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
  },

  activeNavLabel: {
    color: COLORS.primary,
  },

  inactiveNavLabel: {
    color: COLORS.onSurfaceVariant,
  },

  /* ================= PORTAL OVERRIDES ================= */
  headerWrapperPortal: {
    backgroundColor: "transparent",
  },
  headerBlurPortal: {
    backgroundColor: "rgba(10, 20, 45, 0.40)",
    borderBottomWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  headerBackBtn: {
    marginRight: 10,
    padding: 6,
    borderRadius: 20,
    backgroundColor: "rgba(59, 109, 201, 0.08)",
  },
  headerBackBtnPortal: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  logoCirclePortal: {
    backgroundColor: "#ffffff",
  },
  nexusTextPortal: {
    color: "#ffffff",
  },
  collegeTextPortal: {
    color: "#38bdf8",
  },
  notificationButtonPortal: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  bottomNavWrapperPortal: {
    backgroundColor: "transparent",
  },
  bottomBlurPortal: {
    backgroundColor: "rgba(10, 20, 45, 0.75)",
    borderTopWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  hubHeader: {
    maxWidth: 1400,
    width: "100%",
    marginHorizontal: "auto",
  },
  hubBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "#dbe6ff",
  },
  hubBadgePortal: {
    backgroundColor: "rgba(56, 189, 248, 0.25)",
  },
  hubBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#003fb1",
    letterSpacing: 0.5,
  },
  hubBadgeTextPortal: {
    color: "#38bdf8",
  },
});
