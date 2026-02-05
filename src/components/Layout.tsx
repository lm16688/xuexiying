import { LogOut, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useApp } from '@/contexts/AppContext';

interface LayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

export function Layout({ children, sidebar }: LayoutProps) {
  const { state, dispatch } = useApp();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const getRoleName = () => {
    switch (state.currentRole) {
      case 'admin':
        return '管理员';
      case 'teacher':
        return '老师';
      case 'student':
        return '学员';
      default:
        return '';
    }
  };

  const getRoleColor = () => {
    switch (state.currentRole) {
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      case 'teacher':
        return 'bg-blue-100 text-blue-700';
      case 'student':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f5f2]">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-[#e0ddd5] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#a6857b] rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-[#221f20]">学习营分享平台</h1>
                {state.currentCamp && (
                  <p className="text-xs text-[#6b6b6b]">{state.currentCamp.name}</p>
                )}
              </div>
            </div>

            {/* 用户信息 */}
            {state.currentUser && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className={getRoleColor()}>
                      {state.currentUser.nickname?.[0] || state.currentUser.wxId[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-[#221f20]">
                      {state.currentUser.nickname || state.currentUser.wxId}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleColor()}`}>
                      {getRoleName()}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-[#6b6b6b] hover:text-[#221f20]"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* 侧边栏 */}
          {sidebar && (
            <aside className="w-64 flex-shrink-0 hidden md:block">
              <div className="bg-white rounded-xl shadow-sm border border-[#e0ddd5] p-4 sticky top-24">
                {sidebar}
              </div>
            </aside>
          )}

          {/* 内容 */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-xl shadow-sm border border-[#e0ddd5] p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
