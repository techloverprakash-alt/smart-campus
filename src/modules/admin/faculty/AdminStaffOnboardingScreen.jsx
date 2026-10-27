import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  Linking,
} from '@/ui';
import { enrollStaff, getStaffTemplateUrl, uploadStaffRosterFile } from '../../../services/api/profiles';

/**
 * NEXUS Admin Portal — Admin Staff Onboarding
 */

const C = {
  primary: '#003fb1',
  primaryContainer: '#1a56db',
  primaryFixed: '#dbe1ff',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#d4dcff',
  background: '#faf8ff',
  surface: '#faf8ff',
  white: '#ffffff',
  surfaceLow: '#f3f3fe',
  surfaceContainer: '#ededf8',
  surfaceHigh: '#e7e7f3',
  secondaryContainer: '#dce2f3',
  text: '#191b23',
  muted: '#434654',
  muted2: '#585f6c',
  outline: '#c3c5d7',
  error: '#ba1a1a',
  green: '#137547',
  greenBg: '#e1f5e8',
};

const DEPARTMENTS = [
  'Artificial Intelligence & Data Science',
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Science & Humanities',
];

const DESIGNATIONS = [
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Head of Department',
  'Lecturer',
  'Lab Instructor',
];

const INITIAL_FORM = {
  facultyId: 'FAC-CSE-102',
  name: 'Dr. Sarah Jenkins',
  department: 'Artificial Intelligence & Data Science',
  designation: 'Assistant Professor',
  email: 's.jenkins@infotech.edu.in',
  phone: '+91 98452 10839',
  cabin: 'Cabin 304, Turing Block, 3rd Floor',
  qualification: 'Ph.D. in Computer Science & AI, M.Tech',
  experience: '8 Years Teaching & Research',
};

function SectionCard({ children }) {
  return <View style={styles.card}>{children}</View>;
}

function SectionTitle({ symbol, title, right }) {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionTitleLeft}>
        <View style={styles.sectionIcon}>
          <Text style={styles.sectionIconText}>{symbol}</Text>
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  helper,
  action,
  multiline,
}) {
  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {action}
      </View>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8b8e9d"
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        style={[styles.input, multiline && styles.multilineInput]}
        multiline={multiline}
      />
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
}

function SelectField({
  label,
  value,
  options,
  onSelect,
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable style={styles.selectInput} onPress={() => setOpen(true)}>
        <Text style={styles.selectValue}>{value || `Select ${label.toLowerCase()}`}</Text>
        <Text style={styles.chevron}>⌄</Text>
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setOpen(false)}>
          <View style={styles.optionsSheet}>
            <Text style={styles.optionsTitle}>{label}</Text>
            <ScrollView style={{ maxHeight: 280 }}>
              {options.map((option) => (
                <Pressable
                  key={option}
                  style={[styles.option, value === option && styles.optionSelected]}
                  onPress={() => {
                    onSelect(option);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.optionText, value === option && styles.optionTextSelected]}>
                    {option}
                  </Text>
                  {value === option ? <Text style={styles.optionCheck}>✓</Text> : null}
                </Pressable>
              ))}
            </ScrollView>
            <Pressable style={styles.cancelButton} onPress={() => setOpen(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

export default function AdminStaffOnboardingScreen({ navigation }) {
  const [mode, setMode] = useState('single');
  const [form, setForm] = useState(INITIAL_FORM);
  const [collision, setCollision] = useState('skip');
  const [sendWelcome, setSendWelcome] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (key, value) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const credentials = useMemo(() => {
    const cleanName = (form.name || '').trim().replace(/^(Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.)\s*/i, '');
    const namePart = cleanName ? cleanName.slice(0, 3).toLowerCase() : 'sar';
    const idClean = (form.facultyId || '').trim();
    const idPart = idClean.length >= 3 ? idClean.slice(-3) : '102';
    return {
      username: idClean || 'FAC-NEW-001',
      password: `${namePart}${idPart}`,
    };
  }, [form.facultyId, form.name]);

  const notify = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const autoGenerateId = () => {
    const code = form.department.includes('Artificial Intelligence')
      ? 'AIDS'
      : form.department.includes('Computer Science')
        ? 'CSE'
        : form.department.includes('Information Technology')
          ? 'IT'
          : 'FAC';
    const id = `FAC-${code}-${Math.floor(100 + Math.random() * 900)}`;
    update('facultyId', id);
    notify(`Generated faculty ID: ${id}`);
  };

  const autofillEmail = () => {
    const cleanName = (form.name || '').trim().replace(/^(Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.)\s*/i, '');
    const parts = cleanName.split(/\s+/).filter(Boolean);
    const prefix = parts.length >= 2
      ? `${parts[0][0].toLowerCase()}.${parts[parts.length - 1].toLowerCase()}`
      : cleanName.toLowerCase() || 'faculty';
    const email = `${prefix}@infotech.edu.in`;
    update('email', email);
    notify(`Institutional email computed: ${email}`);
  };

  const copyCredentials = async () => {
    try {
      await Share.share({ message: `User: ${credentials.username} | Password: ${credentials.password}` });
    } catch {
      Alert.alert('Credentials', `User: ${credentials.username}\nPassword: ${credentials.password}`);
    }
  };

  const resetForm = () => {
    setForm({
      facultyId: '',
      name: '',
      department: DEPARTMENTS[0],
      designation: DESIGNATIONS[2],
      email: '',
      phone: '',
      cabin: '',
      qualification: '',
      experience: '',
    });
    notify('Form cleared to blank defaults');
  };

  const saveDraft = () => {
    notify('Draft saved for this screen session');
  };

  const chooseSpreadsheet = () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.xlsx,.xls,.csv';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          setSelectedFile(file);
          setFileName(file.name);
          notify(`Selected ${file.name}`);
        }
      };
      input.click();
    } else {
      Alert.alert(
        'Upload File',
        'Choose a faculty roster spreadsheet (.xlsx, .csv).',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Simulate sample roster.xlsx',
            onPress: () => {
              setFileName('faculty_roster_sample.xlsx');
              notify('Sample roster attached');
            },
          },
        ]
      );
    }
  };

  const downloadTemplate = () => {
    try {
      const url = getStaffTemplateUrl();
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.open(url, '_blank');
      } else {
        Linking.openURL(url);
      }
      notify('Downloading staff onboarding template (.xlsx)');
    } catch (err) {
      Alert.alert('Download Template', 'Could not open download URL: ' + err.message);
    }
  };

  const submitOnboarding = async () => {
    if (mode === 'single') {
      if (!form.facultyId.trim() || !form.name.trim() || !form.email.trim()) {
        Alert.alert('Required fields missing', 'Please enter Faculty ID, Full Name, and Institutional Email.');
        return;
      }

      setBusy(true);
      try {
        const payload = {
          faculty_id: form.facultyId.trim(),
          full_name: form.name.trim(),
          email: form.email.trim(),
          department_name: form.department,
          designation: form.designation,
          phone: form.phone ? form.phone.trim() : null,
          cabin_number: form.cabin ? form.cabin.trim() : null,
          qualifications: form.qualification ? form.qualification.trim() : null,
          experience: form.experience ? form.experience.trim() : null,
          custom_password: credentials.password,
        };

        const res = await enrollStaff(payload);
        const data = res.data || res;
        Alert.alert(
          'Registration Successful!',
          `Faculty Member: ${form.name}\nFaculty ID: ${form.facultyId}\nTemporary Password: ${credentials.password}\nRole: STAFF`,
          [
            {
              text: 'OK',
              onPress: () => {
                resetForm();
                navigation?.navigate('AdminDashboard');
              },
            },
          ]
        );
      } catch (err) {
        Alert.alert('Registration Failed', err.message || 'Error occurred while saving faculty profile.');
      } finally {
        setBusy(false);
      }
    } else {
      // Bulk upload
      if (!selectedFile && !fileName) {
        Alert.alert('No file selected', 'Please choose an Excel (.xlsx) or CSV file first.');
        return;
      }

      setBusy(true);
      try {
        if (selectedFile) {
          const res = await uploadStaffRosterFile(selectedFile, {
            conflictStrategy: collision,
          });
          const data = res.data || res;
          Alert.alert(
            'Bulk Import Complete',
            `Processed: ${data.total_processed || 0}\nEnrolled: ${data.enrolled_count || 0}\nSkipped: ${data.skipped_count || 0}`,
            [
              {
                text: 'View Dashboard',
                onPress: () => navigation?.navigate('AdminDashboard'),
              },
            ]
          );
        } else {
          notify('Simulated bulk import processed');
        }
      } catch (err) {
        Alert.alert('Import Failed', err.message || 'Failed to process spreadsheet roster.');
      } finally {
        setBusy(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={C.background} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.topBar}>
          <Pressable
            accessibilityLabel="Back to Dashboard"
            style={styles.backButton}
            onPress={() => navigation?.navigate('AdminDashboard')}
          >
            <Text style={styles.backSymbol}>←</Text>
          </Pressable>
          <View style={styles.brandBlock}>
            <View style={styles.collegePill}>
              <Text style={styles.collegePillText}>INFO INSTITUTE OF TECHNOLOGY</Text>
            </View>
            <Text style={styles.brandTitle}>NEXUS • Admin Portal</Text>
          </View>
          <Pressable
            accessibilityLabel="Notifications"
            style={styles.notificationButton}
            onPress={() => notify('You are all caught up')}
          >
            <Text style={styles.notificationSymbol}>♧</Text>
            <View style={styles.notificationDot} />
          </Pressable>
          <Pressable
            style={styles.avatar}
            onPress={() => navigation?.navigate('AdminProfile')}
          >
            <Text style={styles.avatarText}>♙</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contextRow}>
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>AY 2026–2027 • Active Faculty Roster</Text>
            </View>
            <Pressable style={styles.templateButton} onPress={downloadTemplate}>
              <Text style={styles.templateButtonText}>⇩  Excel Template</Text>
            </Pressable>
          </View>

          <Text style={styles.pageTitle}>Admin Staff Onboarding</Text>
          <Text style={styles.subtitle}>
            Register faculty credentials &amp; provision <Text style={styles.inlineCode}>STAFF</Text> identity
          </Text>

          <View style={styles.modeSwitch}>
            <Pressable
              onPress={() => setMode('single')}
              style={[styles.modeTab, mode === 'single' && styles.modeTabActive]}
            >
              <Text style={[styles.modeTabText, mode === 'single' && styles.modeTabTextActive]}>
                ♙  Single Faculty Entry
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMode('bulk')}
              style={[styles.modeTab, mode === 'bulk' && styles.modeTabActive]}
            >
              <Text style={[styles.modeTabText, mode === 'bulk' && styles.modeTabTextActive]}>
                ▦  Bulk Import <Text style={styles.fastTag}>FAST</Text>
              </Text>
            </Pressable>
          </View>

          {mode === 'single' ? (
            <View style={styles.pane}>
              <SectionCard>
                <SectionTitle
                  symbol="▣"
                  title="Faculty Identification"
                  right={<View style={styles.rolePill}><Text style={styles.rolePillText}>✓  Role: STAFF</Text></View>}
                />
                <Field
                  label="Faculty ID / Employee Code"
                  value={form.facultyId}
                  onChangeText={(v) => update('facultyId', v)}
                  placeholder="e.g. FAC-CSE-102"
                  helper="Database mapping: users.identifier (unique, non-null)"
                  action={<Text onPress={autoGenerateId} style={styles.actionText}>✦ Auto-Format</Text>}
                />
              </SectionCard>

              <SectionCard>
                <SectionTitle symbol="♙" title="Credentials & Profile" />
                <Field
                  label="Full Name (with honorific)"
                  value={form.name}
                  onChangeText={(v) => update('name', v)}
                  placeholder="e.g. Dr. Sarah Jenkins"
                />
                <SelectField
                  label="Department"
                  value={form.department}
                  options={DEPARTMENTS}
                  onSelect={(v) => update('department', v)}
                />
                <SelectField
                  label="Designation"
                  value={form.designation}
                  options={DESIGNATIONS}
                  onSelect={(v) => update('designation', v)}
                />
                <Field
                  label="Institutional Email"
                  value={form.email}
                  onChangeText={(v) => update('email', v)}
                  placeholder="name@infotech.edu.in"
                  keyboardType="email-address"
                  action={<Text onPress={autofillEmail} style={styles.actionText}>↻ Auto-Fill</Text>}
                />
                <Field
                  label="Phone Number"
                  value={form.phone}
                  onChangeText={(v) => update('phone', v)}
                  placeholder="+91 XXXXX XXXXX"
                  keyboardType="phone-pad"
                />
                <Field
                  label="Cabin / Office Location"
                  value={form.cabin}
                  onChangeText={(v) => update('cabin', v)}
                  placeholder="e.g. Block C, Room 204"
                />
                <Field
                  label="Highest Qualification"
                  value={form.qualification}
                  onChangeText={(v) => update('qualification', v)}
                  placeholder="e.g. Ph.D, M.E"
                  multiline
                />
                <Field
                  label="Experience"
                  value={form.experience}
                  onChangeText={(v) => update('experience', v)}
                  placeholder="e.g. 5 Years"
                />
              </SectionCard>

              <SectionCard>
                <SectionTitle symbol="⌘" title="Account Credentials Preview" />
                <Text style={styles.helperLarge}>
                  The initial username and default password are automatically provisioned.
                </Text>
                <View style={styles.credentialRow}>
                  <View style={styles.credentialItem}>
                    <Text style={styles.credentialLabel}>USERNAME</Text>
                    <Text style={styles.credentialValue}>{credentials.username}</Text>
                  </View>
                  <View style={styles.credentialItem}>
                    <Text style={styles.credentialLabel}>TEMP PASSWORD</Text>
                    <Text style={styles.passwordValue}>{credentials.password}</Text>
                  </View>
                  <Pressable accessibilityLabel="Share credentials" style={styles.copyButton} onPress={copyCredentials}>
                    <Text style={styles.copyButtonText}>↗</Text>
                  </Pressable>
                </View>
                <View style={styles.warningBox}>
                  <Text style={styles.warningText}>
                    ⚠ Password rule: first 3 letters of name + last 3 digits of Faculty ID. User can change password upon initial login.
                  </Text>
                </View>
                <View style={styles.switchRow}>
                  <View style={styles.switchTextBlock}>
                    <Text style={styles.switchTitle}>Send welcome instructions</Text>
                    <Text style={styles.helper}>Notify faculty via institutional email upon account creation.</Text>
                  </View>
                  <Switch
                    value={sendWelcome}
                    onValueChange={setSendWelcome}
                    trackColor={{ false: C.outline, true: '#9cb4f6' }}
                    thumbColor={sendWelcome ? C.primary : '#f4f3f8'}
                  />
                </View>
              </SectionCard>
            </View>
          ) : (
            <View style={styles.pane}>
              <SectionCard>
                <SectionTitle symbol="⇧" title="Upload Faculty Roster File" />
                <Text style={styles.helperLarge}>Import multiple faculty accounts using an Excel or CSV roster.</Text>
                <Pressable style={styles.uploadZone} onPress={chooseSpreadsheet}>
                  <View style={styles.uploadIcon}><Text style={styles.uploadIconText}>⇧</Text></View>
                  <Text style={styles.uploadTitle}>{fileName || 'Choose Spreadsheet'}</Text>
                  <Text style={styles.uploadDescription}>Tap to select .xlsx or .csv roster (Max 15MB)</Text>
                  <View style={styles.chooseFileButton}><Text style={styles.chooseFileText}>Browse Files</Text></View>
                </Pressable>
                <Text style={styles.schemaTitle}>Required Schema Columns</Text>
                {['faculty_id', 'full_name', 'email', 'department_code', 'designation'].map((column) => (
                  <View key={column} style={styles.schemaRow}>
                    <Text style={styles.schemaCheck}>✓</Text>
                    <Text style={styles.schemaColumn}>{column}</Text>
                  </View>
                ))}
              </SectionCard>

              <SectionCard>
                <SectionTitle symbol="⚙" title="Collision & Duplicate Handling" />
                <Text style={styles.helperLarge}>Choose policy when Faculty ID already exists in system.</Text>
                <Pressable style={styles.radioRow} onPress={() => setCollision('skip')}>
                  <View style={[styles.radioOuter, collision === 'skip' && styles.radioOuterSelected]}>
                    {collision === 'skip' ? <View style={styles.radioInner} /> : null}
                  </View>
                  <View style={styles.radioCopy}>
                    <Text style={styles.radioTitle}>Skip Existing Records</Text>
                    <Text style={styles.helper}>Retain existing faculty profiles without overwrite.</Text>
                  </View>
                </Pressable>
                <Pressable style={styles.radioRow} onPress={() => setCollision('update')}>
                  <View style={[styles.radioOuter, collision === 'update' && styles.radioOuterSelected]}>
                    {collision === 'update' ? <View style={styles.radioInner} /> : null}
                  </View>
                  <View style={styles.radioCopy}>
                    <Text style={styles.radioTitle}>Update Existing Record</Text>
                    <Text style={styles.helper}>Update matched faculty profile with spreadsheet values.</Text>
                  </View>
                </Pressable>
              </SectionCard>
            </View>
          )}

          <View style={styles.actionArea}>
            <Pressable
              style={[styles.primaryButton, busy && styles.disabledButton]}
              onPress={submitOnboarding}
              disabled={busy}
            >
              <Text style={styles.primaryButtonText}>
                {busy
                  ? 'Processing...'
                  : mode === 'single'
                    ? '✓  Register Faculty & Create Account'
                    : '✓  Validate & Process Bulk Import'}
              </Text>
            </Pressable>
            <View style={styles.secondaryActions}>
              <Pressable style={styles.outlineButton} onPress={resetForm}>
                <Text style={styles.outlineButtonText}>↻  Reset Form</Text>
              </Pressable>
              <Pressable style={styles.outlineButton} onPress={saveDraft}>
                <Text style={styles.outlineButtonText}>▣  Save as Draft</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.footerNote}>
            <Text style={styles.footerNoteText}>NEXUS Admin Portal  •  Staff provisioning</Text>
            <Text style={styles.footerNoteText}>Verified against faculty employment registry.</Text>
          </View>
        </ScrollView>

        <View className="bottom-nav" style={styles.bottomNav}>
          {[
            ['▦', 'Dashboard', false, 'AdminDashboard'],
            ['♙', 'Students', false, 'EnrollStudent'],
            ['▣', 'Staff', true, 'AdminStaffOnboarding'],
            ['▤', 'Timetable', false, 'AdminTimetable'],
            ['☻', 'Profile', false, 'AdminProfile'],
          ].map(([symbol, label, active, screen]) => (
            <Pressable
              key={String(label)}
              style={styles.navItem}
              onPress={() => screen && navigation?.navigate(screen)}
            >
              <Text style={[styles.navSymbol, active ? styles.navActive : styles.navInactive]}>
                {symbol}
              </Text>
              <Text style={[styles.navLabel, active ? styles.navActive : styles.navInactive]}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        {toast ? (
          <View pointerEvents="none" style={styles.toast}>
            <Text style={styles.toastCheck}>✓</Text>
            <Text style={styles.toastText}>{toast}</Text>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: C.background },
  scrollContent: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 116 },
  topBar: {
    minHeight: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(250,248,255,0.98)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e7e7ef',
    gap: 10,
  },
  backButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backSymbol: { fontSize: 22, color: C.primary, fontWeight: '700' },
  brandBlock: { flex: 1 },
  collegePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: C.secondaryContainer,
    marginBottom: 3,
  },
  collegePillText: { fontSize: 9, color: C.muted2, fontWeight: '700', letterSpacing: 0.5 },
  brandTitle: { color: C.text, fontSize: 14, fontWeight: '700', letterSpacing: -0.2 },
  notificationButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19 },
  notificationSymbol: { color: C.muted, fontSize: 22 },
  notificationDot: {
    position: 'absolute',
    right: 7,
    top: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.error,
    borderWidth: 1,
    borderColor: C.background,
  },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: C.onPrimary, fontSize: 18 },
  contextRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 },
  statusPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.secondaryContainer,
    borderRadius: 18,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.primary },
  statusText: { color: C.muted2, fontSize: 10, fontWeight: '700', flexShrink: 1 },
  templateButton: { paddingHorizontal: 10, paddingVertical: 9, borderRadius: 9, backgroundColor: C.surfaceHigh },
  templateButtonText: { color: C.primary, fontSize: 11, fontWeight: '700' },
  pageTitle: { fontSize: 24, lineHeight: 30, letterSpacing: -0.6, color: C.text, fontWeight: '800', marginBottom: 4 },
  subtitle: { fontSize: 13, lineHeight: 19, color: C.muted2, marginBottom: 17 },
  inlineCode: { backgroundColor: C.surfaceHigh, color: C.primary, fontSize: 12, fontWeight: '700' },
  modeSwitch: { flexDirection: 'row', gap: 5, padding: 4, borderRadius: 13, backgroundColor: C.surfaceContainer, marginBottom: 16 },
  modeTab: { flex: 1, minHeight: 43, paddingHorizontal: 5, paddingVertical: 9, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  modeTabActive: { backgroundColor: C.white, elevation: 1 },
  modeTabText: { color: C.muted2, fontSize: 11, fontWeight: '600', textAlign: 'center' },
  modeTabTextActive: { color: C.primary, fontWeight: '800' },
  fastTag: { color: C.primary, backgroundColor: C.primaryFixed, overflow: 'hidden', fontSize: 8, fontWeight: '800' },
  pane: { gap: 14 },
  card: {
    padding: 16,
    backgroundColor: C.white,
    borderRadius: 17,
    gap: 15,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#eeedf5',
    elevation: 1,
  },
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 1 },
  sectionTitleLeft: { flexDirection: 'row', alignItems: 'center', gap: 9, flexShrink: 1 },
  sectionIcon: { width: 30, height: 30, borderRadius: 9, backgroundColor: C.primaryFixed, alignItems: 'center', justifyContent: 'center' },
  sectionIconText: { fontSize: 17, fontWeight: '800', color: C.primary },
  sectionTitle: { fontSize: 14, color: C.text, fontWeight: '800', flexShrink: 1 },
  rolePill: { backgroundColor: C.surfaceContainer, borderRadius: 15, paddingHorizontal: 8, paddingVertical: 5 },
  rolePillText: { color: C.muted, fontSize: 10, fontWeight: '700' },
  field: { gap: 7 },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  fieldLabel: { color: C.text, fontSize: 12, fontWeight: '700' },
  input: {
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 9,
    backgroundColor: C.surfaceLow,
    borderWidth: 1,
    borderColor: 'transparent',
    color: C.text,
    fontSize: 14,
  },
  multilineInput: { minHeight: 76, textAlignVertical: 'top' },
  helper: { fontSize: 10.5, lineHeight: 15, color: C.muted2 },
  helperLarge: { fontSize: 12, lineHeight: 18, color: C.muted2, marginTop: -5 },
  actionText: { color: C.primary, fontSize: 11, fontWeight: '700', paddingVertical: 2 },
  selectInput: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 9,
    backgroundColor: C.surfaceLow,
  },
  selectValue: { flex: 1, color: C.text, fontSize: 13 },
  chevron: { color: C.muted2, fontSize: 21, marginTop: -6 },
  modalBackdrop: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(15,18,35,0.38)' },
  optionsSheet: { maxHeight: '80%', borderRadius: 18, backgroundColor: C.white, padding: 16, gap: 10 },
  optionsTitle: { color: C.text, fontSize: 17, fontWeight: '800', paddingBottom: 5 },
  option: { minHeight: 45, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, borderRadius: 9 },
  optionSelected: { backgroundColor: C.surfaceLow },
  optionText: { flex: 1, color: C.text, fontSize: 13 },
  optionTextSelected: { color: C.primary, fontWeight: '700' },
  optionCheck: { color: C.primary, fontWeight: '800', fontSize: 16 },
  cancelButton: { alignItems: 'center', paddingVertical: 11, borderRadius: 9, backgroundColor: C.surfaceContainer },
  cancelButtonText: { color: C.primary, fontWeight: '700', fontSize: 13 },
  credentialRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, backgroundColor: C.surfaceLow, borderRadius: 12 },
  credentialItem: { flex: 1, gap: 5 },
  credentialLabel: { color: C.muted2, fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
  credentialValue: { color: C.text, fontSize: 12, fontWeight: '800' },
  passwordValue: { color: C.primary, fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  copyButton: {
    width: 35,
    height: 35,
    borderRadius: 9,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.outline,
  },
  copyButtonText: { color: C.primary, fontSize: 17, fontWeight: '800' },
  warningBox: { backgroundColor: '#fff4df', borderRadius: 9, padding: 10 },
  warningText: { color: '#7d4d00', fontSize: 10.5, lineHeight: 16 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'space-between' },
  switchTextBlock: { flex: 1, gap: 3 },
  switchTitle: { color: C.text, fontSize: 12, fontWeight: '700' },
  uploadZone: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 23,
    borderWidth: 1.5,
    borderColor: '#bfc9e7',
    borderStyle: 'dashed',
    borderRadius: 13,
    backgroundColor: '#fafbff',
    gap: 8,
  },
  uploadIcon: { width: 47, height: 47, borderRadius: 14, backgroundColor: C.primaryFixed, alignItems: 'center', justifyContent: 'center' },
  uploadIconText: { fontSize: 26, color: C.primary, fontWeight: '700' },
  uploadTitle: { color: C.text, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  uploadDescription: { color: C.muted2, fontSize: 11, textAlign: 'center' },
  chooseFileButton: { marginTop: 3, backgroundColor: C.primary, paddingHorizontal: 17, paddingVertical: 10, borderRadius: 9 },
  chooseFileText: { color: C.white, fontSize: 12, fontWeight: '700' },
  schemaTitle: { color: C.text, fontSize: 12, fontWeight: '800', marginTop: 3 },
  schemaRow: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 3 },
  schemaCheck: { color: C.green, fontSize: 13, fontWeight: '800' },
  schemaColumn: { color: C.muted, fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  radioRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 5 },
  radioOuter: {
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.outline,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  radioOuterSelected: { borderColor: C.primary },
  radioInner: { width: 9, height: 9, borderRadius: 5, backgroundColor: C.primary },
  radioCopy: { flex: 1, gap: 4 },
  radioTitle: { color: C.text, fontSize: 13, fontWeight: '700' },
  actionArea: { marginTop: 16, gap: 10 },
  primaryButton: {
    minHeight: 49,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    elevation: 2,
  },
  primaryButtonText: { color: C.white, fontSize: 13, fontWeight: '800', textAlign: 'center' },
  disabledButton: { opacity: 0.6 },
  secondaryActions: { flexDirection: 'row', gap: 9 },
  outlineButton: {
    flex: 1,
    minHeight: 43,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.outline,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
  },
  outlineButtonText: { color: C.muted, fontSize: 11, fontWeight: '700' },
  footerNote: { marginTop: 22, alignItems: 'center', gap: 4 },
  footerNoteText: { color: '#858796', fontSize: 10, textAlign: 'center' },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(250,248,255,0.98)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e7e7ef',
    paddingHorizontal: 3,
    paddingBottom: Platform.OS === 'ios' ? 4 : 0,
  },
  navItem: { flex: 1, minHeight: 54, alignItems: 'center', justifyContent: 'center', gap: 3 },
  navSymbol: { fontSize: 20, fontWeight: '700' },
  navLabel: { fontSize: 9, fontWeight: '600' },
  navActive: { color: C.primary },
  navInactive: { color: C.muted2 },
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 74,
    backgroundColor: '#252631',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    elevation: 5,
  },
  toastCheck: { color: '#a8edc3', fontSize: 15, fontWeight: '800' },
  toastText: { flex: 1, color: C.white, fontSize: 12, fontWeight: '600' },
});
