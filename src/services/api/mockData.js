/**
 * NEXUS Frontend Mock Data Store
 * Provides realistic, comprehensive mock responses for all application modules
 * allowing complete frontend inspection and navigation without backend or database.
 */

export const DEMO_PROFILES = {
  STUDENT: {
    id: 1,
    name: "Prakash S",
    roll_number: "714022104045",
    register_number: "714022104045",
    role: "STUDENT",
    department: "Artificial Intelligence & Data Science",
    department_code: "AIDS",
    batch: "2022-2026",
    semester: 6,
    section: "A",
    email: "prakash.s@infotech.edu.in",
    phone: "+91 98765 43210",
    mentor_name: "Dr. R. Kavitha, M.E., Ph.D.",
    cgpa: "8.92",
    attendance_percentage: 86.4,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVXP3laCjvBlZEVugtzpX20kCifG87-9yGGVWnUCmaIhNtCcDdG9HmCKcyaSa4oTc-QPnHNb5RR_pO0Xd8oVLNtxyVdxbttBW5KjbrzMiMJD0HcqApHxFuVbC5_KEUHnW0qOr98kurfIJ2NAVvw464MLzvDAN8LdJTSZXSqkbDkysN8V9Lzled9wZvQVwVorYcKfLMT1do8whwEUyopOcVpVMNt3wTCpl8mQ00dAziqalPOmZQTqcZ",
  },
  STAFF: {
    id: 2,
    name: "Prof. M. Selvam",
    faculty_id: "FAC-AIDS-018",
    role: "STAFF",
    designation: "Assistant Professor (Sr. Gr.)",
    department: "Artificial Intelligence & Data Science",
    department_code: "AIDS",
    email: "selvam.m@infotech.edu.in",
    phone: "+91 94432 10987",
    specialization: "Deep Learning & Autonomous Systems",
    classes_handled: ["III Year AI & DS - Sec A", "IV Year AI & DS - Sec B"],
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVXP3laCjvBlZEVugtzpX20kCifG87-9yGGVWnUCmaIhNtCcDdG9HmCKcyaSa4oTc-QPnHNb5RR_pO0Xd8oVLNtxyVdxbttBW5KjbrzMiMJD0HcqApHxFuVbC5_KEUHnW0qOr98kurfIJ2NAVvw464MLzvDAN8LdJTSZXSqkbDkysN8V9Lzled9wZvQVwVorYcKfLMT1do8whwEUyopOcVpVMNt3wTCpl8mQ00dAziqalPOmZQTqcZ",
  },
  ADMIN: {
    id: 3,
    name: "Dr. K. Arulmozhi",
    role: "ADMIN",
    designation: "Academic Dean & Controller of Examinations",
    department: "Academic Administration",
    email: "dean.academic@infotech.edu.in",
    phone: "+91 98422 55667",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVXP3laCjvBlZEVugtzpX20kCifG87-9yGGVWnUCmaIhNtCcDdG9HmCKcyaSa4oTc-QPnHNb5RR_pO0Xd8oVLNtxyVdxbttBW5KjbrzMiMJD0HcqApHxFuVbC5_KEUHnW0qOr98kurfIJ2NAVvw464MLzvDAN8LdJTSZXSqkbDkysN8V9Lzled9wZvQVwVorYcKfLMT1do8whwEUyopOcVpVMNt3wTCpl8mQ00dAziqalPOmZQTqcZ",
  },
  SERVICES: {
    id: 4,
    name: "Er. Rajesh Kumar",
    staff_id: "SVC-FAC-042",
    role: "SERVICES",
    designation: "Campus Facilities & Operations Lead",
    department: "Campus Services & Facilities Desk",
    email: "facilities.desk@infotech.edu.in",
    phone: "+91 94441 22334",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVXP3laCjvBlZEVugtzpX20kCifG87-9yGGVWnUCmaIhNtCcDdG9HmCKcyaSa4oTc-QPnHNb5RR_pO0Xd8oVLNtxyVdxbttBW5KjbrzMiMJD0HcqApHxFuVbC5_KEUHnW0qOr98kurfIJ2NAVvw464MLzvDAN8LdJTSZXSqkbDkysN8V9Lzled9wZvQVwVorYcKfLMT1do8whwEUyopOcVpVMNt3wTCpl8mQ00dAziqalPOmZQTqcZ",
  },
};

export const MOCK_ATTENDANCE_SUMMARY = {
  overallPercentage: 86.4,
  totalClasses: 210,
  attendedClasses: 181,
  canMiss: 7,
  neededFor75: 0,
  status: "SAFE",
  subjects: [
    {
      code: "AD3501",
      name: "Deep Learning Architectures",
      staff: "Prof. M. Selvam",
      attended: 44,
      total: 50,
      percentage: 88.0,
      status: "Safe",
    },
    {
      code: "AD3502",
      name: "Cloud Computing & DevOps",
      staff: "Dr. R. Kavitha",
      attended: 34,
      total: 40,
      percentage: 85.0,
      status: "Safe",
    },
    {
      code: "CW3501",
      name: "Natural Language Processing",
      staff: "Prof. S. Anand",
      attended: 32,
      total: 40,
      percentage: 80.0,
      status: "Borderline",
    },
    {
      code: "AD3511",
      name: "Deep Learning Laboratory",
      staff: "Prof. M. Selvam / Er. Vignesh",
      attended: 46,
      total: 50,
      percentage: 92.0,
      status: "Excellent",
    },
    {
      code: "GE3451",
      name: "Professional Ethics & Values",
      staff: "Dr. B. Vijayalakshmi",
      attended: 25,
      total: 30,
      percentage: 83.3,
      status: "Safe",
    },
  ],
};

export const MOCK_STUDENT_ROSTER = [
  { student_id: "s1", roll_number: "714022104001", name: "Aadhavan K", status: "PRESENT" },
  { student_id: "s2", roll_number: "714022104002", name: "Abirami R", status: "PRESENT" },
  { student_id: "s3", roll_number: "714022104003", name: "Balaji V", status: "ABSENT" },
  { student_id: "s4", roll_number: "714022104004", name: "Deepak Raj M", status: "PRESENT" },
  { student_id: "s5", roll_number: "714022104005", name: "Dhivya Dharshini S", status: "PRESENT" },
  { student_id: "s6", roll_number: "714022104006", name: "Dinesh Kumar P", status: "OD" },
  { student_id: "s7", roll_number: "714022104007", name: "Gokul Nath T", status: "PRESENT" },
  { student_id: "s8", roll_number: "714022104008", name: "Harini M", status: "PRESENT" },
  { student_id: "s9", roll_number: "714022104009", name: "Irfan Ahmed S", status: "PRESENT" },
  { student_id: "s10", roll_number: "714022104010", name: "Janani K", status: "PRESENT" },
  { student_id: "s11", roll_number: "714022104011", name: "Kabilan R", status: "ABSENT" },
  { student_id: "s12", roll_number: "714022104012", name: "Karthik Raja V", status: "PRESENT" },
  { student_id: "s13", roll_number: "714022104013", name: "Madhumitha S", status: "PRESENT" },
  { student_id: "s14", roll_number: "714022104014", name: "Naveen Kumar C", status: "PRESENT" },
  { student_id: "s15", roll_number: "714022104045", name: "Prakash S", status: "PRESENT" },
  { student_id: "s16", roll_number: "714022104046", name: "Praveen Kumar M", status: "PRESENT" },
  { student_id: "s17", roll_number: "714022104047", name: "Priyanka D", status: "PRESENT" },
  { student_id: "s18", roll_number: "714022104048", name: "Rahul S", status: "OD" },
  { student_id: "s19", roll_number: "714022104049", name: "Sneha G", status: "PRESENT" },
  { student_id: "s20", roll_number: "714022104050", name: "Vigneshwaran P", status: "PRESENT" },
];

export const MOCK_TIMETABLE = {
  department: "Artificial Intelligence & Data Science",
  semester: 6,
  section: "A",
  schedule: [
    {
      day: "Monday",
      slots: [
        { time: "09:00 - 09:50", subject: "Deep Learning Architectures", code: "AD3501", faculty: "Prof. M. Selvam", room: "LH-302" },
        { time: "09:50 - 10:40", subject: "Cloud Computing & DevOps", code: "AD3502", faculty: "Dr. R. Kavitha", room: "LH-302" },
        { time: "10:55 - 11:45", subject: "Natural Language Processing", code: "CW3501", faculty: "Prof. S. Anand", room: "LH-302" },
        { time: "11:45 - 12:35", subject: "Professional Ethics", code: "GE3451", faculty: "Dr. B. Vijayalakshmi", room: "LH-302" },
        { time: "01:25 - 04:00", subject: "Deep Learning Laboratory", code: "AD3511", faculty: "Prof. M. Selvam", room: "AI Lab-1" },
      ],
    },
    {
      day: "Tuesday",
      slots: [
        { time: "09:00 - 09:50", subject: "Cloud Computing & DevOps", code: "AD3502", faculty: "Dr. R. Kavitha", room: "LH-302" },
        { time: "09:50 - 10:40", subject: "Natural Language Processing", code: "CW3501", faculty: "Prof. S. Anand", room: "LH-302" },
        { time: "10:55 - 11:45", subject: "Deep Learning Architectures", code: "AD3501", faculty: "Prof. M. Selvam", room: "LH-302" },
        { time: "11:45 - 12:35", subject: "Elective: Computer Vision", code: "AD3004", faculty: "Dr. S. Kabilan", room: "LH-302" },
        { time: "01:25 - 02:15", subject: "Technical Seminar & Project", code: "AD3512", faculty: "Prof. M. Selvam", room: "LH-302" },
        { time: "02:15 - 03:05", subject: "Mentoring & Skill Dev", code: "SKILL", faculty: "Dr. R. Kavitha", room: "LH-302" },
      ],
    },
    {
      day: "Wednesday",
      slots: [
        { time: "09:00 - 09:50", subject: "Natural Language Processing", code: "CW3501", faculty: "Prof. S. Anand", room: "LH-302" },
        { time: "09:50 - 10:40", subject: "Deep Learning Architectures", code: "AD3501", faculty: "Prof. M. Selvam", room: "LH-302" },
        { time: "10:55 - 11:45", subject: "Cloud Computing & DevOps", code: "AD3502", faculty: "Dr. R. Kavitha", room: "LH-302" },
        { time: "11:45 - 12:35", subject: "Professional Ethics", code: "GE3451", faculty: "Dr. B. Vijayalakshmi", room: "LH-302" },
        { time: "01:25 - 04:00", subject: "Cloud Computing Laboratory", code: "AD3512", faculty: "Dr. R. Kavitha", room: "Cloud Lab" },
      ],
    },
    {
      day: "Thursday",
      slots: [
        { time: "09:00 - 09:50", subject: "Deep Learning Architectures", code: "AD3501", faculty: "Prof. M. Selvam", room: "LH-302" },
        { time: "09:50 - 10:40", subject: "Professional Ethics", code: "GE3451", faculty: "Dr. B. Vijayalakshmi", room: "LH-302" },
        { time: "10:55 - 11:45", subject: "Cloud Computing & DevOps", code: "AD3502", faculty: "Dr. R. Kavitha", room: "LH-302" },
        { time: "11:45 - 12:35", subject: "Natural Language Processing", code: "CW3501", faculty: "Prof. S. Anand", room: "LH-302" },
        { time: "01:25 - 04:00", subject: "Library & Self Learning", code: "LIB", faculty: "Faculty Advisor", room: "Central Library" },
      ],
    },
    {
      day: "Friday",
      slots: [
        { time: "09:00 - 09:50", subject: "Elective: Computer Vision", code: "AD3004", faculty: "Dr. S. Kabilan", room: "LH-302" },
        { time: "09:50 - 10:40", subject: "Natural Language Processing", code: "CW3501", faculty: "Prof. S. Anand", room: "LH-302" },
        { time: "10:55 - 11:45", subject: "Deep Learning Architectures", code: "AD3501", faculty: "Prof. M. Selvam", room: "LH-302" },
        { time: "11:45 - 12:35", subject: "Sports & Extracurricular", code: "EXTRA", faculty: "Physical Director", room: "Grounds" },
      ],
    },
  ],
};

export const MOCK_STAFF_LIST = [
  { id: 1, name: "Dr. R. Kavitha", faculty_id: "FAC-AIDS-001", designation: "Professor & HOD", department: "AI & DS", email: "kavitha.r@infotech.edu.in", phone: "98421 23456", mentor_count: 24, capacity: 25 },
  { id: 2, name: "Prof. M. Selvam", faculty_id: "FAC-AIDS-018", designation: "Assistant Professor", department: "AI & DS", email: "selvam.m@infotech.edu.in", phone: "94432 10987", mentor_count: 22, capacity: 25 },
  { id: 3, name: "Prof. S. Anand", faculty_id: "FAC-AIDS-022", designation: "Assistant Professor", department: "AI & DS", email: "anand.s@infotech.edu.in", phone: "97865 43210", mentor_count: 20, capacity: 25 },
  { id: 4, name: "Dr. S. Kabilan", faculty_id: "FAC-AIDS-005", designation: "Associate Professor", department: "AI & DS", email: "kabilan.s@infotech.edu.in", phone: "94876 54321", mentor_count: 25, capacity: 25 },
  { id: 5, name: "Dr. B. Vijayalakshmi", faculty_id: "FAC-HUM-012", designation: "Associate Professor", department: "Humanities", email: "vijaya.b@infotech.edu.in", phone: "98432 98765", mentor_count: 18, capacity: 25 },
];

export const MOCK_REPORTS = {
  institutionMetrics: {
    totalStudents: 1420,
    totalStaff: 98,
    departmentsCount: 7,
    todayAttendanceRate: 91.8,
    lowAttendanceCount: 42,
  },
  departmentWiseAttendance: [
    { department: "Artificial Intelligence & DS", rate: 94.2, total: 240, present: 226 },
    { department: "Computer Science & Engg", rate: 91.5, total: 360, present: 329 },
    { department: "Electronics & Comm Engg", rate: 90.8, total: 280, present: 254 },
    { department: "Mechanical Engineering", rate: 89.2, total: 220, present: 196 },
    { department: "Electrical & Electronics Engg", rate: 92.1, total: 180, present: 166 },
    { department: "Biomedical Engineering", rate: 93.5, total: 140, present: 131 },
  ],
};

/**
 * Route pattern matching to resolve simulated mock responses
 */
export function getMockResponse(path, options = {}) {
  const cleanPath = path.split('?')[0];

  // Auth and profile endpoints are handled strictly by the authoritative backend database.
  // No mock fallback permitted for authentication, sessions, or personal user profiles.

  if (cleanPath.includes('/profiles/cohort-options')) {
    return {
      departments: [
        { code: "AIDS", name: "Artificial Intelligence & Data Science" },
        { code: "CSE", name: "Computer Science & Engineering" },
        { code: "ECE", name: "Electronics & Communication Engineering" },
        { code: "MECH", name: "Mechanical Engineering" },
      ],
      batches: ["2024-2028", "2023-2027", "2022-2026", "2021-2025"],
      sections: ["A", "B", "C"],
      mentors: MOCK_STAFF_LIST.map((s) => ({ id: s.id, name: s.name, department: s.department })),
    };
  }

  if (cleanPath.includes('/profiles/staff/mentors') || cleanPath.includes('/profiles/staff')) {
    return MOCK_STAFF_LIST;
  }

  if (cleanPath.includes('/profiles/students/allocation')) {
    return MOCK_STUDENT_ROSTER.map((s, idx) => ({
      ...s,
      department: "AI & DS",
      batch: "2022-2026",
      section: "A",
      mentor_id: idx % 2 === 0 ? 2 : null,
      mentor_name: idx % 2 === 0 ? "Prof. M. Selvam" : "Unassigned",
    }));
  }

  if (cleanPath.includes('/profiles/students') || cleanPath.includes('/profiles/staff')) {
    return { success: true, message: "Operation completed successfully in demo mode" };
  }

  // Auth, profile, attendance, and timetable endpoints are handled strictly by the authoritative backend database.
  // Real relational tables (users, profiles, subjects, offerings, timetable, sessions, records) are authoritative.

  // Reports
  if (cleanPath.includes('/reports')) {
    return MOCK_REPORTS;
  }

  // Announcements / Materials
  if (cleanPath.includes('/announcements') || cleanPath.includes('/materials')) {
    return [
      { id: 1, title: "Anna University Practical Examination Schedule", date: "24-Oct-2026", file_url: "#" },
      { id: 2, title: "CIE-3 Continuous Internal Evaluation Time Table", date: "20-Oct-2026", file_url: "#" },
      { id: 3, title: "National Level AI Hackathon - InnovAIte 2024", date: "16-Oct-2026", file_url: "#" },
    ];
  }

  // Fallback generic response
  return { success: true, data: [] };
}
