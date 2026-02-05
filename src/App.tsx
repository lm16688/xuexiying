import { AppProvider, useApp } from '@/contexts/AppContext';
import { Login } from '@/sections/Login';
import { RoleSelect } from '@/sections/RoleSelect';
import { AdminPanel } from '@/sections/AdminPanel';
import { TeacherPanel } from '@/sections/TeacherPanel';
import { StudentPanel } from '@/sections/StudentPanel';
import { Toaster } from '@/components/ui/sonner';

function AppContent() {
  const { state } = useApp();

  // 未登录
  if (!state.currentUser) {
    return <Login />;
  }

  // 未选择角色
  if (!state.currentRole) {
    return <RoleSelect />;
  }

  // 根据角色显示不同面板
  switch (state.currentRole) {
    case 'admin':
      return <AdminPanel />;
    case 'teacher':
      return <TeacherPanel />;
    case 'student':
      return <StudentPanel />;
    default:
      return <Login />;
  }
}

function App() {
  return (
    <AppProvider>
      <AppContent />
      <Toaster position="top-center" />
    </AppProvider>
  );
}

export default App;
