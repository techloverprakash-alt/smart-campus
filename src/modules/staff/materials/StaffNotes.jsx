import React, { useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  Animated,
} from '@/ui';
import { MaterialIcons } from '@/ui';
import BottomNavBar from "../../../components/common/BottomNavBar";
import { useAuth } from "../../auth/context/AuthContext";

const FACULTY_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBs_nuDOZI8b0LXnGPwlVMAVvPv3x7Wwy3GRF14ZCT3QycxHWwSYQml_IqpVh65vsu37hppsz3ERw9tfu6VbVPZebxushWkfgRx4hqCIRt3gulDmO8Ijm8_vybY_AtMzAcA7FHaH964F7nb7xXOOtvkylYcLFkKCKvc5tKwELHDOO-a8DxwkjkdN0KiI8Irb5sH52aXRTSKJDO0qB1QGvUKxwxxNhftj8DZ8aKoy1LhOopLEGncHwIM";

const MODERATION_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAf-VhdXhm-SK4dkn9NNo4P2xeJUpHjNwTr2U4CIWrs7gP1Yibi5cqpbuSqROGySVRb6BUA96oKXD_A_3_FWBVqK8FNXV_o6QmzBFKAxVpuT7m-buZHb9Skt9D1JnxQ8VgTUbi5U9GrCRtq3QMeL_Wpf4_uYyuaD2EolciiS-ovVoErvl3I708bvGIA6xDuWzBXDOgrGjxxn-mUDuSvs6Pttmek95OE-1MgaOw9NEu_TEXaYARD6_2G";

const papers = [
  {
    code: "CS3351",
    short: "ML",
    title: "Machine Learning",
    subtitle: "• Set A & B",
    regulation: "R-2021",
    session: "Nov/Dec 2023",
    color: "#dbe1ff",
    textColor: "#00174d",
    infoIcon: "format-list-numbered",
    info:
      "10 Part-A • 5 Part-B • Part-C Application",
    marks: "100M (3 Hrs)",
    verification: "Verified Answer Scheme Attached",
    views: "1.8k Views",
    verifyIcon: "verified",
    actions: [
      ["preview", "Read / Preview"],
      ["tune", "Edit Blueprint"],
      ["cloud-sync", "Replace QP PDF"],
      ["task-alt", "Upload Solved Key"],
    ],
  },
  {
    code: "AD3401",
    short: "DL",
    title: "Deep Learning & Neural Nets",
    subtitle: "• Regulation 2021",
    regulation: null,
    session: "Nov/Dec 2023",
    color: "#dce2f3",
    textColor: "#5e6572",
    infoIcon: "analytics",
    info:
      "CNNs, RNNs & Transformer Models Weightage",
    marks: "100 Marks",
    verification: "Anna University CoE Master Scheme Incl.",
    views: "940 Views",
    verifyIcon: "menu-book",
    actions: [
      ["preview", "Read / Preview"],
      ["pie-chart", "Edit Weightage"],
      ["edit-note", "Update QP Set"],
      ["file-upload", "Replace PDF"],
    ],
  },
  {
    code: "MA3354",
    short: "DM",
    title: "Discrete Mathematics",
    subtitle: "• Math & DS Core",
    regulation: null,
    session: "Apr/May 2023",
    color: "#e2e1ed",
    textColor: "#003fb1",
    infoIcon: "shapes",
    info:
      "Graph Theory, Boolean Algebra & Logic",
    marks: "100 Marks",
    verification: "Handwritten Proofs Verified",
    views: "2.4k Views",
    verifyIcon: "check-circle",
    actions: [
      ["description", "Read"],
      ["assignment-turned-in", "Update Key"],
      ["edit", "Metadata"],
    ],
  },
  {
    code: "AD3411",
    short: "LAB",
    title: "AI Lab Model Exam",
    subtitle: "• Practical Board",
    regulation: "Internal QP",
    session: "Model 2024",
    color: "#ffdbcf",
    textColor: "#380d00",
    infoIcon: "terminal",
    info:
      "Code Implementation + Viva Voce Rubric",
    marks: "100M Practical",
    verification: "Standard 50-30-20 Scheme",
    views: "410 Views",
    verifyIcon: "draw",
    actions: [
      ["checklist", "Read Rubric"],
      ["edit-note", "Edit Scheme"],
      ["sync-saved-locally", "Update QP"],
    ],
  },
];

const sessions = [
  "2023–2024 (Nov/Dec)",
  "2022–2023 (Regular)",
  "2021–2022",
  "Model Lab QPs",
];

const subjects = [
  "CS3351 - Machine Learning (Semester V)",
  "AD3401 - Deep Learning & Neural Networks (Sem VI)",
  "MA3354 - Discrete Mathematics (Sem III)",
  "AD3411 - AI Laboratory & Practice (Sem VI)",
  "CS3491 - Artificial Intelligence & Expert Systems",
];

const years = [
  "2023 - 2024",
  "2022 - 2023",
  "2021 - 2022",
  "2020 - 2021",
];

const examSessions = [
  "Nov / Dec (Winter)",
  "Apr / May (Summer)",
  "Special Supplementary",
  "Model Practical Lab",
];

function Header({ navigation, user, profile }) {
  const deptName = profile?.department?.name || "AI & DS Faculty";
  const avatarUrl = profile?.avatar_url || user?.profile?.avatar_url || FACULTY_IMAGE;

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() => {
            if (navigation && navigation.canGoBack()) navigation.goBack();
            else navigation?.navigate("StaffDashboard");
          }}
        >
          <MaterialIcons name="arrow-back" size={22} color="#191b23" />
        </TouchableOpacity>

        <View style={styles.schoolIconBox}>
          <MaterialIcons
            name="school"
            size={22}
            color="#003fb1"
          />
        </View>

        <View style={styles.headerTitles}>
          <Text style={styles.nexusTitle}>NEXUS</Text>

          <View style={styles.notesTitleRow}>
            <Text style={styles.notesTitle}>
              Notes & QP
            </Text>

            <Text style={styles.facultyText}>
              {`• ${deptName}`}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.headerRight}>
        <TouchableOpacity
          style={styles.notificationButton}
          activeOpacity={0.7}
          onPress={() => navigation?.navigate("StaffProfile")}
        >
          <MaterialIcons
            name="notifications"
            size={24}
            color="#434654"
          />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation?.navigate("StaffProfile")}
        >
          <Image
            source={{ uri: avatarUrl }}
            style={styles.facultyAvatar}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function TabToggle({ activeTab, onTabChange }) {
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={activeTab === "notes" ? styles.activeTab : styles.inactiveTab}
        onPress={() => onTabChange("notes")}
        activeOpacity={0.8}
      >
        <MaterialIcons
          name="description"
          size={20}
          color={activeTab === "notes" ? "#003fb1" : "#434654"}
        />

        <Text style={activeTab === "notes" ? styles.activeTabText : styles.inactiveTabText}>
          Lecture Notes
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={activeTab === "qp" ? styles.activeTab : styles.inactiveTab}
        onPress={() => onTabChange("qp")}
        activeOpacity={0.8}
      >
        <MaterialIcons
          name="quiz"
          size={20}
          color={activeTab === "qp" ? "#003fb1" : "#434654"}
        />

        <Text style={activeTab === "qp" ? styles.activeTabText : styles.inactiveTabText}>
          Question Papers
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function QuickActions({ scrollToUpload }) {
  return (
    <View style={styles.quickActions}>
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={scrollToUpload}
        activeOpacity={0.85}
      >
        <MaterialIcons
          name="upload-file"
          size={21}
          color="#ffffff"
        />

        <Text style={styles.uploadButtonText}>
          + Upload Question Paper / Notes
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.editBlueprintButton}
        activeOpacity={0.85}
        onPress={() => Alert.alert("Answer Keys & Blueprint", "Opening syllabus blueprint mapping interface...")}
      >
        <MaterialIcons
          name="account-tree"
          size={21}
          color="#003fb1"
        />

        <Text style={styles.editBlueprintText}>
          Edit Answer Keys & Blueprint
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function ModerationBanner() {
  return (
    <View style={styles.moderationBanner}>
      <Image
        source={{ uri: MODERATION_IMAGE }}
        style={styles.moderationImage}
      />

      <View style={styles.moderationOverlay}>
        <Text style={styles.archiveLabel}>
          BOARD OF STUDIES ARCHIVE
        </Text>

        <Text style={styles.moderationTitle}>
          End-Semester QP Moderation
        </Text>

        <Text
          style={styles.moderationDescription}
          numberOfLines={1}
        >
          Double-blind scrutiny completed for April/May 2024 cycles.
        </Text>
      </View>
    </View>
  );
}

function SessionFilter({ selectedSession, onSelectSession }) {
  return (
    <View style={styles.filterSection}>
      <View style={styles.filterHeader}>
        <Text style={styles.filterTitle}>
          Filter By Session
        </Text>

        <MaterialIcons
          name="filter-list"
          size={20}
          color="#585f6c"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sessionScroll}
      >
        {sessions.map((session) => {
          const isSelected = selectedSession === session;
          return (
            <TouchableOpacity
              key={session}
              style={[styles.sessionChip, isSelected && styles.sessionChipActive]}
              onPress={() => onSelectSession(session)}
              activeOpacity={0.8}
            >
              <Text style={[styles.sessionChipText, isSelected && styles.sessionChipTextActive]}>
                {session}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function PaperCard({ paper }) {
  const handleAction = (action) => {
    Alert.alert(
      action,
      `${action} selected for ${paper.code} - ${paper.title}`
    );
  };

  return (
    <View style={styles.paperCard}>
      <View style={styles.paperHeader}>
        <View style={styles.paperHeaderLeft}>
          <View
            style={[
              styles.paperShort,
              {
                backgroundColor: paper.color,
              },
            ]}
          >
            <Text
              style={[
                styles.paperShortText,
                {
                  color: paper.textColor,
                },
              ]}
            >
              {paper.short}
            </Text>
          </View>

          <View style={styles.paperHeading}>
            <View style={styles.paperCodeRow}>
              <Text
                style={[
                  styles.paperCode,
                  {
                    color:
                      paper.code === "AD3411"
                        ? "#852b00"
                        : "#003fb1",
                  },
                ]}
              >
                {paper.code}
              </Text>

              <Text style={styles.paperSubtitle}>
                {paper.subtitle}
              </Text>

              {paper.regulation && (
                <View
                  style={[
                    styles.regulationBadge,
                    paper.code === "AD3411" && {
                      backgroundColor: "#ffb59a",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.regulationText,
                      paper.code === "AD3411" && {
                        color: "#852b00",
                      },
                    ]}
                  >
                    {paper.regulation}
                  </Text>
                </View>
              )}
            </View>

            <Text
              style={styles.paperTitle}
              numberOfLines={1}
            >
              {paper.title}
            </Text>
          </View>
        </View>

        <View style={styles.sessionBadge}>
          <Text style={styles.sessionBadgeText}>
            {paper.session}
          </Text>
        </View>
      </View>

      <View style={styles.paperInfoBox}>
        <View style={styles.infoRow}>
          <View style={styles.infoLeft}>
            <MaterialIcons
              name={paper.infoIcon}
              size={16}
              color="#003fb1"
            />

            <Text
              style={styles.infoText}
              numberOfLines={2}
            >
              {paper.info}
            </Text>
          </View>

          <Text
            style={[
              styles.marksText,
              paper.code === "AD3411" && {
                color: "#852b00",
              },
            ]}
          >
            {paper.marks}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoLeft}>
            <MaterialIcons
              name={paper.verifyIcon}
              size={15}
              color={
                paper.code === "MA3354"
                  ? "#852b00"
                  : "#585f6c"
              }
            />

            <Text
              style={[
                styles.verificationText,
                paper.code === "MA3354" && {
                  color: "#852b00",
                },
              ]}
              numberOfLines={2}
            >
              {paper.verification}
            </Text>
          </View>

          <View style={styles.viewsContainer}>
            <MaterialIcons
              name="visibility"
              size={14}
              color="#585f6c"
            />

            <Text style={styles.viewsText}>
              {paper.views}
            </Text>
          </View>
        </View>
      </View>

      <View
        style={[
          styles.actionsGrid,
          paper.actions.length === 3 &&
            styles.actionsGridThree,
        ]}
      >
        {paper.actions.map(([icon, title], index) => (
          <TouchableOpacity
            key={title}
            style={[
              styles.paperAction,
              index === 0 && styles.primaryPaperAction,
            ]}
            onPress={() => handleAction(title)}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name={icon}
              size={16}
              color={
                index === 0
                  ? "#00174d"
                  : title.includes("Upload") ||
                    title.includes("Replace")
                    ? "#003fb1"
                    : "#191b23"
              }
            />

            <Text
              style={[
                styles.paperActionText,
                index === 0 &&
                  styles.primaryPaperActionText,
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function Repository() {
  return (
    <View style={styles.repository}>
      <View style={styles.repositoryHeader}>
        <Text style={styles.repositoryTitle}>
          Active Repository Papers & Modules
        </Text>

        <Text style={styles.paperCount}>
          {papers.length} Verified Items
        </Text>
      </View>

      {papers.map((paper) => (
        <PaperCard
          key={paper.code}
          paper={paper}
        />
      ))}
    </View>
  );
}

function SelectBox({
  label,
  value,
  onPress,
}) {
  return (
    <View style={styles.selectField}>
      <Text style={styles.fieldLabel}>
        {label}
      </Text>

      <TouchableOpacity
        style={styles.selectBox}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text
          style={styles.selectText}
          numberOfLines={1}
        >
          {value}
        </Text>

        <MaterialIcons
          name="arrow-drop-down"
          size={22}
          color="#434654"
        />
      </TouchableOpacity>
    </View>
  );
}

function UploadForm({ uploadRef }) {
  const [subject, setSubject] = useState(subjects[0]);
  const [year, setYear] = useState(years[0]);
  const [examSession, setExamSession] = useState(
    examSessions[0]
  );

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploaded, setUploaded] = useState(false);

  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const chooseFromList = (
    title,
    options,
    current,
    setter
  ) => {
    Alert.alert(
      title,
      "",
      options.map((option) => ({
        text: option,
        onPress: () => setter(option),
      }))
    );
  };

  const simulateUpload = () => {
    if (uploading) return;

    setUploading(true);
    setUploaded(false);
    setProgress(0);

    let currentProgress = 0;

    const interval = setInterval(() => {
      currentProgress += 25;

      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);

        setTimeout(() => {
          setUploading(false);
          setUploaded(true);
        }, 250);
      }
    }, 250);
  };

  const handlePublish = () => {
    if (publishing) return;

    setPublishing(true);
    setPublished(false);

    setTimeout(() => {
      setPublishing(false);
      setPublished(true);

      Alert.alert(
        "Published Successfully",
        `${subject} has been verified and published to the student & faculty archive.`
      );

      setTimeout(() => {
        setPublished(false);
      }, 2500);
    }, 1200);
  };

  return (
    <View
      ref={uploadRef}
      style={styles.uploadSection}
    >
      <View style={styles.uploadHeading}>
        <View style={styles.uploadHeadingLeft}>
          <View style={styles.uploadIconBox}>
            <MaterialIcons
              name="post-add"
              size={19}
              color="#ffffff"
            />
          </View>

          <View>
            <Text style={styles.uploadTitle}>
              Upload & Scrutiny Submission
            </Text>

            <Text style={styles.uploadSubtitle}>
              CoE Examination Archive Verification Workflow
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.form}>
        <SelectBox
          label="Target Subject & Course Code"
          value={subject}
          onPress={() =>
            chooseFromList(
              "Select Subject",
              subjects,
              subject,
              setSubject
            )
          }
        />

        <View style={styles.twoColumn}>
          <SelectBox
            label="Exam Academic Year"
            value={year}
            onPress={() =>
              chooseFromList(
                "Select Academic Year",
                years,
                year,
                setYear
              )
            }
          />

          <SelectBox
            label="Exam Session"
            value={examSession}
            onPress={() =>
              chooseFromList(
                "Select Exam Session",
                examSessions,
                examSession,
                setExamSession
              )
            }
          />
        </View>

        <View style={styles.fileField}>
          <Text style={styles.fieldLabel}>
            Question Paper / Notes Document (.PDF / OCR Verified)
          </Text>

          <TouchableOpacity
            style={styles.dropZone}
            onPress={simulateUpload}
            activeOpacity={0.8}
          >
            <View style={styles.cloudUploadCircle}>
              <MaterialIcons
                name={
                  uploaded
                    ? "check-circle"
                    : uploading
                    ? "hourglass-top"
                    : "cloud-upload"
                }
                size={26}
                color="#003fb1"
              />
            </View>

            <Text style={styles.uploadText}>
              {uploaded
                ? "Document Attached & Verified by OCR"
                : "Tap to select or drop PDF Document"}
            </Text>

            <Text style={styles.uploadHint}>
              Maximum file size 25MB • Clean OCR Recommended
            </Text>

            {(uploading || uploaded) && (
              <View style={styles.progressWrapper}>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${progress}%`,
                      },
                    ]}
                  />
                </View>

                <Text
                  style={[
                    styles.progressText,
                    uploaded &&
                      styles.uploadedProgressText,
                  ]}
                >
                  {uploaded
                    ? "Verified: CS3351_NovDec2023_FullSet.pdf (14.2 MB) ready"
                    : `Uploading & Validating Bloom Taxonomies... ${progress}%`}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.blueprintSection}>
          <Text style={styles.fieldLabel}>
            Blueprint Allocation & Scrutiny
          </Text>

          <View style={styles.blueprintRow}>
            <View style={styles.blueprintItem}>
              <MaterialIcons
                name="check-circle"
                size={19}
                color="#003fb1"
              />

              <Text style={styles.blueprintText}>
                Part-A Verified
              </Text>
            </View>

            <View style={styles.blueprintItem}>
              <MaterialIcons
                name="check-circle"
                size={19}
                color="#003fb1"
              />

              <Text style={styles.blueprintText}>
                Part-B Verified
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.attestation}>
          <MaterialIcons
            name="verified-user"
            size={22}
            color="#003fb1"
          />

          <View style={styles.attestationText}>
            <Text style={styles.attestationTitle}>
              CoE Quality Attestation
            </Text>

            <Text style={styles.attestationDescription}>
              This submission will be reviewed and verified before appearing in the student and institutional repository.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.publishButton,
            published && styles.publishedButton,
          ]}
          onPress={handlePublish}
          disabled={publishing}
          activeOpacity={0.85}
        >
          <MaterialIcons
            name={
              publishing
                ? "progress-activity"
                : published
                ? "check"
                : "publish"
            }
            size={21}
            color="#ffffff"
          />

          <Text style={styles.publishText}>
            {publishing
              ? "Publishing..."
              : published
              ? "Published to Repository!"
              : "Publish to Student & Faculty Archive"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function BottomNavigation({ navigation }) {
  const tabs = [
    { key: "home", icon: "dashboard", title: "Home", screen: "StaffDashboard" },
    { key: "attendance", icon: "how-to-reg", title: "Attendance", screen: "MarkAttendance" },
    { key: "notes", icon: "menu-book", title: "Notes & QP", screen: "StaffNotes" },
    { key: "profile", icon: "person", title: "Profile", screen: "StaffProfile" },
  ];

  return (
    <View className="bottom-nav" style={styles.bottomNav}>
      {tabs.map((tab) => {
        const active = tab.key === "notes";

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.bottomItem}
            activeOpacity={0.7}
            onPress={() => {
              if (!active && tab.screen) {
                navigation?.navigate(tab.screen);
              }
            }}
          >
            <MaterialIcons
              name={tab.icon}
              size={24}
              color={active ? "#003fb1" : "#434654"}
            />

            <Text
              style={[
                styles.bottomText,
                active && styles.bottomTextActive,
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

export default function StaffNotes({ navigation }) {
  const { user, profile } = useAuth();
  const scrollViewRef = useRef(null);
  const uploadRef = useRef(null);
  const [activeTab, setActiveTab] = useState("qp");
  const [selectedSession, setSelectedSession] = useState(sessions[0]);

  const scrollToUpload = () => {
    if (
      scrollViewRef.current &&
      uploadRef.current
    ) {
      uploadRef.current.measureLayout(
        scrollViewRef.current,
        (x, y) => {
          scrollViewRef.current.scrollTo({
            y: Math.max(0, y - 20),
            animated: true,
          });
        },
        () => {}
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#faf8ff"
      />

      <Header navigation={navigation} user={user} profile={profile} />

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.main}>
          <ModerationBanner />

          <TabToggle activeTab={activeTab} onTabChange={setActiveTab} />

          <QuickActions
            scrollToUpload={scrollToUpload}
          />

          <SessionFilter
            selectedSession={selectedSession}
            onSelectSession={setSelectedSession}
          />

          <Repository />

          <UploadForm uploadRef={uploadRef} />
        </View>
      </ScrollView>

      <BottomNavBar activeItem="notes" navigation={navigation} />
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

  main: {
    paddingHorizontal: 16,
    gap: 16,
  },

  /* HEADER */

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
    flex: 1,
    minWidth: 0,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e7e7f3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  schoolIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    elevation: 1,
  },

  headerTitles: {
    flex: 1,
    minWidth: 0,
  },

  nexusTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
    color: "#003fb1",
    letterSpacing: -0.4,
  },

  notesTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  notesTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "600",
    color: "#191b23",
  },

  facultyText: {
    fontSize: 11,
    color: "#737686",
    marginLeft: 4,
    fontWeight: "500",
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
  },

  facultyAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    resizeMode: "cover",
    backgroundColor: "#e7e7f3",
  },

  /* MODERATION */

  moderationBanner: {
    width: "100%",
    height: 128,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    elevation: 2,
    marginTop: 4,
  },

  moderationImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  moderationOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    padding: 16,
    justifyContent: "center",
    backgroundColor: "rgba(25,27,35,0.67)",
  },

  archiveLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
    color: "#dbe1ff",
    letterSpacing: 1,
  },

  moderationTitle: {
    marginTop: 3,
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "700",
    color: "#faf8ff",
  },

  moderationDescription: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: "#d9d9e4",
  },

  /* TABS */

  tabContainer: {
    height: 48,
    padding: 4,
    borderRadius: 12,
    backgroundColor: "#ededf8",
    flexDirection: "row",
    elevation: 1,
  },

  inactiveTab: {
    flex: 1,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },

  activeTab: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    elevation: 1,
  },

  inactiveTabText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    color: "#434654",
  },

  activeTabText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: "#003fb1",
  },

  /* QUICK ACTIONS */

  quickActions: {
    gap: 8,
  },

  uploadButton: {
    height: 44,
    borderRadius: 12,
    backgroundColor: "#003fb1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    elevation: 2,
  },

  uploadButtonText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#ffffff",
  },

  editBlueprintButton: {
    height: 44,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#dbe1ff",
  },

  editBlueprintText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#003fb1",
  },

  /* FILTER */

  filterSection: {
    gap: 8,
  },

  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  filterTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#191b23",
  },

  sessionScroll: {
    gap: 8,
    paddingVertical: 2,
  },

  sessionChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#e7e7f3",
  },

  sessionChipActive: {
    backgroundColor: "#003fb1",
  },

  sessionChipText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: "#191b23",
  },

  sessionChipTextActive: {
    color: "#ffffff",
  },

  /* REPOSITORY */

  repository: {
    gap: 14,
  },

  repositoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  repositoryTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
    color: "#191b23",
  },

  paperCount: {
    fontSize: 12,
    fontWeight: "600",
    color: "#003fb1",
  },

  /* PAPER CARD */

  paperCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    gap: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 1,
    },
  },

  paperHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },

  paperHeaderLeft: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    minWidth: 0,
  },

  paperShort: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },

  paperShortText: {
    fontSize: 14,
    fontWeight: "700",
  },

  paperHeading: {
    flex: 1,
    minWidth: 0,
  },

  paperCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 5,
  },

  paperCode: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },

  paperSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: "#434654",
  },

  regulationBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: "#dce2f3",
  },

  regulationText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
    color: "#5e6572",
  },

  paperTitle: {
    marginTop: 2,
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "600",
    color: "#191b23",
  },

  sessionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#ededf8",
    flexShrink: 0,
  },

  sessionBadgeText: {
    fontSize: 11,
    lineHeight: 15,
    color: "#434654",
    fontWeight: "500",
  },

  paperInfoBox: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f3f3fe",
    gap: 5,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  infoLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: 0,
  },

  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    color: "#191b23",
  },

  marksText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#003fb1",
  },

  verificationText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    color: "#585f6c",
  },

  viewsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  viewsText: {
    fontSize: 12,
    color: "#585f6c",
  },

  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingTop: 4,
  },

  actionsGridThree: {
    flexDirection: "row",
  },

  paperAction: {
    width: "48%",
    height: 36,
    borderRadius: 8,
    backgroundColor: "#ededf8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 5,
  },

  primaryPaperAction: {
    backgroundColor: "#dbe1ff",
  },

  paperActionText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    color: "#191b23",
  },

  primaryPaperActionText: {
    fontWeight: "600",
    color: "#00174d",
  },

  /* UPLOAD FORM */

  uploadSection: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    gap: 16,
    elevation: 2,
    marginTop: 2,
  },

  uploadHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  uploadHeadingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },

  uploadIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#003fb1",
    justifyContent: "center",
    alignItems: "center",
  },

  uploadTitle: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "700",
    color: "#191b23",
  },

  uploadSubtitle: {
    marginTop: 1,
    fontSize: 12,
    lineHeight: 17,
    color: "#434654",
  },

  form: {
    gap: 14,
  },

  selectField: {
    flex: 1,
    gap: 4,
  },

  fieldLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: "#191b23",
  },

  selectBox: {
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#f3f3fe",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#191b23",
    marginRight: 4,
  },

  twoColumn: {
    flexDirection: "row",
    gap: 8,
  },

  fileField: {
    gap: 5,
  },

  dropZone: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f3f3fe",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  cloudUploadCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e2e1ed",
    justifyContent: "center",
    alignItems: "center",
  },

  uploadText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#191b23",
    textAlign: "center",
  },

  uploadHint: {
    fontSize: 12,
    lineHeight: 16,
    color: "#434654",
    textAlign: "center",
  },

  progressWrapper: {
    width: "100%",
    gap: 4,
  },

  progressTrack: {
    width: "100%",
    height: 6,
    borderRadius: 4,
    backgroundColor: "#e2e1ed",
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    backgroundColor: "#003fb1",
  },

  progressText: {
    fontSize: 12,
    lineHeight: 16,
    color: "#003fb1",
  },

  uploadedProgressText: {
    color: "#191b23",
  },

  blueprintSection: {
    gap: 8,
  },

  blueprintRow: {
    flexDirection: "row",
    gap: 8,
  },

  blueprintItem: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f3f3fe",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  blueprintText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#191b23",
  },

  attestation: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f3f3fe",
    flexDirection: "row",
    gap: 10,
  },

  attestationText: {
    flex: 1,
  },

  attestationTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#191b23",
  },

  attestationDescription: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    color: "#585f6c",
  },

  publishButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#003fb1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    elevation: 2,
  },

  publishedButton: {
    backgroundColor: "#852b00",
  },

  publishText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#ffffff",
  },

  /* BOTTOM NAVIGATION */

  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 64,
    zIndex: 100,
    elevation: 15,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },

  bottomItem: {
    minWidth: 64,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  bottomText: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "500",
    color: "#585f6c",
  },

  bottomTextActive: {
    color: "#003fb1",
    fontWeight: "700",
  },
});
