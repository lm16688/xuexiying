// 类型定义

export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  wxId: string;
  role: UserRole;
  nickname?: string;
  campId?: string;
}

export interface Camp {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  teachers: string[];
  students: string[];
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
}

export interface Assignment {
  id: string;
  campId: string;
  teacherId: string;
  teacherName?: string;
  title: string;
  content: string;
  attachments: Attachment[];
  deadline: number;
  createdAt: number;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName?: string;
  content: string;
  attachments: Attachment[];
  submittedAt: number;
}

export interface Review {
  id: string;
  submissionId: string;
  teacherId: string;
  teacherName?: string;
  rating: number;
  comment: string;
  isPublic: boolean;
  createdAt: number;
}

export interface Message {
  id: string;
  submissionId: string;
  senderId: string;
  senderName?: string;
  senderRole: UserRole;
  content: string;
  createdAt: number;
}

// 应用状态
export interface AppState {
  currentUser: User | null;
  currentRole: UserRole | null;
  currentCamp: Camp | null;
  camps: Camp[];
  users: User[];
  assignments: Assignment[];
  submissions: Submission[];
  reviews: Review[];
  messages: Message[];
}

// Action 类型
export type AppAction =
  | { type: 'LOGIN'; payload: { wxId: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_ROLE'; payload: UserRole }
  | { type: 'SET_CAMP'; payload: Camp | null }
  | { type: 'SET_NICKNAME'; payload: string }
  | { type: 'CREATE_CAMP'; payload: Camp }
  | { type: 'UPDATE_CAMP'; payload: Camp }
  | { type: 'DELETE_CAMP'; payload: string }
  | { type: 'ADD_TEACHER'; payload: { campId: string; wxId: string } }
  | { type: 'ADD_STUDENT'; payload: { campId: string; wxId: string } }
  | { type: 'REMOVE_MEMBER'; payload: { campId: string; wxId: string } }
  | { type: 'CREATE_ASSIGNMENT'; payload: Assignment }
  | { type: 'DELETE_ASSIGNMENT'; payload: string }
  | { type: 'CREATE_SUBMISSION'; payload: Submission }
  | { type: 'CREATE_REVIEW'; payload: Review }
  | { type: 'CREATE_MESSAGE'; payload: Message }
  | { type: 'LOAD_DATA'; payload: Partial<AppState> };
