import React, { useState, useEffect } from "react";
import { getStudentAttendanceSummary } from '../../../services/api/attendance';
import { useAuth } from '../../auth/context/AuthContext';
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
  Dimensions,
} from '@/ui';
import { MaterialIcons } from '@/ui';
import StudentBottomNav from "../../../components/common/StudentBottomNav";


const PROFILE_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCVXP3laCjvBlZEVugtzpX20kCifG87-9yGGVWnUCmaIhNtCcDdG9HmCKcyaSa4oTc-QPnHNb5RR_pO0Xd8oVLNtxyVdxbttBW5KjbrzMiMJD0HcqApHxFuVbC5_KEUHnW0qOr98kurfIJ2NAVvw464MLzvDAN8LdJTSZXSqkbDkysN8V9Lzled9wZvQVwVorYcKfLMT1do8whwEUyopOcVpVMNt3wTCpl8mQ00dAziqalPOmZQTqcZ";

const STUDENT_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCVXP3laCjvBlZEVugtzpX20kCifG87-9yGGVWnUCmaIhNtCcDdG9HmCKcyaSa4oTc-QPnHNb5RR_pO0Xd8oVLNtxyVdxbttBW5KjbrzMiMJD0HcqApHxFuVbC5_KEUHnW0qOr98kurfIJ2NAVvw464MLzvDAN8LdJTSZXSqkbDkysN8V9Lzled9wZvQVwVorYcKfLMT1do8whwEUyopOcVpVMNt3wTCpl8mQ00dAziqalPOmZQTqcZ";

const QFIX_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBjVGZU-O3RWVwEN8AtBMnFwZXpsJcWo5krqtoRUqCI4sGUG2i9qP_iXMCZzNBh0De5pB8ecCaxZnblyuUjIuv1zFudR-yxR-PwfMNYbgOyLEhSH24OCCpfrezClp9nutwOp7nE5lVZ9KxpaW_5QiBp9wjHxvJmV6BNIzKcEE4f2kTMaQlv5hwbVMxWROvAyeLYVaWL2RTJBMv2gAuM0Iwb7g9RgO5kcVp94LBDKW82YYKioYc50XA4smckFXkC67LVXw";

import TIMETABLE_IMAGE from '@/assets/timetable-3yr.jpeg';

const services = [
  {
    key: "circulars",
    title: "Circulars",
    description: "Campus events, circulars, and AU exam alerts",
    icon: "campaign",
  },
  {
    key: "timetable",
    title: "Time Table",
    description: "Class timetable & CIE room arrangements",
    icon: "schedule",
  },
  {
    key: "calendar",
    title: "Academic Cal.",
    description: "Working days, holidays, & CIE milestone dates",
    icon: "calendar-month",
  },
  {
    key: "website",
    title: "Info IT Website",
    description: "Official portal, news, and campus press",
    icon: "language",
  },
  {
    key: "laurels",
    title: "Laurels & Wins",
    description: "NAAC grade, sports trophies, and hackathons",
    icon: "military-tech",
  },
  {
    key: "about",
    title: "About NEXUS",
    description: "Created by AI&DS students & faculty mentors",
    icon: "groups",
  },
];

const circularsData = [
  {
    date: "18 OCT 2024",
    title: "End-Semester Practical Examination Schedule",
    body: "Anna University Nov/Dec 2024 practical examinations for 3rd year AI & DS commence from 04-11-2024.",
    tag: "AU EXAM",
  },
  {
    date: "14 OCT 2024",
    title: "Internal Assessment CIE-3 Dates Announced",
    body: "Continuous Internal Evaluation (CIE-3) is scheduled between Oct 28 and Nov 02. Hall tickets will be issued based on 75% attendance.",
    tag: "ACADEMIC",
  },
  {
    date: "10 OCT 2024",
    title: "National Level AI Hackathon & Project Expo",
    body: "Info IT invites project entries for 'InnovAIte 2024'. Cash prizes worth INR 1,00,000 to be won.",
    tag: "EVENTS",
  },
];

const academicEvents = [
  { date: "Oct 28 - Nov 02", event: "Continuous Internal Evaluation (CIE-3)", status: "Upcoming" },
  { date: "Nov 04 - Nov 12", event: "Anna University Lab Practical Examinations", status: "Scheduled" },
  { date: "Nov 18", event: "Commencement of End-Semester Theory Exams", status: "Official" },
  { date: "Dec 15", event: "Winter Vacation & Internship Period Starts", status: "Tentative" },
];

function Header({ navigation }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View>
          <View style={styles.logoRow}>
            <Text style={styles.logo}>NEXUS</Text>

            <View style={styles.sceBadge}>
              <Text style={styles.sceBadgeText}>Info IT</Text>
            </View>
          </View>

          <Text style={styles.portalText}>
            Student Academic Portal
          </Text>
        </View>
      </View>

      <View style={styles.headerRight}>
        <TouchableOpacity
          style={styles.notificationButton}
          activeOpacity={0.7}
          onPress={() => navigation?.navigate("StudentProfile")}
        >
          <MaterialIcons
            name="notifications"
            size={22}
            color="#434654"
          />

          <View style={styles.notificationDot} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation?.navigate("StudentProfile")}
        >
          <Image
            source={{ uri: PROFILE_IMAGE }}
            style={styles.headerProfile}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function AcademicHeader() {
  return (
    <View style={styles.academicHeader}>
      <View style={styles.academicBadge}>
        <MaterialIcons
          name="school"
          size={14}
          color="#00174d"
        />

        <Text style={styles.academicBadgeText}>
          AY 2024–2025 • ODD SEM
        </Text>
      </View>

      <View style={styles.activeBadge}>
        <View style={styles.activeDot} />

        <Text style={styles.activeBadgeText}>
          Active Student
        </Text>
      </View>
    </View>
  );
}

function StudentProfileCard({ user, profile }) {
  const displayName = profile?.full_name || user?.profile?.full_name || user?.name || 'Student';
  const registerNumber = profile?.register_number || user?.identifier || user?.profile?.register_number || '—';
  const semSecText = profile?.semester
    ? `Semester ${profile.semester} • Section ${profile?.section || 'A'}`
    : 'Semester 5 • Section A';
  const departmentName = profile?.department?.name || 'Dept. of Artificial Intelligence & Data Science';
  const avatarUri = profile?.avatar_url || user?.profile?.avatar_url || STUDENT_IMAGE;

  return (
    <View style={styles.profileCard}>
      <View style={styles.profileTop}>
        <View style={styles.studentImageContainer}>
          <Image
            source={{ uri: avatarUri }}
            style={styles.studentImage}
          />

          <View style={styles.verifiedBadge}>
            <MaterialIcons
              name="verified"
              size={10}
              color="#ffffff"
            />
          </View>
        </View>

        <View style={styles.studentDetails}>
          <View style={styles.greetingRow}>
            <Text
              style={styles.studentName}
              numberOfLines={1}
            >
              HELLO, {displayName.toUpperCase()}
            </Text>

            <Text style={styles.wave}>👋</Text>
          </View>

          <Text
            style={styles.department}
            numberOfLines={1}
          >
            {departmentName}
          </Text>

          <Text
            style={styles.college}
            numberOfLines={1}
          >
            Info Institute of Technology • Anna Univ.
          </Text>
        </View>
      </View>

      <View style={styles.metadataGrid}>
        <View style={styles.metadataItem}>
          <Text style={styles.metadataLabel}>
            REGISTER NO.
          </Text>

          <Text style={styles.metadataValue}>
            {registerNumber}
          </Text>
        </View>

        <View style={styles.metadataItem}>
          <Text style={styles.metadataLabel}>
            SEMESTER / SEC
          </Text>

          <Text style={styles.metadataValue}>
            {semSecText}
          </Text>
        </View>
      </View>
    </View>
  );
}

function AttendanceOverview({ onPress, summary }) {
  const overallPct = summary?.overall_percentage ?? 0;
  // Backend uses total_attended_hours / total_conducted_hours
  const attended = summary?.total_attended_hours ?? 0;
  const total = summary?.total_conducted_hours ?? 0;
  // Compute safety runway from subjects array
  const canMiss = summary?.subjects?.length
    ? Math.min(...summary.subjects.map((s) => s.max_absences_allowed || 0))
    : 0;
  const zone = overallPct >= 85 ? 'Safe Zone' : overallPct >= 75 ? 'Caution' : 'At Risk';
  const zoneColor = overallPct >= 85 ? '#166534' : overallPct >= 75 ? '#c2410c' : '#b91c1c';
  return (
    <TouchableOpacity
      style={styles.attendanceSection}
      activeOpacity={0.88}
      onPress={onPress}
    >
      <View style={styles.attendanceCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.attendanceTitleRow}>
            <MaterialIcons name="how-to-reg" size={20} color="#003fb1" />
            <Text style={styles.sectionTitle}>
              Attendance Overview
            </Text>
          </View>

          <View style={styles.safeBadge}>
            <Text style={[styles.safeBadgeText, { color: zoneColor }]}>
              {zone} • {overallPct.toFixed(1)}%
            </Text>
          </View>
        </View>

        <View style={styles.attendanceBriefRow}>
          <View style={styles.briefItem}>
            <Text style={styles.briefVal}>{attended} / {total}</Text>
            <Text style={styles.briefLbl}>Sessions Attended</Text>
          </View>

          <View style={styles.briefDivider} />

          <View style={styles.briefItem}>
            <Text style={[styles.briefVal, { color: overallPct >= 75 ? '#166534' : '#b91c1c' }]}>
              {overallPct >= 75 ? 'Satisfied' : 'Below 75%'}
            </Text>
            <Text style={styles.briefLbl}>AU 75% Criteria</Text>
          </View>

          <View style={styles.briefDivider} />

          <View style={styles.briefItem}>
            <Text style={[styles.briefVal, { color: '#003fb1' }]}>
              {canMiss} Classes
            </Text>
            <Text style={styles.briefLbl}>Safety Runway</Text>
          </View>
        </View>

        <View style={styles.attendanceCTA}>
          <Text style={styles.attendanceCTAText}>View Course Breakdown & Daily Log</Text>
          <MaterialIcons name="chevron-right" size={18} color="#003fb1" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function ServiceHeader() {
  return (
    <View style={styles.serviceHeader}>
      <View style={styles.serviceHeaderTop}>
        <Text style={styles.sectionTitle}>
          Campus Services & Common Hub
        </Text>

        <Text style={styles.directoryText}>
          Info IT Directory
        </Text>
      </View>

      <Text style={styles.serviceSubtitle}>
        Quick access to institutional portals, notices, and utilities
      </Text>
    </View>
  );
}

function QFixCard({ onLaunch }) {
  return (
    <View style={styles.qfixCard}>
      <View style={styles.qfixImageContainer}>
        <Image
          source={{ uri: QFIX_IMAGE }}
          style={styles.qfixImage}
        />

        <View style={styles.imageOverlay} />

        <View style={styles.qfixImageBottom}>
          <Text style={styles.qfixTitle}>
            Q-Fix Student Desk
          </Text>

          <View style={styles.officialBadge}>
            <Text style={styles.officialText}>
              Official
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.qfixContent}>
        <Text style={styles.qfixDescription}>
          Fee payments, online receipts, scholarship tracking,
          and student grievance queries handled seamlessly.
        </Text>

        <View style={styles.qfixFooter}>
          <Text style={styles.poweredText}>
            Powered by Info Institute of Technology
          </Text>

          <TouchableOpacity
            style={styles.launchButton}
            activeOpacity={0.7}
            onPress={onLaunch}
          >
            <Text style={styles.launchText}>
              Launch Q-Fix
            </Text>

            <MaterialIcons
              name="open-in-new"
              size={16}
              color="#003fb1"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function ServiceCard({ title, description, icon, onPress }) {
  return (
    <TouchableOpacity
      style={styles.serviceCard}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={styles.serviceIcon}>
        <MaterialIcons
          name={icon}
          size={22}
          color="#003fb1"
        />
      </View>

      <View style={styles.serviceCardText}>
        <Text style={styles.serviceCardTitle}>
          {title}
        </Text>

        <Text
          style={styles.serviceCardDescription}
          numberOfLines={2}
        >
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function ServicesGrid({ onServicePress }) {
  return (
    <View style={styles.servicesGrid}>
      {services.map((service) => (
        <ServiceCard
          key={service.key}
          title={service.title}
          description={service.description}
          icon={service.icon}
          onPress={() => onServicePress(service.key)}
        />
      ))}
    </View>
  );
}

function CampusBanner() {
  return (
    <View style={styles.campusBanner}>
      <View style={styles.campusIcon}>
        <MaterialIcons
          name="workspace-premium"
          size={26}
          color="#00174d"
        />
      </View>

      <View style={styles.campusText}>
        <Text style={styles.campusTitle}>
          Serve • Create • Excel
        </Text>

        <Text style={styles.campusDescription}>
          Info Institute of Technology, Kalapatti Road, Coimbatore.
        </Text>
      </View>
    </View>
  );
}

function Footer() {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        NEXUS Info IT v2.4 • Built with dedication by Gnana Prakash, Esakki Muthu & Abishek
      </Text>
    </View>
  );
}

function BottomNavigation({ navigation }) {
  const bottomTabs = [
    { key: "home", title: "Home", icon: "dashboard" },
    { key: "attendance", title: "Attendance", icon: "how-to-reg" },
    { key: "materials", title: "Notes & QP", icon: "menu-book" },
    { key: "profile", title: "Profile", icon: "person" },
  ];

  return (
    <View className="bottom-nav" style={styles.bottomNavigation}>
      {bottomTabs.map((tab, index) => {
        const active = index === 0;

        return (
          <TouchableOpacity
            key={tab.title}
            style={styles.navItem}
            activeOpacity={0.7}
            onPress={() => {
              if (tab.key === "home") navigation?.navigate("StudentDashboard");
              else if (tab.key === "attendance") navigation?.navigate("StudentAttendanceDetail");
              else if (tab.key === "materials") navigation?.navigate("StudyMaterials");
              else if (tab.key === "profile") navigation?.navigate("StudentProfile");
            }}
          >
            <MaterialIcons
              name={tab.icon}
              size={24}
              color={active ? "#003fb1" : "#434654"}
            />

            <Text
              style={[
                styles.navText,
                active && styles.navTextActive,
              ]}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function StudentDashboard({ navigation }) {
  const { user, profile } = useAuth();
  const [activeModal, setActiveModal] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);

  // Fetch live attendance summary on mount
  useEffect(() => {
    let isMounted = true;
    getStudentAttendanceSummary()
      .then((data) => {
        if (isMounted) setAttendanceSummary(data);
      })
      .catch((err) => {
        console.error("Failed to fetch student attendance summary:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const openQFix = () => {
    Linking.openURL("https://www.eduqfix.com/PayDirect/#/student").catch((err) =>
      console.log("Could not open Q-Fix URL", err)
    );
  };

  const openSCE = () => {
    Linking.openURL("https://www.infotech.edu.in").catch((err) =>
      console.log("Could not open SCE URL", err)
    );
  };

  const handleServicePress = (key) => {
    if (key === "website") {
      openSCE();
    } else if (key === "timetable") {
      navigation?.navigate("StudentTimetable");
    } else {
      setActiveModal(key);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#faf8ff"
      />

      <Header navigation={navigation} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContainer}>
          {/* Student Greeting */}
          <View style={styles.greetingSection}>
            <AcademicHeader />
            <StudentProfileCard user={user} profile={profile} />
          </View>

          {/* Attendance Gateway */}
          <AttendanceOverview
            onPress={() => navigation?.navigate("StudentAttendanceDetail")}
            summary={attendanceSummary}
          />

          {/* Campus Services */}
          <View style={styles.servicesSection}>
            <ServiceHeader />
            <QFixCard onLaunch={openQFix} />
            <ServicesGrid onServicePress={handleServicePress} />
          </View>

          {/* Campus Banner */}
          <CampusBanner />

          {/* Footer */}
          <Footer />
        </View>
      </ScrollView>

      <StudentBottomNav activeTab="home" navigation={navigation} />

      {/* ================= MODALS ================= */}

      {/* Time Table Modal */}
      <Modal
        visible={activeModal === "timetable"}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setActiveModal(null)}
          />

          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <MaterialIcons name="schedule" size={22} color="#003fb1" />
                <Text style={styles.modalHeading}>Class Time Table • 3rd Year</Text>
              </View>
              <TouchableOpacity
                onPress={() => setActiveModal(null)}
                style={styles.modalCloseBtn}
              >
                <MaterialIcons name="close" size={20} color="#434654" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ maxHeight: '70vh' }}
              contentContainerStyle={{ padding: 16, alignItems: "center" }}
            >
              <View style={styles.timetableImageWrapper}>
                <Image
                  source={TIMETABLE_IMAGE}
                  style={styles.timetableImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.modalCaption}>
                Dept. of AI & DS • Odd Semester Timetable AY 2024-2025
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Circulars Modal */}
      <Modal
        visible={activeModal === "circulars"}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setActiveModal(null)}
          />

          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <MaterialIcons name="campaign" size={22} color="#003fb1" />
                <Text style={styles.modalHeading}>Official Campus Circulars</Text>
              </View>
              <TouchableOpacity
                onPress={() => setActiveModal(null)}
                style={styles.modalCloseBtn}
              >
                <MaterialIcons name="close" size={20} color="#434654" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ maxHeight: '70vh' }}
              contentContainerStyle={{ padding: 16, gap: 12 }}
            >
              {circularsData.map((c, i) => (
                <View key={i} style={styles.circularItem}>
                  <View style={styles.circularTop}>
                    <View style={styles.circularTag}>
                      <Text style={styles.circularTagText}>{c.tag}</Text>
                    </View>
                    <Text style={styles.circularDate}>{c.date}</Text>
                  </View>
                  <Text style={styles.circularTitle}>{c.title}</Text>
                  <Text style={styles.circularBody}>{c.body}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Academic Calendar Modal */}
      <Modal
        visible={activeModal === "calendar"}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setActiveModal(null)}
          />

          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <MaterialIcons name="calendar-month" size={22} color="#003fb1" />
                <Text style={styles.modalHeading}>Academic Calendar & Milestones</Text>
              </View>
              <TouchableOpacity
                onPress={() => setActiveModal(null)}
                style={styles.modalCloseBtn}
              >
                <MaterialIcons name="close" size={20} color="#434654" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ maxHeight: '70vh' }}
              contentContainerStyle={{ padding: 16, gap: 10 }}
            >
              {academicEvents.map((evt, i) => (
                <View key={i} style={styles.eventCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eventDate}>{evt.date}</Text>
                    <Text style={styles.eventName}>{evt.event}</Text>
                  </View>
                  <View style={styles.eventBadge}>
                    <Text style={styles.eventBadgeText}>{evt.status}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Laurels & Wins Modal */}
      <Modal
        visible={activeModal === "laurels"}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setActiveModal(null)}
          />

          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <MaterialIcons name="military-tech" size={22} color="#003fb1" />
                <Text style={styles.modalHeading}>Laurels & Institutional Wins</Text>
              </View>
              <TouchableOpacity
                onPress={() => setActiveModal(null)}
                style={styles.modalCloseBtn}
              >
                <MaterialIcons name="close" size={20} color="#434654" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ maxHeight: '70vh' }}
              contentContainerStyle={{ padding: 16, gap: 12 }}
            >
              <View style={styles.laurelCard}>
                <MaterialIcons name="emoji-events" size={28} color="#d97706" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.laurelTitle}>Smart India Hackathon 2024</Text>
                  <Text style={styles.laurelSubtitle}>1st Prize in AI & Computer Vision Category by Dept. of AI&DS team.</Text>
                </View>
              </View>

              <View style={styles.laurelCard}>
                <MaterialIcons name="verified" size={28} color="#003fb1" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.laurelTitle}>NAAC 'A' Grade Accredited</Text>
                  <Text style={styles.laurelSubtitle}>Info Institute of Technology recognized for academic excellence & research infrastructure.</Text>
                </View>
              </View>

              <View style={styles.laurelCard}>
                <MaterialIcons name="stars" size={28} color="#166534" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.laurelTitle}>Anna University Zonal Sports</Text>
                  <Text style={styles.laurelSubtitle}>Overall Athletics Championship Winner 2024.</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* About NEXUS Modal */}
      <Modal
        visible={activeModal === "about"}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setActiveModal(null)}
          />

          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <MaterialIcons name="groups" size={22} color="#003fb1" />
                <Text style={styles.modalHeading}>About NEXUS Portal</Text>
              </View>
              <TouchableOpacity
                onPress={() => setActiveModal(null)}
                style={styles.modalCloseBtn}
              >
                <MaterialIcons name="close" size={20} color="#434654" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ maxHeight: '70vh' }}
              contentContainerStyle={{ padding: 16, gap: 12 }}
            >
              <Text style={styles.aboutDesc}>
                NEXUS is the next-generation Academic Governance & Student Campus Hub for Info Institute of Technology. Engineered with modern real-time tracking for attendance, verified curriculum lecture notes, and seamless institutional portals.
              </Text>

              <View style={styles.creditsCard}>
                <Text style={styles.creditsHeading}>Core Development Team</Text>
                <Text style={styles.creditsText}>• Gnana Prakash V (AI & DS)</Text>
                <Text style={styles.creditsText}>• Esakki Muthu M (AI & DS)</Text>
                <Text style={styles.creditsText}>• Abishek R K (AI & DS)</Text>
                <Text style={[styles.creditsHeading, { marginTop: 8 }]}>Faculty Mentors</Text>
                <Text style={styles.creditsText}>• Dr. Arulprakash P, HOD AI & DS</Text>
                <Text style={styles.creditsText}>• Mr. Vasanth V, Assistant Professor</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#faf8ff",
  },

  scrollView: {
    flex: 1,
    backgroundColor: "#faf8ff",
  },

  scrollContent: {
    paddingTop: 64,
    paddingBottom: 90,
  },

  mainContainer: {
    width: "100%",
    paddingHorizontal: 16,
    gap: 20,
  },

  /* ================= HEADER ================= */

  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 64,
    zIndex: 100,
    elevation: 10,
    backgroundColor: "rgba(250,248,255,0.96)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.03)",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  logo: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "700",
    color: "#003fb1",
    letterSpacing: -0.5,
  },

  sceBadge: {
    backgroundColor: "#e7e7f3",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  sceBadgeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: "#434654",
  },

  portalText: {
    marginTop: 1,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: "#585f6c",
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#ba1a1a",
  },

  headerProfile: {
    width: 34,
    height: 34,
    borderRadius: 17,
    resizeMode: "cover",
    backgroundColor: "#e7e7f3",
  },

  /* ================= GREETING ================= */

  greetingSection: {
    gap: 14,
  },

  academicHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  academicBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "#dbe1ff",
  },

  academicBadgeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: "#00174d",
    letterSpacing: 0.3,
  },

  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "#dce2f3",
  },

  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#003fb1",
  },

  activeBadgeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: "#5e6572",
  },

  /* ================= PROFILE ================= */

  profileCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    elevation: 2,
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    gap: 14,
  },

  profileTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  studentImageContainer: {
    width: 58,
    height: 58,
    position: "relative",
    flexShrink: 0,
  },

  studentImage: {
    width: 58,
    height: 58,
    borderRadius: 29,
    resizeMode: "cover",
    backgroundColor: "#e7e7f3",
  },

  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#1a56db",
    justifyContent: "center",
    alignItems: "center",
  },

  studentDetails: {
    flex: 1,
    minWidth: 0,
  },

  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  studentName: {
    flexShrink: 1,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
    color: "#191b23",
  },

  wave: {
    fontSize: 16,
    marginLeft: 4,
  },

  department: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: "#003fb1",
  },

  college: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "500",
    color: "#585f6c",
    marginTop: 1,
  },

  metadataGrid: {
    flexDirection: "row",
    gap: 8,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f3f3fe",
  },

  metadataItem: {
    flex: 1,
  },

  metadataLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
    color: "#585f6c",
  },

  metadataValue: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    color: "#191b23",
  },

  /* ================= ATTENDANCE ================= */

  attendanceSection: {
    width: "100%",
  },

  attendanceCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    elevation: 2,
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 1 },
    gap: 12,
  },

  attendanceTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    color: "#191b23",
  },

  safeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: "#dbe1ff",
  },

  safeBadgeText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
    color: "#00174d",
  },

  attendanceBriefRow: {
    flexDirection: "row",
    backgroundColor: "#f3f3fe",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    justifyContent: "space-around",
  },

  briefItem: {
    alignItems: "center",
  },

  briefVal: {
    fontSize: 14,
    fontWeight: "700",
    color: "#191b23",
  },

  briefLbl: {
    fontSize: 10,
    color: "#585f6c",
    marginTop: 2,
  },

  briefDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#e2e1ed",
  },

  attendanceCTA: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 2,
  },

  attendanceCTAText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#003fb1",
  },

  /* ================= SERVICES ================= */

  servicesSection: {
    gap: 10,
  },

  serviceHeader: {
    paddingHorizontal: 2,
    marginBottom: 4,
  },

  serviceHeaderTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  directoryText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: "#003fb1",
  },

  serviceSubtitle: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400",
    color: "#585f6c",
  },

  /* ================= Q-FIX ================= */

  qfixCard: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    elevation: 2,
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 1,
    },
  },

  qfixImageContainer: {
    width: "100%",
    height: 130,
    backgroundColor: "#e7e7f3",
    position: "relative",
    overflow: "hidden",
  },

  qfixImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  imageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 70,
    backgroundColor: "rgba(46,48,57,0.55)",
  },

  qfixImageBottom: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  qfixTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
    color: "#ffffff",
  },

  officialBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: "#1353d8",
  },

  officialText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
    color: "#ffffff",
  },

  qfixContent: {
    padding: 14,
    gap: 6,
  },

  qfixDescription: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400",
    color: "#434654",
  },

  qfixFooter: {
    paddingTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  poweredText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
    color: "#585f6c",
  },

  launchButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  launchText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    color: "#003fb1",
  },

  /* ================= SERVICE GRID ================= */

  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
    marginTop: 4,
  },

  serviceCard: {
    width: "48.5%",
    minHeight: 150,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    justifyContent: "space-between",
    gap: 8,
    elevation: 2,
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 1,
    },
  },

  serviceIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: "#f3f3fe",
    justifyContent: "center",
    alignItems: "center",
  },

  serviceCardText: {
    flex: 1,
  },

  serviceCardTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    color: "#191b23",
  },

  serviceCardDescription: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400",
    color: "#585f6c",
  },

  /* ================= CAMPUS BANNER ================= */

  campusBanner: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#f3f3fe",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  campusIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#dbe1ff",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },

  campusText: {
    flex: 1,
  },

  campusTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    color: "#191b23",
  },

  campusDescription: {
    marginTop: 1,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400",
    color: "#585f6c",
  },

  /* ================= FOOTER ================= */

  footer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
  },

  footerText: {
    textAlign: "center",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "500",
    color: "#585f6c",
  },

  /* ================= BOTTOM NAV ================= */

  bottomNavigation: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 68,
    zIndex: 100,
    elevation: 15,
    backgroundColor: "rgba(250,248,255,0.97)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(195,197,215,0.25)",
  },

  navItem: {
    width: 72,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },

  navText: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
    color: "#434654",
  },

  navTextActive: {
    color: "#003fb1",
  },

  /* ================= MODAL STYLES ================= */

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(25, 27, 35, 0.6)",
    justifyContent: "flex-end",
  },

  modalSheet: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingBottom: 20,
    elevation: 12,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#ededf8",
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
    backgroundColor: "#f3f3fe",
    alignItems: "center",
    justifyContent: "center",
  },

  timetableImageWrapper: {
    width: "100%",
    aspectRatio: 937 / 1302,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#faf8ff",
  },

  timetableImage: {
    width: "100%",
    height: "100%",
  },

  modalCaption: {
    marginTop: 10,
    fontSize: 12,
    color: "#585f6c",
    textAlign: "center",
  },

  circularItem: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f3f3fe",
    gap: 4,
  },

  circularTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  circularTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "#dbe1ff",
  },

  circularTagText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#00174d",
  },

  circularDate: {
    fontSize: 11,
    color: "#585f6c",
  },

  circularTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#191b23",
    marginTop: 2,
  },

  circularBody: {
    fontSize: 12,
    lineHeight: 17,
    color: "#434654",
  },

  eventCard: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f3f3fe",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  eventDate: {
    fontSize: 12,
    fontWeight: "700",
    color: "#003fb1",
  },

  eventName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#191b23",
    marginTop: 2,
  },

  eventBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: "#e7e7f3",
  },

  eventBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#434654",
  },

  laurelCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f3f3fe",
  },

  laurelTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#191b23",
  },

  laurelSubtitle: {
    fontSize: 12,
    color: "#434654",
    marginTop: 2,
  },

  aboutDesc: {
    fontSize: 13,
    lineHeight: 19,
    color: "#434654",
  },

  creditsCard: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f3f3fe",
    gap: 4,
    marginTop: 4,
  },

  creditsHeading: {
    fontSize: 13,
    fontWeight: "700",
    color: "#003fb1",
  },

  creditsText: {
    fontSize: 12,
    color: "#191b23",
  },
});
