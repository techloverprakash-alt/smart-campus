import React, { useState, useEffect, useMemo } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Modal,
  Pressable,
} from '@/ui';
import { MaterialIcons } from '@/ui';
import { BlurView } from '@/ui';
import StudentBottomNav from "../../../components/common/StudentBottomNav";
import { useAuth } from "../../auth/context/AuthContext";
import { getMaterials } from "../../../services/api/materials";

const COLORS = {
  primary: "#003fb1",
  primaryContainer: "#1a56db",
  primaryFixed: "#dbe1ff",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#d4dcff",

  surface: "#faf8ff",
  surfaceBright: "#faf8ff",
  surfaceLowest: "#ffffff",
  surfaceLow: "#f3f3fe",
  surfaceContainer: "#ededf8",
  surfaceContainerHigh: "#e7e7f3",
  surfaceContainerHighest: "#e2e1ed",

  onSurface: "#191b23",
  onSurfaceVariant: "#434654",

  secondaryContainer: "#dce2f3",
  onSecondaryContainer: "#5e6572",
  secondaryFixed: "#dce2f3",
  onSecondaryFixed: "#151c27",

  tertiary: "#852b00",
  error: "#ba1a1a",
};

const LOGO_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuANdWs9FsNCaoAEBH-d9jjOGNGHTECsPM5IBwpJZ8hGqWi5BU4XLsXoaZhn9Oj3Tl9ZiK4tWrjXASrpYcWSeB-4H5TuTOP_3_F-HFZDDAoTANGqXUs9Itaneg-eQUPrdgkpGTGMcJaBp7mFQkmNSlvLN2wHxfwOnW9oLojQsVvmLjPbV7DiGhYaNHNlHp7CWp-TtswVdW5UDM4P9f_lTYd9BTzywk-v6kHE3bO2smiq3IZsLXaiXBlsChR7BG6NiYKgDw";

const notes = [
  {
    code: "CS3351",
    unit: "Unit 1",
    title: "Introduction to Machine Learning & Supervised Algorithms",
    instructor: "Dr. Sarah Williams",
    pages: "48 Pages",
    reads: "1.4k reads",
    icon: "picture-as-pdf",
    type: "PDF",
    previewTitle: "Syllabus Mapping: Module 1-3",
    preview:
      "Gradient Descent, Convex Optimization, Logistic Boundary, Polynomial Curve Fitting matrices.",
    modalTitle: "CS3351 • Unit 1: Introduction to Machine Learning",
    showButton: true,
  },
  {
    code: "AD3401",
    unit: "Unit 2",
    title: "Deep Convolutional Architectures & Backpropagation",
    instructor: "Dr. Arulprakash P",
    pages: "56 Pages",
    reads: "980 reads",
    icon: "layers",
    type: "SLIDES",
    previewTitle: "Conv2D Kernel Math & ResNet Heuristics",
    preview:
      "Feature extraction stages, stride, dilation, pooling operators, vanishing gradients fix.",
    modalTitle: "AD3401 • Unit 2: Deep Conv Architectures",
    showButton: true,
  },
  {
    code: "MA3354",
    unit: "Unit 3",
    title: "Graph Theory & Combinatorics Hand-written Faculty Notes",
    instructor: "Prof. Sangeetha M",
    pages: "38 Pages",
    reads: "2.1k reads",
    icon: "draw",
    type: "NOTES",
    previewTitle: "Eulerian & Hamiltonian Solved Proofs",
    preview:
      "Handwritten step-by-step vertex traversal equations with isomorphism matrix demonstrations.",
    modalTitle: "MA3354 • Unit 3: Graph Theory & Combinatorics",
    showButton: true,
  },
  {
    code: "AD3411",
    unit: "Lab Manual",
    title: "PyTorch & GPU Cluster Model Optimization Guide",
    instructor: "Dr. Sarah Williams",
    pages: "64 Pages",
    reads: "854 reads",
    icon: "terminal",
    type: "LAB CODE",
    previewTitle: "Exercise 1 through 10 Runbooks",
    preview:
      "CUDA kernels initiation, multi-node distributed data parallel setups, model quantization steps.",
    modalTitle: "AD3411 • Lab Manual: PyTorch GPU Optimization",
    showButton: true,
  },
  {
    code: "CS3391",
    unit: "Unit 4",
    title: "Design Patterns & Multithreading Concurrency in Java",
    instructor: "Mr. Vasanth V",
    pages: "42 Pages",
    reads: "1.7k reads",
    icon: "integration-instructions",
    type: "DOC",
    previewTitle: "Producer-Consumer & Factory Pattern",
    preview:
      "Thread synchronization blocks, race condition avoidance, lock reentrancy diagrams.",
    modalTitle: "CS3391 • Unit 4: Design Patterns & Multithreading",
    showButton: true,
  },
];

const questionPapers = [
  {
    code: "CS3351",
    unit: "Nov/Dec 2023",
    title: "CS3351 Machine Learning - University Question Paper & Key",
    instructor: "Dept. Exam Cell",
    pages: "12 Pages",
    reads: "3.2k reads",
    icon: "quiz",
    type: "QP + KEY",
    previewTitle: "Part A & Part B Solved Solutions",
    preview:
      "Complete solved university exam paper with step-by-step mathematical proofs and marking schemes.",
    modalTitle: "CS3351 • Nov/Dec 2023 Question Paper",
    showButton: true,
  },
  {
    code: "AD3401",
    unit: "Apr/May 2024",
    title: "AD3401 Deep Learning - Model Question Paper with Solution",
    instructor: "Dr. Arulprakash P",
    pages: "16 Pages",
    reads: "1.9k reads",
    icon: "quiz",
    type: "MODEL QP",
    previewTitle: "Expected 13-Mark & 15-Mark Questions",
    preview:
      "ResNet architecture computations, backprop derivations, and attention mechanism case studies.",
    modalTitle: "AD3401 • Apr/May 2024 Model Question Paper",
    showButton: true,
  },
  {
    code: "MA3354",
    unit: "Nov/Dec 2023",
    title: "MA3354 Discrete Mathematics - Solved 5-Year Question Bank",
    instructor: "Prof. Sangeetha M",
    pages: "44 Pages",
    reads: "4.5k reads",
    icon: "quiz",
    type: "QP BANK",
    previewTitle: "Recurrence Relations & Graph Isomorphisms",
    preview:
      "Five years of Anna University end-semester question papers with complete hand-written solutions.",
    modalTitle: "MA3354 • 5-Year Solved Question Bank",
    showButton: true,
  },
  {
    code: "CS3391",
    unit: "Model QP",
    title: "CS3391 Object Oriented Programming - Model Exam Paper",
    instructor: "Mr. Vasanth V",
    pages: "14 Pages",
    reads: "2.3k reads",
    icon: "quiz",
    type: "MODEL QP",
    previewTitle: "Concurrency & Design Patterns Practice Paper",
    preview:
      "Threading questions, producer-consumer problem implementations, and class structure questions.",
    modalTitle: "CS3391 • OOP Model Question Paper",
    showButton: true,
  },
  {
    code: "AD3411",
    unit: "Lab Viva QP",
    title: "AD3411 AI & Deep Learning Laboratory - Viva Voce & Model Questions",
    instructor: "Dr. Sarah Williams",
    pages: "20 Pages",
    reads: "1.1k reads",
    icon: "quiz",
    type: "VIVA QP",
    previewTitle: "Comprehensive Viva Questions & Code Snippets",
    preview:
      "Complete set of external lab examination viva questions with PyTorch & CUDA optimization pointers.",
    modalTitle: "AD3411 • Lab Examination Viva Voce QP",
    showButton: true,
  },
];

const subjects = [
  { code: "all", label: "All Subjects" },
  { code: "CS3351", label: "CS3351 Machine Learning" },
  { code: "AD3401", label: "AD3401 Deep Learning" },
  { code: "MA3354", label: "MA3354 Discrete Maths" },
  { code: "CS3391", label: "CS3391 OOP" },
  { code: "AD3411", label: "AD3411 AI Lab" },
];

function Icon({ name, size = 20, color = COLORS.onSurfaceVariant }) {
  return (
    <MaterialIcons
      name={name}
      size={size}
      color={color}
    />
  );
}

function SubjectChip({ item, selected, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.subjectChip,
        selected
          ? styles.subjectChipActive
          : styles.subjectChipInactive,
      ]}
    >
      <Text
        style={[
          styles.subjectChipText,
          selected
            ? styles.subjectChipTextActive
            : styles.subjectChipTextInactive,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );
}

function NoteCard({ note, onRead }) {
  return (
    <View style={styles.noteCard}>
      <View style={styles.cardTop}>
        <View style={styles.cardTitleArea}>
          <View style={styles.badgeRow}>
            <View style={styles.codeBadge}>
              <Text style={styles.codeBadgeText}>{note.code}</Text>
            </View>

            <View style={styles.unitBadge}>
              <Text style={styles.unitBadgeText}>{note.unit}</Text>
            </View>

            <View style={styles.verifiedBadge}>
              <Icon
                name="verified"
                size={13}
                color={COLORS.primary}
              />
              <Text style={styles.verifiedText}>
                Faculty Verified
              </Text>
            </View>
          </View>

          <Text style={styles.noteTitle}>{note.title}</Text>
        </View>
      </View>

      <View style={styles.specRow}>
        <View style={styles.instructorRow}>
          <Icon
            name="person-outline"
            size={16}
            color={COLORS.primary}
          />
          <Text style={styles.specText}>
            {note.instructor}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Icon
              name="description"
              size={15}
              color={COLORS.onSurfaceVariant}
            />
            <Text style={styles.specText}>
              {note.pages}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Icon
              name="visibility"
              size={15}
              color={COLORS.onSurfaceVariant}
            />
            <Text style={styles.specText}>
              {note.reads}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.previewTile}>
        <View style={styles.fileIconBox}>
          <Icon
            name={note.icon}
            size={25}
            color={COLORS.primary}
          />

          <Text style={styles.fileType}>
            {note.type}
          </Text>
        </View>

        <View style={styles.previewContent}>
          <Text
            numberOfLines={1}
            style={styles.previewTitle}
          >
            {note.previewTitle}
          </Text>

          <Text
            numberOfLines={2}
            style={styles.previewText}
          >
            {note.preview}
          </Text>
        </View>
      </View>

      {note.showButton && (
        <View style={styles.cardActionRow}>
          <View style={styles.readOnlyRow}>
            <Icon
              name="lock"
              size={16}
              color={COLORS.tertiary}
            />

            <Text
              numberOfLines={2}
              style={styles.readOnlyText}
            >
              Read-Only: Offline download & editing disabled
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => onRead(note)}
            activeOpacity={0.8}
            style={styles.readButton}
          >
            <Icon
              name="visibility"
              size={18}
              color={COLORS.onPrimary}
            />

            <Text style={styles.readButtonText}>
              Read Online
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function ReaderModal({
  visible,
  note,
  onClose,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [bookmarked, setBookmarked] = useState(false);

  React.useEffect(() => {
    if (visible) {
      setCurrentPage(1);
      setBookmarked(false);
    }
  }, [visible]);

  if (!note) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />

        <View style={styles.readerContainer}>
          {/* Reader Action Bar */}
          <View style={styles.readerActionBar}>
            <View style={styles.readerTitleArea}>
              <Icon
                name="lock"
                size={20}
                color={COLORS.primary}
              />

              <View style={styles.readerTitleTextArea}>
                <Text
                  numberOfLines={1}
                  style={styles.modalDocTitle}
                >
                  {note.modalTitle}
                </Text>

                <Text style={styles.modalSubtitle}>
                  Encrypted Academic Viewport
                </Text>
              </View>
            </View>

            <View style={styles.readerActions}>
              <TouchableOpacity
                onPress={() =>
                  setBookmarked(!bookmarked)
                }
                style={[
                  styles.readerIconButton,
                  bookmarked &&
                    styles.readerIconButtonActive,
                ]}
              >
                <Icon
                  name={
                    bookmarked
                      ? "bookmark"
                      : "bookmark-add"
                  }
                  size={18}
                  color={
                    bookmarked
                      ? COLORS.primary
                      : COLORS.onSurfaceVariant
                  }
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onClose}
                style={styles.readerIconButton}
              >
                <Icon
                  name="close"
                  size={20}
                  color={COLORS.onSurfaceVariant}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Watermarked Reader */}
          <ScrollView
            style={styles.readerScroll}
            contentContainerStyle={styles.readerScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Watermark */}
            <View
              pointerEvents="none"
              style={styles.watermark}
            >
              <Text style={styles.watermarkLarge}>
                INFO INSTITUTE OF TECHNOLOGY
              </Text>

              <Text style={styles.watermarkSmall}>
                STUDENT COPY • READ-ONLY
              </Text>

              <Text style={styles.watermarkLarge}>
                AI & DS • DEPT ARCHIVE
              </Text>
            </View>

            {/* Document Paper */}
            <View style={styles.documentPaper}>
              <View style={styles.documentTopRow}>
                <View style={styles.annaBadge}>
                  <Icon
                    name="school"
                    size={14}
                    color="#00174d"
                  />
                  <Text style={styles.annaBadgeText}>
                    Anna Univ R-2021
                  </Text>
                </View>

                <View style={styles.drmRow}>
                  <Icon
                    name="security"
                    size={16}
                    color={COLORS.tertiary}
                  />
                  <Text style={styles.drmText}>
                    DRM Protected
                  </Text>
                </View>
              </View>

              <View style={styles.documentDivider} />

              <Text style={styles.moduleTitle}>
                Module 1.1: Supervised vs Unsupervised
                Inductive Learning
              </Text>

              <Text style={styles.documentParagraph}>
                In supervised paradigms, given an input
                space {"\\mathcal{X}"} and target domain{" "}
                {"\\mathcal{Y}"}, the learning agent
                determines a mapping function h: X → Y
                minimizing empirical risk over verified
                sample distributions.
              </Text>

              {/* Diagram */}
              <View style={styles.schemeContainer}>
                <View style={styles.diagram}>
                  <View style={styles.diagramCircle}>
                    <Text style={styles.diagramText}>
                      X_i
                    </Text>
                  </View>

                  <View style={styles.dashedLine} />

                  <View style={styles.modelBox}>
                    <Text style={styles.modelText}>
                      Model f(x; θ)
                    </Text>
                  </View>

                  <View style={styles.dashedLine} />

                  <View style={styles.diagramCircle}>
                    <Text style={styles.diagramText}>
                      Y_hat
                    </Text>
                  </View>
                </View>

                <Text style={styles.figureCaption}>
                  Figure 1.1: Classic Forward Prediction Feed
                </Text>
              </View>

              <Text style={styles.documentParagraph}>
                Gradient calculations across institutional
                tensors enforce bounded regularization to
                prevent distribution overfitting during batch
                descent iterations.
              </Text>
            </View>
          </ScrollView>

          {/* Pagination */}
          <View style={styles.paginationBar}>
            <View style={styles.paginationLeft}>
              <TouchableOpacity
                disabled={currentPage === 1}
                onPress={() =>
                  setCurrentPage(
                    Math.max(1, currentPage - 1)
                  )
                }
                style={[
                  styles.pageButton,
                  currentPage === 1 &&
                    styles.pageButtonDisabled,
                ]}
              >
                <Icon
                  name="chevron-left"
                  size={18}
                  color={COLORS.onSurface}
                />
              </TouchableOpacity>

              <Text style={styles.pageText}>
                Pg {currentPage} / 48
              </Text>

              <TouchableOpacity
                disabled={currentPage === 48}
                onPress={() =>
                  setCurrentPage(
                    Math.min(48, currentPage + 1)
                  )
                }
                style={[
                  styles.pageButton,
                  currentPage === 48 &&
                    styles.pageButtonDisabled,
                ]}
              >
                <Icon
                  name="chevron-right"
                  size={18}
                  color={COLORS.onSurface}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.paginationRight}>
              <TouchableOpacity
                style={styles.pageButton}
              >
                <Icon
                  name="zoom-in"
                  size={18}
                  color={COLORS.onSurface}
                />
              </TouchableOpacity>

              <View style={styles.downloadDisabled}>
                <Icon
                  name="file-download-off"
                  size={14}
                  color={COLORS.onSecondaryContainer}
                />

                <Text style={styles.downloadText}>
                  Downloads Disabled
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function StudyMaterials({ navigation }) {
  const { user, profile } = useAuth();
  const [liveMaterials, setLiveMaterials] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("all");

  const [selectedTab, setSelectedTab] =
    useState("notes");

  const [readerVisible, setReaderVisible] =
    useState(false);

  const [selectedNote, setSelectedNote] =
    useState(null);

  useEffect(() => {
    let isMounted = true;
    getMaterials()
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res) ? res : (res?.data || []);
        if (list && list.length > 0) {
          const mapped = list.map((m) => ({
            ...m,
            code: m.code || m.course_code || "GEN",
            unit: m.unit || `Unit ${m.unit_number || 1}`,
            title: m.title || "Study Material",
            instructor: m.instructor || "Faculty",
            pages: m.pages || "42 Pages",
            reads: m.reads || "1.4k reads",
            icon: m.icon || "picture-as-pdf",
            type: m.type || "PDF",
            previewTitle: m.previewTitle || `Syllabus Mapping: ${m.title || "Lecture Notes"}`,
            preview: m.preview || `Verified curriculum material for ${m.course_name || m.title}.`,
            modalTitle: m.modalTitle || `${m.code || "COURSE"} • ${m.unit || `Unit ${m.unit_number || 1}`}: ${m.title}`,
            showButton: true,
          }));
          setLiveMaterials(mapped);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch study materials:", err);
      });
    return () => { isMounted = false; };
  }, []);

  const dynamicSubjects = useMemo(() => {
    const list = [...subjects];
    if (liveMaterials && liveMaterials.length > 0) {
      liveMaterials.forEach((m) => {
        if (m.code && !list.some((s) => s.code === m.code)) {
          list.push({
            code: m.code,
            label: `${m.code} ${m.course_name || m.title || ""}`.trim(),
          });
        }
      });
    }
    return list;
  }, [liveMaterials]);

  const currentDataset =
    selectedTab === "notes"
      ? (liveMaterials.length > 0
          ? [...liveMaterials, ...notes.filter((n) => !liveMaterials.some((lm) => lm.code === n.code && lm.title === n.title))]
          : notes)
      : questionPapers;

  const filteredNotes =
    selectedSubject === "all"
      ? currentDataset
      : currentDataset.filter(
          (item) => item.code === selectedSubject
        );

  const openReader = (note) => {
    setSelectedNote(note);
    setReaderVisible(true);
  };

  const closeReader = () => {
    setReaderVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.surface}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => navigation?.navigate("StudentDashboard")}
          >
            <Icon name="arrow-back" size={22} color={COLORS.onSurface} />
          </TouchableOpacity>

          <View>
            <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.onSurface }}>
              Study Materials
            </Text>
            <Text style={styles.headerSubtitle}>
              Course notes, question papers & syllabus
            </Text>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.mainContent}
      >
        {/* Academic Context */}
        <View style={styles.contextCard}>
          <View style={styles.contextTop}>
            <View style={styles.contextLeft}>
              <Icon
                name="verified"
                size={22}
                color={COLORS.primary}
              />

              <View style={styles.contextText}>
                <Text style={styles.departmentText}>
                  {profile?.department?.name ? `Dept. of ${profile.department.name}` : 'Dept. of Artificial Intelligence & Data Science'}
                </Text>

                <Text style={styles.semesterText}>
                  {profile?.semester ? `Info Institute of Technology • Semester ${profile.semester}` : 'Info Institute of Technology • Semester 5'}
                </Text>
              </View>
            </View>

            <View style={styles.r2021Badge}>
              <Text style={styles.r2021Text}>
                R-2021
              </Text>
            </View>
          </View>

          <View style={styles.securityBanner}>
            <Icon
              name="lock-clock"
              size={18}
              color={COLORS.primary}
            />

            <Text style={styles.securityText}>
              Verified Faculty Lecture Notes • Read-Only
              Mode (Offline export disabled)
            </Text>
          </View>
        </View>

        {/* Segmented Navigation */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            onPress={() => setSelectedTab("notes")}
            style={[
              styles.segmentButton,
              selectedTab === "notes" &&
                styles.segmentButtonActive,
            ]}
          >
            <Icon
              name="menu-book"
              size={18}
              color={
                selectedTab === "notes"
                  ? COLORS.primary
                  : COLORS.onSurfaceVariant
              }
            />

            <Text
              style={[
                styles.segmentText,
                selectedTab === "notes" &&
                  styles.segmentTextActive,
              ]}
            >
              Lecture Notes & Slides
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedTab("qp")}
            style={[
              styles.segmentButton,
              selectedTab === "qp" &&
                styles.segmentButtonActive,
            ]}
          >
            <Icon
              name="quiz"
              size={18}
              color={
                selectedTab === "qp"
                  ? COLORS.primary
                  : COLORS.onSurfaceVariant
              }
            />

            <Text
              style={[
                styles.segmentText,
                selectedTab === "qp" &&
                  styles.segmentTextActive,
              ]}
            >
              Question Papers
            </Text>
          </TouchableOpacity>
        </View>

        {/* Subject Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {dynamicSubjects.map((item) => (
            <SubjectChip
              key={item.code}
              item={item}
              selected={
                selectedSubject === item.code
              }
              onPress={() =>
                setSelectedSubject(item.code)
              }
            />
          ))}
        </ScrollView>

        {/* Reading Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View style={styles.progressHeaderLeft}>
              <Icon
                name="history-edu"
                size={20}
                color={COLORS.primaryFixed}
              />

              <Text style={styles.progressLabel}>
                RECENTLY VIEWED MATERIAL
              </Text>
            </View>

            <View style={styles.pageBadge}>
              <Text style={styles.pageBadgeText}>
                Page 18 / 48
              </Text>
            </View>
          </View>

          <Text style={styles.progressTitle}>
            CS3351: Decision Trees & Ensembles
          </Text>

          <Text style={styles.progressSubtitle}>
            Dr. Sarah Williams • Last engaged 2 hours ago
          </Text>

          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
        </View>

        {/* Repository Heading */}
        <View style={styles.repositoryHeading}>
          <View style={styles.repositoryLeft}>
            <Icon
              name={selectedTab === "notes" ? "library-books" : "quiz"}
              size={20}
              color={COLORS.primary}
            />

            <Text style={styles.repositoryTitle}>
              {selectedTab === "notes" ? "Curriculum Notes Repository" : "University Question Papers"}
            </Text>
          </View>

          <Text style={styles.verifiedUnits}>
            {filteredNotes.length} {selectedTab === "notes" ? "Verified Units" : "Verified Papers"}
          </Text>
        </View>

        {/* Notes / QP List */}
        <View style={styles.notesList}>
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.code + note.unit}
              note={note}
              onRead={openReader}
            />
          ))}
        </View>

        {/* Institutional Notice */}
        <View style={styles.policyCard}>
          <View style={styles.policyIcon}>
            <Icon
              name="policy"
              size={20}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.policyContent}>
            <Text style={styles.policyTitle}>
              Academic Governance Policy
            </Text>

            <Text style={styles.policyText}>
              Anna University R-2021 Curriculum Notes & Question Banks.
              Maintained by Dept of AI & DS Faculty
              Committee. Watermarked and encrypted for
              student viewing only. Unauthorized
              duplication, printing, or digital
              redistribution is strictly prohibited under
              institutional cyber regulations.
            </Text>
          </View>
        </View>
      </ScrollView>

      <StudentBottomNav activeTab="materials" navigation={navigation} />

      {/* Reader */}
      <ReaderModal
        visible={readerVisible}
        note={selectedNote}
        onClose={closeReader}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },

  /* Header */
  header: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(250,248,255,0.94)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.03)",
    zIndex: 10,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
    backgroundColor: COLORS.surfaceContainer,
  },

  headerLogo: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceLowest,
    marginRight: 8,
  },

  nexusText: {
    fontSize: 18,
    lineHeight: 20,
    fontWeight: "700",
    color: COLORS.primaryContainer,
    letterSpacing: -0.5,
  },

  headerSubtitle: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
  },

  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  notificationDot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    top: 10,
    right: 10,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },

  /* Main */
  mainContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },

  /* Context Card */
  contextCard: {
    backgroundColor: COLORS.surfaceLowest,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    elevation: 2,
  },

  contextTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  contextLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    marginRight: 8,
  },

  contextText: {
    flex: 1,
    marginLeft: 8,
  },

  departmentText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  semesterText: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.onSurfaceVariant,
  },

  r2021Badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceContainer,
  },

  r2021Text: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
    letterSpacing: 0.5,
  },

  securityBanner: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(220,226,243,0.6)",
    flexDirection: "row",
    alignItems: "center",
  },

  securityText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    color: COLORS.onSecondaryContainer,
  },

  /* Segmented Navigation */
  segmentContainer: {
    backgroundColor: COLORS.surfaceContainer,
    padding: 4,
    borderRadius: 12,
    flexDirection: "row",
    marginBottom: 12,
  },

  segmentButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 8,
  },

  segmentButtonActive: {
    backgroundColor: COLORS.surfaceLowest,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    elevation: 1,
  },

  segmentText: {
    marginLeft: 6,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "500",
    color: COLORS.onSurfaceVariant,
  },

  segmentTextActive: {
    color: COLORS.primary,
    fontWeight: "600",
  },

  /* Chips */
  chipsContainer: {
    paddingBottom: 8,
    paddingRight: 16,
  },

  subjectChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    marginRight: 8,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    elevation: 1,
  },

  subjectChipActive: {
    backgroundColor: COLORS.primary,
  },

  subjectChipInactive: {
    backgroundColor: COLORS.surfaceLowest,
  },

  subjectChipText: {
    fontSize: 14,
    lineHeight: 20,
  },

  subjectChipTextActive: {
    color: COLORS.onPrimary,
    fontWeight: "600",
  },

  subjectChipTextInactive: {
    color: COLORS.onSurface,
    fontWeight: "500",
  },

  /* Progress */
  progressCard: {
    marginTop: 8,
    backgroundColor: COLORS.primaryContainer,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    overflow: "hidden",
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  progressHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  progressLabel: {
    marginLeft: 8,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: COLORS.primaryFixed,
    letterSpacing: 1,
  },

  pageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: "rgba(0,63,177,0.4)",
  },

  pageBadgeText: {
    fontSize: 12,
    color: COLORS.surfaceBright,
  },

  progressTitle: {
    marginTop: 12,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600",
    color: COLORS.surfaceBright,
  },

  progressSubtitle: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.onPrimaryContainer,
  },

  progressTrack: {
    marginTop: 12,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(0,63,177,0.5)",
    overflow: "hidden",
  },

  progressFill: {
    width: "37.5%",
    height: "100%",
    borderRadius: 4,
    backgroundColor: COLORS.primaryFixed,
  },

  /* Repository */
  repositoryHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  repositoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  repositoryTitle: {
    marginLeft: 8,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  verifiedUnits: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    color: COLORS.onSurfaceVariant,
  },

  /* Notes */
  notesList: {
    gap: 16,
  },

  noteCard: {
    backgroundColor: COLORS.surfaceLowest,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    elevation: 2,
  },

  cardTop: {
    flexDirection: "row",
  },

  cardTitleArea: {
    flex: 1,
  },

  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },

  codeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },

  codeBadgeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: COLORS.onPrimary,
  },

  unitBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceContainer,
  },

  unitBadgeText: {
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.onSurfaceVariant,
  },

  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: COLORS.secondaryFixed,
  },

  verifiedText: {
    marginLeft: 3,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    color: COLORS.onSecondaryFixed,
  },

  noteTitle: {
    marginTop: 8,
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  /* Specs */
  specRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  instructorRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  specText: {
    marginLeft: 5,
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.onSurfaceVariant,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  /* Preview */
  previewTile: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLow,
    flexDirection: "row",
    alignItems: "center",
  },

  fileIconBox: {
    width: 48,
    height: 56,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },

  fileType: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
  },

  previewContent: {
    flex: 1,
    marginLeft: 12,
  },

  previewTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  previewText: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.onSurfaceVariant,
  },

  /* Actions */
  cardActionRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  readOnlyRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  readOnlyText: {
    flex: 1,
    marginLeft: 4,
    fontSize: 11,
    lineHeight: 15,
    color: COLORS.onSurfaceVariant,
  },

  readButton: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },

  readButtonText: {
    marginLeft: 6,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: COLORS.onPrimary,
  },

  /* Policy */
  policyCard: {
    marginTop: 18,
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceContainer,
    flexDirection: "row",
  },

  policyIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainerHighest,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },

  policyContent: {
    flex: 1,
    marginLeft: 12,
  },

  policyTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  policyText: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.onSurfaceVariant,
  },

  /* Bottom Navigation */
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 70,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.04)",
    overflow: "hidden",
  },

  bottomNavInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
  },

  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
  },

  navItemActive: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
  },

  navText: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.onSurfaceVariant,
  },

  navTextActive: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.primaryContainer,
    fontWeight: "600",
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(46,48,57,0.60)",
    justifyContent: "flex-end",
  },

  readerContainer: {
    width: "100%",
    maxHeight: "88%",
    backgroundColor: COLORS.surfaceLowest,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: "hidden",
    elevation: 10,
  },

  readerActionBar: {
    minHeight: 60,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.surfaceLow,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  readerTitleArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },

  readerTitleTextArea: {
    flex: 1,
    marginLeft: 8,
  },

  modalDocTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  modalSubtitle: {
    marginTop: 1,
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.onSurfaceVariant,
  },

  readerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  readerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },

  readerIconButtonActive: {
    backgroundColor: COLORS.primaryFixed,
  },

  readerScroll: {
    backgroundColor: COLORS.surfaceBright,
  },

  readerScrollContent: {
    padding: 16,
    minHeight: 400,
  },

  watermark: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "space-around",
    opacity: 0.07,
    transform: [{ rotate: "-25deg" }],
  },

  watermarkLarge: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 2,
    textAlign: "center",
  },

  watermarkSmall: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 1,
    textAlign: "center",
  },

  documentPaper: {
    backgroundColor: COLORS.surfaceLowest,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    elevation: 1,
  },

  documentTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  annaBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: COLORS.primaryFixed,
  },

  annaBadgeText: {
    marginLeft: 4,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: "#00174d",
  },

  drmRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  drmText: {
    marginLeft: 4,
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.onSurfaceVariant,
  },

  documentDivider: {
    height: 2,
    backgroundColor: COLORS.surfaceContainer,
    marginVertical: 12,
  },

  moduleTitle: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  documentParagraph: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.onSurfaceVariant,
  },

  schemeContainer: {
    marginTop: 14,
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceLow,
    alignItems: "center",
  },

  diagram: {
    width: "100%",
    height: 96,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceContainer,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  diagramCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.surfaceLowest,
    borderWidth: 2,
    borderColor: COLORS.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },

  diagramText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.primary,
  },

  dashedLine: {
    width: 38,
    borderTopWidth: 1.5,
    borderStyle: "dashed",
    borderColor: COLORS.primaryContainer,
  },

  modelBox: {
    width: 90,
    height: 40,
    borderRadius: 5,
    backgroundColor: COLORS.surfaceLowest,
    borderWidth: 2,
    borderColor: COLORS.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },

  modelText: {
    fontSize: 9,
    fontWeight: "600",
    color: COLORS.primaryContainer,
  },

  figureCaption: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 16,
    fontStyle: "italic",
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
  },

  /* Pagination */
  paginationBar: {
    minHeight: 50,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.surfaceContainer,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  paginationLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  paginationRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  pageButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceLowest,
    alignItems: "center",
    justifyContent: "center",
  },

  pageButtonDisabled: {
    opacity: 0.4,
  },

  pageText: {
    marginHorizontal: 8,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  downloadDisabled: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: COLORS.secondaryContainer,
    flexDirection: "row",
    alignItems: "center",
  },

  downloadText: {
    marginLeft: 4,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    color: COLORS.onSecondaryContainer,
  },
});
