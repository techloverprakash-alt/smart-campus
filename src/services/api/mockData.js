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
    avatar_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVXP3laCjvBlZEVugtzpX20kCifG87-9yGGVWnUCmaIhNtCcDdG9HmCKcyaSa4oTc-QPnHNb5RR_pO0Xd8oVLNtxyVdxbttBW5KjbrzMiMJD0HcqApHxFuVbC5_KEUHnW0qOr98kurfIJ2NAVvw464MLzvDAN8LdJTSZXSqkbDkysN8V9Lzled9wZvQVwVorYcKfLMT1do8whwEUyopOcVpVMNt3wTCpl8mQ00dAziqalPOmZQTqcZ",
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
    avatar_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVXP3laCjvBlZEVugtzpX20kCifG87-9yGGVWnUCmaIhNtCcDdG9HmCKcyaSa4oTc-QPnHNb5RR_pO0Xd8oVLNtxyVdxbttBW5KjbrzMiMJD0HcqApHxFuVbC5_KEUHnW0qOr98kurfIJ2NAVvw464MLzvDAN8LdJTSZXSqkbDkysN8V9Lzled9wZvQVwVorYcKfLMT1do8whwEUyopOcVpVMNt3wTCpl8mQ00dAziqalPOmZQTqcZ",
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
    avatar_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVXP3laCjvBlZEVugtzpX20kCifG87-9yGGVWnUCmaIhNtCcDdG9HmCKcyaSa4oTc-QPnHNb5RR_pO0Xd8oVLNtxyVdxbttBW5KjbrzMiMJD0HcqApHxFuVbC5_KEUHnW0qOr98kurfIJ2NAVvw464MLzvDAN8LdJTSZXSqkbDkysN8V9Lzled9wZvQVwVorYcKfLMT1do8whwEUyopOcVpVMNt3wTCpl8mQ00dAziqalPOmZQTqcZ",
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
    avatar_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVXP3laCjvBlZEVugtzpX20kCifG87-9yGGVWnUCmaIhNtCcDdG9HmCKcyaSa4oTc-QPnHNb5RR_pO0Xd8oVLNtxyVdxbttBW5KjbrzMiMJD0HcqApHxFuVbC5_KEUHnW0qOr98kurfIJ2NAVvw464MLzvDAN8LdJTSZXSqkbDkysN8V9Lzled9wZvQVwVorYcKfLMT1do8whwEUyopOcVpVMNt3wTCpl8mQ00dAziqalPOmZQTqcZ",
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

// ─── CAMPUS SERVICES & LOST & FOUND MOCK STORE ───────────────────────────────

export const MOCK_CATEGORIES = [
  { id: 1, name: 'Electronics & Gadgets', description: 'Laptops, calculators, smartwatches, chargers, headphones' },
  { id: 2, name: 'Identity & Cards', description: 'College ID cards, smart cards, bus passes, ATM cards, driver licenses' },
  { id: 3, name: 'Books & Stationery', description: 'Textbooks, notebooks, lab observation manuals, pencil cases' },
  { id: 4, name: 'Bags & Wallets', description: 'Backpacks, sling bags, purse, pouches, wallets' },
  { id: 5, name: 'Keys & Accessories', description: 'Room keys, bike keys, water bottles, spectacles, umbrellas' },
];

export const MOCK_LOCATIONS = [
  { id: 1, name: 'Central Digital Library (Floor 2)', zone: 'Library Quad' },
  { id: 2, name: 'Software Systems Lab 302', zone: 'Science Quad (Block B)' },
  { id: 3, name: 'Main Canteen & Food Court', zone: 'Dining Zone' },
  { id: 4, name: 'Academic Block A - LH-204', zone: 'Academic Block A' },
  { id: 5, name: 'Campus Sports Complex & Gym', zone: 'Sports Zone' },
  { id: 6, name: 'North Engineering Hall', zone: 'Engineering Block' },
  { id: 7, name: 'Admin Ground Floor Custody Desk', zone: 'Admin Quad' },
];

export const MOCK_LOST_REPORTS = [
  {
    id: 1,
    reporter_id: 1,
    reporter_name: 'Prakash S',
    category_id: 1,
    category: 'Electronics & Gadgets',
    category_name: 'Electronics & Gadgets',
    title: 'Black Casio FX-991EX Scientific Calculator',
    brand_model: 'Casio FX-991EX ClassWiz',
    description: 'Matte black casing with silver accent keys. Has a small octocat sticker on battery flap and student roll #714022104045 lightly inscribed.',
    last_seen_location_id: 1,
    last_seen_location: 'Central Digital Library (Floor 2)',
    location_name: 'Central Digital Library (Floor 2)',
    lost_at: '2026-10-28T10:30:00Z',
    status: 'MATCHED',
    photo_urls: ['https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80'],
    primary_image_url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80',
    created_at: '2026-10-28T11:00:00Z',
  },
  {
    id: 2,
    reporter_id: 1,
    reporter_name: 'Prakash S',
    category_id: 2,
    category: 'Identity & Cards',
    category_name: 'Identity & Cards',
    title: 'Official College ID Card with Blue Lanyard',
    brand_model: 'Info IT RFID Badge',
    description: 'Student ID card for Prakash S, Department of AI & DS, 2022-2026 batch. Enclosed in hard plastic transparent case.',
    last_seen_location_id: 3,
    last_seen_location: 'Main Canteen & Food Court',
    location_name: 'Main Canteen & Food Court',
    lost_at: '2026-10-27T13:15:00Z',
    status: 'OPEN',
    photo_urls: ['https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80'],
    primary_image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
    created_at: '2026-10-27T14:00:00Z',
  },
  {
    id: 3,
    reporter_id: 2,
    reporter_name: 'Prof. M. Selvam',
    category_id: 1,
    category: 'Electronics & Gadgets',
    category_name: 'Electronics & Gadgets',
    title: 'SanDisk Extreme 128GB USB Type-C Flash Drive',
    brand_model: 'SanDisk Extreme Pro Dual',
    description: 'Metallic silver dual drive with blue faculty keychain tag labeled \'AIDS-DL-NOTES\'. Contains lecture slides and lab manual files.',
    last_seen_location_id: 2,
    last_seen_location: 'Software Systems Lab 302',
    location_name: 'Software Systems Lab 302',
    lost_at: '2026-10-29T09:15:00Z',
    status: 'MATCHED',
    photo_urls: ['https://images.unsplash.com/photo-1624823183493-24e548238f29?auto=format&fit=crop&w=600&q=80'],
    primary_image_url: 'https://images.unsplash.com/photo-1624823183493-24e548238f29?auto=format&fit=crop&w=600&q=80',
    created_at: '2026-10-29T09:45:00Z',
  },
  {
    id: 4,
    reporter_id: 5,
    reporter_name: 'Dhivya Dharshini S',
    category_id: 4,
    category: 'Bags & Wallets',
    category_name: 'Bags & Wallets',
    title: 'Navy Blue Wildcraft Canvas Backpack',
    brand_model: 'Wildcraft Trail 35L',
    description: 'Navy blue and grey with water bottle holder on left side. Contains AI & DS semester 6 spiral notebook and scientific drawing instruments.',
    last_seen_location_id: 4,
    last_seen_location: 'Academic Block A - LH-204',
    location_name: 'Academic Block A - LH-204',
    lost_at: '2026-10-26T16:00:00Z',
    status: 'RESOLVED',
    photo_urls: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80'],
    primary_image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    created_at: '2026-10-26T17:00:00Z',
  },
];

export const MOCK_FOUND_REPORTS = [
  {
    id: 1,
    reported_by: 4,
    finder_name: 'Officer R. Raman (Security)',
    category_id: 1,
    category: 'Electronics & Gadgets',
    category_name: 'Electronics & Gadgets',
    title: 'Black Casio Scientific Calculator',
    brand_model: 'Casio FX-991EX',
    description: 'Discovered on 2nd-floor study cubicle desk. Matte black with adhesive sticker residue on rear panel.',
    found_location_id: 1,
    found_location: 'Central Digital Library (Floor 2)',
    location_name: 'Central Digital Library (Floor 2)',
    found_at: '2026-10-28T11:45:00Z',
    custody_desk: 'Admin Ground Floor Custody Desk',
    inventory_tag: 'LF-2026-088',
    deposit_tag: 'LF-2026-088',
    storage_status: 'IN_CUSTODY',
    photo_urls: ['https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80'],
    primary_image_url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80',
    created_at: '2026-10-28T12:00:00Z',
  },
  {
    id: 2,
    reported_by: 4,
    finder_name: 'Gnana Prakash (AV Tech)',
    category_id: 1,
    category: 'Electronics & Gadgets',
    category_name: 'Electronics & Gadgets',
    title: 'Silver SanDisk Dual USB Flash Drive',
    brand_model: 'SanDisk USB-C',
    description: 'Found plugged into instructor console podium at Lab 302. Attached to blue acrylic tag.',
    found_location_id: 2,
    found_location: 'Software Systems Lab 302',
    location_name: 'Software Systems Lab 302',
    found_at: '2026-10-29T10:00:00Z',
    custody_desk: 'Science Quad Security Desk (Block B)',
    inventory_tag: 'LF-2026-092',
    deposit_tag: 'LF-2026-092',
    storage_status: 'IN_CUSTODY',
    photo_urls: ['https://images.unsplash.com/photo-1624823183493-24e548238f29?auto=format&fit=crop&w=600&q=80'],
    primary_image_url: 'https://images.unsplash.com/photo-1624823183493-24e548238f29?auto=format&fit=crop&w=600&q=80',
    created_at: '2026-10-29T10:15:00Z',
  },
  {
    id: 3,
    reported_by: 2,
    finder_name: 'Prof. M. Selvam',
    category_id: 5,
    category: 'Keys & Accessories',
    category_name: 'Keys & Accessories',
    title: 'Set of 3 Godrej Brass Keys on Red Lanyard',
    brand_model: 'Godrej Nav-Tal',
    description: 'Handed over by student outside LH-302. Three brass keys with red textile strap.',
    found_location_id: 4,
    found_location: 'Academic Block A - LH-204',
    location_name: 'Academic Block A - LH-204',
    found_at: '2026-10-28T15:30:00Z',
    custody_desk: 'Faculty Staff Room Desk 4',
    inventory_tag: 'LF-2026-095',
    deposit_tag: 'LF-2026-095',
    storage_status: 'IN_CUSTODY',
    photo_urls: ['https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80'],
    primary_image_url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80',
    created_at: '2026-10-28T16:00:00Z',
  },
  {
    id: 4,
    reported_by: 4,
    finder_name: 'Campus Security Team Shift A',
    category_id: 5,
    category: 'Keys & Accessories',
    category_name: 'Keys & Accessories',
    title: 'Matte Black Hydro Flask Insulated Water Bottle (750ml)',
    brand_model: 'Hydro Flask Trail Series',
    description: 'Recovered from outdoor sports complex bleachers. Stainless steel insulated bottle with flexible cap.',
    found_location_id: 5,
    found_location: 'Campus Sports Complex & Gym',
    location_name: 'Campus Sports Complex & Gym',
    found_at: '2026-10-27T18:00:00Z',
    custody_desk: 'Sports Complex Reception',
    inventory_tag: 'LF-2026-079',
    deposit_tag: 'LF-2026-079',
    storage_status: 'IN_CUSTODY',
    photo_urls: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80'],
    primary_image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
    created_at: '2026-10-27T18:30:00Z',
  },
];

export const MOCK_MATCHES = [
  {
    id: 1,
    lost_report_id: 1,
    found_report_id: 1,
    text_similarity: 0.94,
    image_similarity: 0.92,
    combined_score: 0.93,
    status: 'VERIFIED',
    criteria_list: [
      { rule: 'Cross-Modal Match', signal: 'Cross-Modal Match', passed: true },
      { rule: 'Visual Embedding Alignment', signal: 'Visual Embedding Alignment', passed: true },
      { rule: 'Location Proximity (Library Fl 2)', signal: 'Location Proximity', passed: true },
      { rule: 'Category & Brand Concordance', signal: 'Category & Brand Concordance', passed: true },
    ],
    lost_report: MOCK_LOST_REPORTS[0],
    found_report: MOCK_FOUND_REPORTS[0],
    lost_title: MOCK_LOST_REPORTS[0].title,
    lost_description: MOCK_LOST_REPORTS[0].description,
    found_title: MOCK_FOUND_REPORTS[0].title,
    found_description: MOCK_FOUND_REPORTS[0].description,
    reporter_name: MOCK_LOST_REPORTS[0].reporter_name,
    finder_name: MOCK_FOUND_REPORTS[0].finder_name,
    custody_desk: MOCK_FOUND_REPORTS[0].custody_desk,
  },
  {
    id: 2,
    lost_report_id: 3,
    found_report_id: 2,
    text_similarity: 0.91,
    image_similarity: 0.88,
    combined_score: 0.90,
    status: 'CANDIDATE',
    criteria_list: [
      { rule: 'Text Semantic Match', signal: 'Text Semantic Match', passed: true },
      { rule: 'Location Exact Match (Lab 302)', signal: 'Location Exact Match', passed: true },
      { rule: 'Brand & Capacity Match (SanDisk 128GB)', signal: 'Brand Match', passed: true },
    ],
    lost_report: MOCK_LOST_REPORTS[2],
    found_report: MOCK_FOUND_REPORTS[1],
    lost_title: MOCK_LOST_REPORTS[2].title,
    lost_description: MOCK_LOST_REPORTS[2].description,
    found_title: MOCK_FOUND_REPORTS[1].title,
    found_description: MOCK_FOUND_REPORTS[1].description,
    reporter_name: MOCK_LOST_REPORTS[2].reporter_name,
    finder_name: MOCK_FOUND_REPORTS[1].finder_name,
    custody_desk: MOCK_FOUND_REPORTS[1].custody_desk,
  },
];

export const MOCK_VERIFICATIONS = [
  {
    id: 1,
    match_id: 1,
    challenge_question: 'Confirm unique identifying marks, stickers, or inscriptions on the calculator casing.',
    owner_response: 'Small Octocat sticker on battery flap, and registration number 714022104045 lightly inscribed on the lower rear panel.',
    officer_notes: 'Physical inspection of deposit LF-2026-088 confirms sticker and inscribed register number match student ID.',
    concordance_score: 93.0,
    status: 'APPROVED',
    verified_by: 3,
    created_at: '2026-10-28T14:30:00Z',
    match: MOCK_MATCHES[0],
  },
  {
    id: 2,
    match_id: 2,
    challenge_question: 'Confirm specific files or tag markings on the USB drive.',
    owner_response: 'Blue keychain tag labeled AIDS-DL-NOTES containing deep learning lecture slides.',
    officer_notes: 'Physical check confirms blue tag labeled AIDS-DL-NOTES.',
    concordance_score: 91.0,
    status: 'PENDING',
    verified_by: null,
    created_at: '2026-10-29T10:30:00Z',
    match: MOCK_MATCHES[1],
  },
];

export const MOCK_CLAIMS = [
  {
    id: 1,
    lost_report_id: 1,
    found_report_id: 1,
    claimed_by: 1,
    claimant_name: 'Prakash S',
    status: 'APPROVED',
    reviewed_by: 3,
    created_at: '2026-10-28T14:00:00Z',
    lost_report: MOCK_LOST_REPORTS[0],
    found_report: MOCK_FOUND_REPORTS[0],
  },
  {
    id: 2,
    lost_report_id: 3,
    found_report_id: 2,
    claimed_by: 2,
    claimant_name: 'Prof. M. Selvam',
    status: 'PENDING',
    reviewed_by: null,
    created_at: '2026-10-29T10:45:00Z',
    lost_report: MOCK_LOST_REPORTS[2],
    found_report: MOCK_FOUND_REPORTS[1],
  },
];

export const MOCK_HANDOVERS = [
  {
    id: 1,
    claim_id: 1,
    handed_over_by: 3,
    received_by: 1,
    handover_location_id: 7,
    handover_location: 'Admin Ground Floor Custody Desk',
    handed_over_at: '2026-10-28T16:00:00Z',
    pickup_pass_tag: 'PASS-NEXUS-88219',
  },
];

export const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    user_id: 1,
    title: 'AI Match Candidate Identified',
    message: 'A 93% multimodal match candidate was identified for your lost Black Casio Scientific Calculator.',
    type: 'MATCH_ALERT',
    is_read: false,
    created_at: '2026-10-28T12:05:00Z',
  },
  {
    id: 2,
    user_id: 1,
    title: 'Double-Blind Verification Approved',
    message: 'Campus Security Desk confirmed your ownership concordance. Your digital pickup pass is ready for claim.',
    type: 'CLAIM_APPROVED',
    is_read: false,
    created_at: '2026-10-28T14:35:00Z',
  },
];

export const MOCK_CONTROL_CENTER_SUMMARY = {
  total_complaints: 1248,
  pending_assignment: 7,
  resolution_rate_pct: 93.6,
  lost_found_recovery_pct: 88.2,
  active_in_queue: 94,
  avg_resolution_hours: 18.4,
  critical_sla_count: 2,
  claimed_count: 142,
  total_intake_count: 161,
  building_breakdown: [
    { name: 'Science Quad (Block B)', incidents: 153, values: [32, 30, 26, 12] },
    { name: 'Academic Block A', incidents: 109, values: [44, 25, 20, 11] },
    { name: 'Central Library Quad', incidents: 104, values: [18, 36, 32, 14] },
    { name: 'Main Canteen & Patio', incidents: 101, values: [38, 26, 16, 20] },
    { name: 'North Engineering Hall', incidents: 81, values: [28, 34, 24, 14] },
  ],
  status_breakdown: [
    { label: 'Resolved', count: 798, percent: 64 },
    { label: 'In Progress', count: 225, percent: 18 },
    { label: 'Assigned', count: 125, percent: 10 },
    { label: 'Submitted / Open', count: 62, percent: 5 },
    { label: 'Duplicate / Rejected', count: 38, percent: 3 },
  ],
};

export const MOCK_CONTROL_CENTER_INCIDENTS = [
  { id: 'NX-1248', category: 'Electrical fault', detail: 'Ceiling lights not working', location: 'Science Quad • Block B', priority: 'High', status: 'In progress', assignee: 'R. Kumar (Electrician)', time: '12m ago' },
  { id: 'NX-1247', category: 'Network connectivity', detail: 'Wi-Fi unavailable in lab', location: 'Academic Block A', priority: 'Medium', status: 'Assigned', assignee: 'S. Prakash (IT Support)', time: '28m ago' },
  { id: 'NX-1246', category: 'Plumbing issue', detail: 'Water leak reported near cooler', location: 'Central Library Quad', priority: 'High', status: 'Open', assignee: 'Unassigned', time: '41m ago' },
  { id: 'NX-1245', category: 'IT & Classroom AV', detail: 'Projector overheating & sparking', location: 'Block B • Lab 302', priority: 'Critical', status: 'In progress', assignee: 'Gnana Prakash (AV Tech)', time: '1h ago' },
  { id: 'NX-1244', category: 'Power Safety', detail: 'Outdoor socket weather flap loose', location: 'Main Canteen Patio', priority: 'Medium', status: 'Assigned', assignee: 'Facility Team Shift B', time: '2h ago' },
];

/**
 * Route pattern matching to resolve simulated mock responses
 */
export function getMockResponse(path, options = {}) {
  const cleanPath = path.split('?')[0];

  // ─── Lost & Found Endpoints ────────────────────────────────────────────────
  if (cleanPath.includes('/lost-found/categories')) {
    return MOCK_CATEGORIES;
  }

  if (cleanPath.includes('/lost-found/locations')) {
    return MOCK_LOCATIONS;
  }

  if (cleanPath.includes('/lost-found/upload')) {
    return {
      success: true,
      data: {
        file_url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80',
        media_id: 101,
      },
    };
  }

  if (cleanPath.includes('/lost-found/lost')) {
    if (options.method === 'POST') {
      try {
        const body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body || {};
        const catObj = MOCK_CATEGORIES.find((c) => String(c.id) === String(body.category_id)) || MOCK_CATEGORIES[0];
        const locObj = MOCK_LOCATIONS.find((l) => String(l.id) === String(body.last_seen_location_id)) || MOCK_LOCATIONS[0];
        const newReport = {
          id: MOCK_LOST_REPORTS.length + 10,
          reporter_id: 1,
          reporter_name: 'Prakash S',
          category_id: body.category_id || catObj.id,
          category: catObj.name,
          category_name: catObj.name,
          title: body.title || 'Reported Lost Item',
          brand_model: body.brand_model || '',
          description: body.description || '',
          last_seen_location_id: body.last_seen_location_id || locObj.id,
          last_seen_location: locObj.name,
          location_name: locObj.name,
          lost_at: body.lost_at || new Date().toISOString(),
          status: 'OPEN',
          photo_urls: body.image_url ? [body.image_url] : ['https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80'],
          primary_image_url: body.image_url || 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80',
          created_at: new Date().toISOString(),
        };
        MOCK_LOST_REPORTS.unshift(newReport);
        return { success: true, data: newReport };
      } catch {
        return { success: true, data: { id: Date.now(), status: 'OPEN' } };
      }
    }
    if (options.method === 'DELETE') {
      return { success: true, message: 'Report deleted successfully' };
    }
    return MOCK_LOST_REPORTS;
  }

  if (cleanPath.includes('/lost-found/found')) {
    if (options.method === 'POST') {
      try {
        const body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body || {};
        const catObj = MOCK_CATEGORIES.find((c) => String(c.id) === String(body.category_id)) || MOCK_CATEGORIES[0];
        const locObj = MOCK_LOCATIONS.find((l) => String(l.id) === String(body.found_location_id)) || MOCK_LOCATIONS[0];
        const newTag = LF-2026-0;
        const newReport = {
          id: MOCK_FOUND_REPORTS.length + 10,
          reported_by: 4,
          finder_name: 'Campus Community Finder',
          category_id: body.category_id || catObj.id,
          category: catObj.name,
          category_name: catObj.name,
          title: body.title || 'Discovered Property',
          brand_model: body.brand_model || '',
          description: body.description || '',
          found_location_id: body.found_location_id || locObj.id,
          found_location: locObj.name,
          location_name: locObj.name,
          found_at: body.found_at || new Date().toISOString(),
          custody_desk: body.custody_desk || 'Admin Ground Floor Custody Desk',
          inventory_tag: newTag,
          deposit_tag: newTag,
          storage_status: 'IN_CUSTODY',
          photo_urls: body.image_url ? [body.image_url] : ['https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80'],
          primary_image_url: body.image_url || 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80',
          created_at: new Date().toISOString(),
        };
        MOCK_FOUND_REPORTS.unshift(newReport);
        return { success: true, data: newReport };
      } catch {
        return { success: true, data: { id: Date.now(), status: 'IN_CUSTODY' } };
      }
    }
    return MOCK_FOUND_REPORTS;
  }

  if (cleanPath.includes('/lost-found/matches')) {
    if (options.method === 'POST') {
      return { success: true, message: 'Match verified successfully', data: { status: 'VERIFIED' } };
    }
    return MOCK_MATCHES;
  }

  if (cleanPath.includes('/lost-found/verifications')) {
    if (options.method === 'PATCH') {
      return { success: true, message: 'Verification challenge approved', data: { status: 'APPROVED' } };
    }
    return MOCK_VERIFICATIONS;
  }

  if (cleanPath.includes('/lost-found/claims')) {
    if (options.method === 'POST') {
      return { success: true, message: 'Claim submitted successfully', data: { id: Date.now(), status: 'PENDING' } };
    }
    if (options.method === 'PATCH') {
      return { success: true, message: 'Claim status updated', data: { status: 'APPROVED' } };
    }
    return MOCK_CLAIMS;
  }

  if (cleanPath.includes('/lost-found/handovers')) {
    if (options.method === 'POST') {
      return {
        success: true,
        message: 'Handover generated',
        data: { id: Date.now(), pickup_pass_tag: 'PASS-NEXUS-88219' },
      };
    }
    return MOCK_HANDOVERS;
  }

  if (cleanPath.includes('/lost-found/notifications')) {
    return MOCK_NOTIFICATIONS;
  }

  if (cleanPath.includes('/lost-found/similarity-search')) {
    return MOCK_FOUND_REPORTS.slice(0, 2);
  }

  // ─── Control Center Endpoints ──────────────────────────────────────────────
  if (cleanPath.includes('/admin/control-center/summary') || cleanPath.includes('/control-center/summary')) {
    return MOCK_CONTROL_CENTER_SUMMARY;
  }

  if (cleanPath.includes('/admin/control-center/incidents') || cleanPath.includes('/control-center/incidents')) {
    return MOCK_CONTROL_CENTER_INCIDENTS;
  }

  // ─── Profile & Academic Endpoints ──────────────────────────────────────────
  if (cleanPath.includes('/profiles/cohort-options')) {
    return {
      departments: [
        { code: 'AIDS', name: 'Artificial Intelligence & Data Science' },
        { code: 'CSE', name: 'Computer Science & Engineering' },
        { code: 'ECE', name: 'Electronics & Communication Engineering' },
        { code: 'MECH', name: 'Mechanical Engineering' },
      ],
      batches: ['2024-2028', '2023-2027', '2022-2026', '2021-2025'],
      sections: ['A', 'B', 'C'],
      mentors: MOCK_STAFF_LIST.map((s) => ({ id: s.id, name: s.name, department: s.department })),
    };
  }

  if (cleanPath.includes('/profiles/staff/mentors') || cleanPath.includes('/profiles/staff')) {
    return MOCK_STAFF_LIST;
  }

  if (cleanPath.includes('/profiles/students/allocation')) {
    return MOCK_STUDENT_ROSTER.map((s, idx) => ({
      ...s,
      department: 'AI & DS',
      batch: '2022-2026',
      section: 'A',
      mentor_id: idx % 2 === 0 ? 2 : null,
      mentor_name: idx % 2 === 0 ? 'Prof. M. Selvam' : 'Unassigned',
    }));
  }

  if (cleanPath.includes('/profiles/students') || cleanPath.includes('/profiles/staff')) {
    return { success: true, message: 'Operation completed successfully in demo mode' };
  }

  // Reports
  if (cleanPath.includes('/reports')) {
    return MOCK_REPORTS;
  }

  // Announcements / Materials
  if (cleanPath.includes('/announcements') || cleanPath.includes('/materials')) {
    return [
      { id: 1, title: 'Anna University Practical Examination Schedule', date: '24-Oct-2026', file_url: '#' },
      { id: 2, title: 'CIE-3 Continuous Internal Evaluation Time Table', date: '20-Oct-2026', file_url: '#' },
      { id: 3, title: 'National Level AI Hackathon - InnovAIte 2024', date: '16-Oct-2026', file_url: '#' },
    ];
  }

  // Fallback generic response
  return { success: true, data: [] };
}
