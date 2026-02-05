import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { AppState, AppAction } from '@/types';

const initialState: AppState = {
  currentUser: null,
  currentRole: null,
  currentCamp: null,
  camps: [],
  users: [],
  assignments: [],
  submissions: [],
  reviews: [],
  messages: [],
};

// 生成唯一ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// 初始化示例数据
const initSampleData = (): Partial<AppState> => {
  const campId = generateId();
  const teacherWxId1 = 'teacher001';
  const teacherWxId2 = 'teacher002';
  const studentWxId1 = 'student001';
  const studentWxId2 = 'student002';
  const studentWxId3 = 'student003';

  return {
    camps: [
      {
        id: campId,
        name: 'Web前端开发学习营',
        description: '从零开始学习React、TypeScript和现代前端开发技术',
        createdAt: Date.now(),
        teachers: [teacherWxId1, teacherWxId2],
        students: [studentWxId1, studentWxId2, studentWxId3],
      },
    ],
    users: [
      { wxId: 'admin001', role: 'admin', nickname: '管理员' },
      { wxId: teacherWxId1, role: 'teacher', nickname: '张老师', campId },
      { wxId: teacherWxId2, role: 'teacher', nickname: '李老师', campId },
      { wxId: studentWxId1, role: 'student', nickname: '小明', campId },
      { wxId: studentWxId2, role: 'student', nickname: '小红', campId },
      { wxId: studentWxId3, role: 'student', nickname: '小刚', campId },
    ],
    assignments: [
      {
        id: generateId(),
        campId,
        teacherId: teacherWxId1,
        teacherName: '张老师',
        title: 'HTML基础作业',
        content: '请完成一个简单的个人介绍页面，包含姓名、爱好和一张个人照片。',
        attachments: [],
        deadline: Date.now() + 7 * 24 * 60 * 60 * 1000,
        createdAt: Date.now(),
      },
      {
        id: generateId(),
        campId,
        teacherId: teacherWxId2,
        teacherName: '李老师',
        title: 'CSS布局练习',
        content: '使用Flexbox和Grid实现一个响应式的卡片布局页面。',
        attachments: [],
        deadline: Date.now() + 14 * 24 * 60 * 60 * 1000,
        createdAt: Date.now(),
      },
    ],
    submissions: [],
    reviews: [],
    messages: [],
  };
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN':
      // 检查用户是否已存在
      const existingUser = state.users.find(u => u.wxId === action.payload.wxId);
      if (existingUser) {
        return {
          ...state,
          currentUser: existingUser,
          currentRole: existingUser.role,
        };
      }
      // 新用户，创建临时用户对象（等待选择角色）
      return {
        ...state,
        currentUser: { wxId: action.payload.wxId, role: 'student' },
        currentRole: null,
      };

    case 'LOGOUT':
      return {
        ...state,
        currentUser: null,
        currentRole: null,
        currentCamp: null,
      };

    case 'SET_ROLE':
      if (!state.currentUser) return state;
      const updatedUser = { ...state.currentUser, role: action.payload };
      return {
        ...state,
        currentUser: updatedUser,
        currentRole: action.payload,
        users: state.users.map(u =>
          u.wxId === updatedUser.wxId ? updatedUser : u
        ),
      };

    case 'SET_CAMP':
      return {
        ...state,
        currentCamp: action.payload,
      };

    case 'SET_NICKNAME':
      if (!state.currentUser) return state;
      const userWithNickname = { ...state.currentUser, nickname: action.payload };
      return {
        ...state,
        currentUser: userWithNickname,
        users: state.users.map(u =>
          u.wxId === userWithNickname.wxId ? userWithNickname : u
        ),
      };

    case 'CREATE_CAMP':
      return {
        ...state,
        camps: [...state.camps, action.payload],
      };

    case 'UPDATE_CAMP':
      return {
        ...state,
        camps: state.camps.map(camp =>
          camp.id === action.payload.id ? action.payload : camp
        ),
      };

    case 'DELETE_CAMP':
      return {
        ...state,
        camps: state.camps.filter(camp => camp.id !== action.payload),
        assignments: state.assignments.filter(a => a.campId !== action.payload),
      };

    case 'ADD_TEACHER':
      return {
        ...state,
        camps: state.camps.map(camp =>
          camp.id === action.payload.campId
            ? { ...camp, teachers: [...camp.teachers, action.payload.wxId] }
            : camp
        ),
      };

    case 'ADD_STUDENT':
      return {
        ...state,
        camps: state.camps.map(camp =>
          camp.id === action.payload.campId
            ? { ...camp, students: [...camp.students, action.payload.wxId] }
            : camp
        ),
      };

    case 'REMOVE_MEMBER':
      return {
        ...state,
        camps: state.camps.map(camp =>
          camp.id === action.payload.campId
            ? {
                ...camp,
                teachers: camp.teachers.filter(id => id !== action.payload.wxId),
                students: camp.students.filter(id => id !== action.payload.wxId),
              }
            : camp
        ),
      };

    case 'CREATE_ASSIGNMENT':
      return {
        ...state,
        assignments: [...state.assignments, action.payload],
      };

    case 'DELETE_ASSIGNMENT':
      return {
        ...state,
        assignments: state.assignments.filter(a => a.id !== action.payload),
        submissions: state.submissions.filter(s => s.assignmentId !== action.payload),
      };

    case 'CREATE_SUBMISSION':
      return {
        ...state,
        submissions: [...state.submissions, action.payload],
      };

    case 'CREATE_REVIEW':
      return {
        ...state,
        reviews: [...state.reviews, action.payload],
      };

    case 'CREATE_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };

    case 'LOAD_DATA':
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Storage keys
const STORAGE_KEYS = {
  CAMPS: 'study_camp_camps',
  USERS: 'study_camp_users',
  ASSIGNMENTS: 'study_camp_assignments',
  SUBMISSIONS: 'study_camp_submissions',
  REVIEWS: 'study_camp_reviews',
  MESSAGES: 'study_camp_messages',
  SESSION: 'study_camp_session',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false);

  // 从 LocalStorage 加载数据
  useEffect(() => {
    const loadData = () => {
      try {
        const camps = JSON.parse(localStorage.getItem(STORAGE_KEYS.CAMPS) || '[]');
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
        const assignments = JSON.parse(localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS) || '[]');
        const submissions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBMISSIONS) || '[]');
        const reviews = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '[]');
        const messages = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]');
        const session = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION) || 'null');

        // 如果没有数据，初始化示例数据
        if (camps.length === 0) {
          const sampleData = initSampleData();
          dispatch({ type: 'LOAD_DATA', payload: sampleData });
          
          // 保存到 LocalStorage
          localStorage.setItem(STORAGE_KEYS.CAMPS, JSON.stringify(sampleData.camps));
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(sampleData.users));
          localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(sampleData.assignments));
          localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(sampleData.submissions));
          localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(sampleData.reviews));
          localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(sampleData.messages));
        } else {
          dispatch({
            type: 'LOAD_DATA',
            payload: { camps, users, assignments, submissions, reviews, messages },
          });
          
          if (session) {
            dispatch({ type: 'LOGIN', payload: { wxId: session.wxId } });
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      }
      setIsInitialized(true);
    };

    loadData();
  }, []);

  // 保存数据到 LocalStorage
  useEffect(() => {
    if (!isInitialized) return;

    try {
      localStorage.setItem(STORAGE_KEYS.CAMPS, JSON.stringify(state.camps));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(state.users));
      localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(state.assignments));
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(state.submissions));
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(state.reviews));
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(state.messages));
      
      if (state.currentUser) {
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({ wxId: state.currentUser.wxId }));
      } else {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
      }
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }, [state, isInitialized]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// 导入 useState
import { useState } from 'react';
