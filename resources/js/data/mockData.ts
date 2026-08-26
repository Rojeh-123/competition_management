// Types
export type UserRole = 'visitor' | 'participant' | 'judge' | 'admin';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  avatar: string;
  country: string;
  bio: string;
  role: UserRole;
  age: number;
  createdAt: string;
}

export interface Competition {
  id: number;
  title: string;
  description: string;
  rules: string;
  category: string;
  startDate: string;
  submissionDeadline: string;
  endDate: string;
  maxFileSize: number;
  allowedFileTypes: string;
  numberOfWinners: number;
  prizeDescription: string;
  visibility: 'public' | 'private';
  status: 'upcoming' | 'open' | 'submission_closed' | 'judging' | 'results_published' | 'archived';
  participantCount: number;
  submissionCount: number;
  image: string;
  createdBy: number;
}

export interface Submission {
  id: number;
  competitionId: number;
  participantId: number;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'judging' | 'finished';
  files: { name: string; size: string; type: string }[];
  createdAt: string;
  score?: number;
  votes: number;
}

export interface Score {
  id: number;
  submissionId: number;
  judgeId: number;
  criteria: { name: string; maxScore: number; score: number }[];
  totalScore: number;
  comment: string;
  createdAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'system' | 'competition' | 'submission' | 'result';
  isRead: boolean;
  createdAt: string;
}

export interface Certificate {
  id: number;
  participantId: number;
  competitionId: number;
  competitionTitle: string;
  rank: number;
  certificateCode: string;
  issuedAt: string;
}

export interface Achievement {
  id: number;
  userId: number;
  name: string;
  description: string;
  icon: string;
  awardedAt: string;
}

export interface AuditLog {
  id: number;
  userId: number;
  userName: string;
  action: string;
  tableName: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  competitionCount: number;
}

// Mock Data
export const categories: Category[] = [
  { id: 1, name: 'Photography', description: 'Capture stunning moments', competitionCount: 12 },
  { id: 2, name: 'Programming', description: 'Code challenges and algorithms', competitionCount: 8 },
  { id: 3, name: 'Digital Art', description: 'Digital illustrations and designs', competitionCount: 6 },
  { id: 4, name: 'Writing', description: 'Creative writing and essays', competitionCount: 4 },
  { id: 5, name: 'Music', description: 'Musical compositions', competitionCount: 3 },
  { id: 6, name: 'Video Editing', description: 'Film and video production', competitionCount: 5 },
  { id: 7, name: 'Graphic Design', description: 'Visual communication design', competitionCount: 7 },
  { id: 8, name: 'Robotics', description: 'Robotics and automation', competitionCount: 2 },
];

export const competitions: Competition[] = [
  {
    id: 1, title: 'Global Photography Challenge 2026', description: 'Capture the natural world\'s beauty. Submissions must be original, high-res photos. No AI tool synthesis or automated alterations allowed.',
    rules: '1. All photos must be original work\n2. No AI-generated or heavily manipulated images\n3. Minimum resolution: 4000x3000px\n4. RAW or high-quality JPEG accepted\n5. Maximum 3 submissions per participant',
    category: 'Photography', startDate: '2026-06-01', submissionDeadline: '2026-07-15', endDate: '2026-08-01',
    maxFileSize: 50, allowedFileTypes: '.RAW,.JPG,.PNG', numberOfWinners: 3, prizeDescription: '$5,000 Grand Prize + Professional Camera Kit',
    visibility: 'public', status: 'open', participantCount: 342, submissionCount: 289, image: '', createdBy: 1
  },
  {
    id: 2, title: 'Algorithm Speed Jam 2026', description: 'Optimize algorithms for maximum performance. Solve complex computational problems with elegant, efficient solutions.',
    rules: '1. Solutions must be original\n2. Any programming language accepted\n3. Time complexity matters\n4. Clean code required\n5. Documentation mandatory',
    category: 'Programming', startDate: '2026-06-15', submissionDeadline: '2026-07-20', endDate: '2026-08-05',
    maxFileSize: 100, allowedFileTypes: '.ZIP,.TAR.GZ', numberOfWinners: 5, prizeDescription: '$10,000 Prize Pool + Tech Internships',
    visibility: 'public', status: 'open', participantCount: 1104, submissionCount: 876, image: '', createdBy: 1
  },
  {
    id: 3, title: 'Digital Art Showcase 2026', description: 'Express your creativity through digital mediums. From illustrations to 3D renders, showcase your artistic vision.',
    rules: '1. Original digital artwork only\n2. Any digital medium accepted\n3. Minimum 3000x3000px\n4. Include process documentation\n5. No stock assets',
    category: 'Digital Art', startDate: '2026-05-01', submissionDeadline: '2026-06-30', endDate: '2026-07-15',
    maxFileSize: 200, allowedFileTypes: '.PSD,.PNG,.TIFF', numberOfWinners: 3, prizeDescription: '$3,000 + Wacom Tablet + Adobe Suite License',
    visibility: 'public', status: 'judging', participantCount: 567, submissionCount: 445, image: '', createdBy: 1
  },
  {
    id: 4, title: 'UI/UX Interface Deep Dive', description: 'Design intuitive, beautiful interfaces that solve real user problems. Focus on usability and aesthetics.',
    rules: '1. Complete design system required\n2. Include user research documentation\n3. Figma or similar tool exports\n4. Mobile-first approach\n5. Accessibility compliance',
    category: 'Graphic Design', startDate: '2026-07-01', submissionDeadline: '2026-08-15', endDate: '2026-09-01',
    maxFileSize: 150, allowedFileTypes: '.FIG,.PDF,.ZIP', numberOfWinners: 3, prizeDescription: '$4,000 + Design Tool Licenses',
    visibility: 'public', status: 'upcoming', participantCount: 0, submissionCount: 0, image: '', createdBy: 1
  },
  {
    id: 5, title: 'Nature Photography Expo', description: 'Celebrate the wonders of nature through your lens. Wildlife, landscapes, and macro photography welcome.',
    rules: '1. Nature subjects only\n2. No domestic animals\n3. Ethical photography practices\n4. Location data required\n5. Single exposure preferred',
    category: 'Photography', startDate: '2026-03-01', submissionDeadline: '2026-04-30', endDate: '2026-05-15',
    maxFileSize: 50, allowedFileTypes: '.RAW,.JPG', numberOfWinners: 3, prizeDescription: '$2,500 + National Geographic Feature',
    visibility: 'public', status: 'results_published', participantCount: 892, submissionCount: 756, image: '', createdBy: 1
  },
  {
    id: 6, title: 'Creative Writing Marathon', description: 'Write compelling short stories, poems, or essays. Let your words paint vivid pictures.',
    rules: '1. Original work only\n2. 1000-5000 words\n3. English language\n4. Any genre accepted\n5. Plagiarism will be disqualified',
    category: 'Writing', startDate: '2026-06-10', submissionDeadline: '2026-07-10', endDate: '2026-07-25',
    maxFileSize: 10, allowedFileTypes: '.PDF,.DOCX', numberOfWinners: 3, prizeDescription: '$1,500 + Publishing Deal',
    visibility: 'public', status: 'open', participantCount: 234, submissionCount: 198, image: '', createdBy: 1
  },
];

export const users: User[] = [
  { id: 1, username: 'admin', email: 'admin@competehub.com', fullName: 'System Administrator', avatar: '', country: 'Global', bio: 'Platform administrator', role: 'admin', age: 35, createdAt: '2025-01-01' },
  { id: 2, username: 'ahmed_ali', email: 'ahmed@example.com', fullName: 'Ahmed Ali', avatar: '', country: 'Egypt', bio: 'Computer Science Student passionate about algorithms and photography', role: 'participant', age: 22, createdAt: '2025-06-15' },
  { id: 3, username: 'sarah_smith', email: 'sarah@example.com', fullName: 'Dr. Sarah Smith', avatar: '', country: 'UK', bio: 'Systems Algorithm Expert with 15 years of experience', role: 'judge', age: 42, createdAt: '2025-03-20' },
  { id: 4, username: 'john_doe', email: 'john@example.com', fullName: 'Prof. John Smith', avatar: '', country: 'USA', bio: 'Nature Photography Specialist and Professor', role: 'judge', age: 55, createdAt: '2025-02-10' },
  { id: 5, username: 'elena_r', email: 'elena@example.com', fullName: 'Elena Rostova', avatar: '', country: 'Russia', bio: 'Digital artist and UI designer', role: 'participant', age: 28, createdAt: '2025-07-01' },
  { id: 6, username: 'marcus_v', email: 'marcus@example.com', fullName: 'Marcus Vance', avatar: '', country: 'Canada', bio: 'Full-stack developer and competitive programmer', role: 'participant', age: 25, createdAt: '2025-08-15' },
];

export const submissions: Submission[] = [
  { id: 1, competitionId: 1, participantId: 2, title: 'Nile Sunset Golden Hour', description: 'Captured during golden hour along the Nile river banks', status: 'approved', files: [{ name: 'nile_sunset.raw', size: '44.2 MB', type: 'RAW' }], createdAt: '2026-06-20', score: 97.6, votes: 1240 },
  { id: 2, competitionId: 1, participantId: 5, title: 'Urban Grid Reflections', description: 'City architecture reflected in rain puddles', status: 'approved', files: [{ name: 'urban_grid.jpg', size: '28.1 MB', type: 'JPEG' }], createdAt: '2026-06-21', score: 95.1, votes: 984 },
  { id: 3, competitionId: 2, participantId: 2, title: 'Optimized Graph Index Core', description: 'Novel graph indexing algorithm with O(log n) lookup', status: 'judging', files: [{ name: 'core_v2.zip', size: '14.2 MB', type: 'ZIP' }], createdAt: '2026-06-25', votes: 412 },
  { id: 4, competitionId: 2, participantId: 6, title: 'Parallel Sort Engine', description: 'Multi-threaded sorting with adaptive partitioning', status: 'approved', files: [{ name: 'parallel_sort.tar.gz', size: '8.7 MB', type: 'TAR.GZ' }], createdAt: '2026-06-22', score: 94.8, votes: 567 },
  { id: 5, competitionId: 3, participantId: 5, title: 'Cyber Engine UI Concept', description: 'Futuristic interface design for gaming platform', status: 'judging', files: [{ name: 'cyber_ui.psd', size: '156 MB', type: 'PSD' }], createdAt: '2026-06-18', votes: 823 },
  { id: 6, competitionId: 5, participantId: 2, title: 'Desert Fox at Dawn', description: 'Fennec fox captured in natural habitat', status: 'finished', files: [{ name: 'desert_fox.raw', size: '52.1 MB', type: 'RAW' }], createdAt: '2026-04-10', score: 93.4, votes: 1567 },
];

export const scores: Score[] = [
  { id: 1, submissionId: 1, judgeId: 3, criteria: [{ name: 'Creativity', maxScore: 10, score: 10 }, { name: 'Quality', maxScore: 10, score: 10 }, { name: 'Originality', maxScore: 10, score: 9 }, { name: 'Presentation', maxScore: 10, score: 10 }, { name: 'Difficulty', maxScore: 10, score: 9 }], totalScore: 48, comment: 'Exceptional composition and lighting. The golden hour timing is perfect.', createdAt: '2026-07-01' },
  { id: 2, submissionId: 1, judgeId: 4, criteria: [{ name: 'Creativity', maxScore: 10, score: 10 }, { name: 'Quality', maxScore: 10, score: 10 }, { name: 'Originality', maxScore: 10, score: 10 }, { name: 'Presentation', maxScore: 10, score: 9 }, { name: 'Difficulty', maxScore: 10, score: 10 }], totalScore: 49, comment: 'Masterful use of natural light. One of the best nature shots I\'ve reviewed.', createdAt: '2026-07-02' },
  { id: 3, submissionId: 2, judgeId: 3, criteria: [{ name: 'Creativity', maxScore: 10, score: 9 }, { name: 'Quality', maxScore: 10, score: 10 }, { name: 'Originality', maxScore: 10, score: 9 }, { name: 'Presentation', maxScore: 10, score: 10 }, { name: 'Difficulty', maxScore: 10, score: 9 }], totalScore: 47, comment: 'Strong urban photography with excellent reflection technique.', createdAt: '2026-07-01' },
];

export const notifications: Notification[] = [
  { id: 1, userId: 2, title: 'Scoring Finalized', message: 'Scoring calculation finalized for Global Photography Challenge 2026', type: 'result', isRead: false, createdAt: '2026-06-27T15:22:00' },
  { id: 2, userId: 2, title: 'Submission Approved', message: 'Your submission "Optimized Graph Index Core" has been approved', type: 'submission', isRead: false, createdAt: '2026-06-26T10:30:00' },
  { id: 3, userId: 2, title: 'New Competition', message: 'UI/UX Interface Deep Dive is now accepting registrations', type: 'competition', isRead: true, createdAt: '2026-06-25T09:00:00' },
  { id: 4, userId: 2, title: 'Deadline Reminder', message: 'Algorithm Speed Jam submission deadline is in 2 days', type: 'system', isRead: true, createdAt: '2026-06-24T08:00:00' },
  { id: 5, userId: 3, title: 'New Assignment', message: 'You have been assigned to evaluate Digital Art Showcase 2026', type: 'system', isRead: false, createdAt: '2026-06-27T12:00:00' },
];

export const certificates: Certificate[] = [
  { id: 1, participantId: 2, competitionId: 5, competitionTitle: 'Nature Photography Expo', rank: 2, certificateCode: '0x904F2A1C', issuedAt: '2026-05-20' },
  { id: 2, participantId: 2, competitionId: 5, competitionTitle: 'Nature Photography Expo', rank: 10, certificateCode: '0x411A5C9E', issuedAt: '2026-05-20' },
];

export const achievements: Achievement[] = [
  { id: 1, userId: 2, name: 'Champion', description: 'Won first place in a competition', icon: '🏆', awardedAt: '2026-05-20' },
  { id: 2, userId: 2, name: '2nd Place', description: 'Achieved runner-up position', icon: '🥈', awardedAt: '2026-05-20' },
  { id: 3, userId: 2, name: '5 Contests', description: 'Participated in 5 competitions', icon: '🔥', awardedAt: '2026-06-15' },
  { id: 4, userId: 2, name: 'Max Score', description: 'Received a perfect score from a judge', icon: '🎯', awardedAt: '2026-05-20' },
];

export const auditLogs: AuditLog[] = [
  { id: 1, userId: 1, userName: 'Admin (#01)', action: 'DELETE', tableName: 'competitions', details: 'Deleted competition #42', ipAddress: '192.168.1.1', createdAt: '2026-06-27T15:32:11' },
  { id: 2, userId: 3, userName: 'Judge (#94)', action: 'UPDATE', tableName: 'scores', details: 'Score locked for submission #902', ipAddress: '10.0.0.5', createdAt: '2026-06-27T15:20:04' },
  { id: 3, userId: 1, userName: 'Admin (#01)', action: 'CREATE', tableName: 'competitions', details: 'Created new competition: UI/UX Deep Dive', ipAddress: '192.168.1.1', createdAt: '2026-06-27T14:15:00' },
  { id: 4, userId: 2, userName: 'Ahmed (#1402)', action: 'CREATE', tableName: 'submissions', details: 'New submission uploaded for Algorithm Speed Jam', ipAddress: '203.0.113.42', createdAt: '2026-06-27T13:45:22' },
  { id: 5, userId: 1, userName: 'Admin (#01)', action: 'UPDATE', tableName: 'users', details: 'Banned user #4022 for policy violation', ipAddress: '192.168.1.1', createdAt: '2026-06-27T12:30:00' },
];

// Leaderboard for completed competitions
export const leaderboard = [
  { rank: 1, participantName: 'Ahmed Ali', category: 'Nature', score: 97.6, submissionTitle: 'Nile Sunset Golden Hour' },
  { rank: 2, participantName: 'Sarah Johnson', category: 'Wildlife', score: 95.1, submissionTitle: 'Arctic Fox in Snow' },
  { rank: 3, participantName: 'John Chen', category: 'Landscape', score: 94.8, submissionTitle: 'Mountain Reflection' },
  { rank: 4, participantName: 'Elena Rostova', category: 'Nature', score: 93.4, submissionTitle: 'Forest Canopy Light' },
  { rank: 5, participantName: 'Marcus Vance', category: 'Portrait', score: 91.2, submissionTitle: 'Desert Nomad' },
];

// Stats for admin dashboard
export const platformStats = {
  totalUsers: 14240,
  activeCompetitions: 18,
  totalSubmissions: 3901,
  totalJudges: 450,
  totalPrizeAwarded: 120000,
  monthlyGrowth: [
    { month: 'Jan', users: 8200, submissions: 1200 },
    { month: 'Feb', users: 9100, submissions: 1450 },
    { month: 'Mar', users: 10200, submissions: 1800 },
    { month: 'Apr', users: 11400, submissions: 2200 },
    { month: 'May', users: 12800, submissions: 2900 },
    { month: 'Jun', users: 14240, submissions: 3901 },
  ],
  participationByCountry: [
    { country: 'Egypt', percentage: 52 },
    { country: 'Saudi Arabia', percentage: 24 },
    { country: 'UAE', percentage: 12 },
    { country: 'UK', percentage: 7 },
    { country: 'USA', percentage: 5 },
  ],
};