import { useState } from 'react';
import { Shield, GraduationCap, User, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import type { UserRole } from '@/types';

const roles = [
  {
    id: 'admin' as UserRole,
    name: '管理员',
    description: '管理学习营和成员',
    icon: Shield,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    hoverColor: 'hover:border-purple-400 hover:bg-purple-50',
  },
  {
    id: 'teacher' as UserRole,
    name: '老师',
    description: '布置作业和评价学员',
    icon: GraduationCap,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    hoverColor: 'hover:border-blue-400 hover:bg-blue-50',
  },
  {
    id: 'student' as UserRole,
    name: '学员',
    description: '完成作业和互动交流',
    icon: User,
    color: 'bg-green-100 text-green-700 border-green-200',
    hoverColor: 'hover:border-green-400 hover:bg-green-50',
  },
];

export function RoleSelect() {
  const { state, dispatch } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleConfirm = () => {
    if (selectedRole) {
      dispatch({ type: 'SET_ROLE', payload: selectedRole });
    }
  };

  // 检查用户是否已有角色
  const existingUser = state.users.find(u => u.wxId === state.currentUser?.wxId);
  if (existingUser && existingUser.role) {
    // 如果已有角色，自动设置
    dispatch({ type: 'SET_ROLE', payload: existingUser.role });
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f8f5f2] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#221f20] mb-2">
            请选择您的身份
          </h1>
          <p className="text-[#6b6b6b]">
            选择后将决定您在平台中的权限和功能
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;

            return (
              <Card
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`
                  cursor-pointer transition-all duration-200 border-2
                  ${role.hoverColor}
                  ${isSelected
                    ? `${role.color} border-current`
                    : 'bg-white border-[#e0ddd5]'
                  }
                `}
              >
                <CardContent className="p-6 text-center">
                  <div
                    className={`
                      w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4
                      ${isSelected ? 'bg-white/50' : role.color}
                    `}
                  >
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{role.name}</h3>
                  <p className={`text-sm ${isSelected ? 'text-current opacity-80' : 'text-[#6b6b6b]'}`}>
                    {role.description}
                  </p>
                  {isSelected && (
                    <div className="mt-4">
                      <span className="inline-flex items-center gap-1 text-sm font-medium">
                        <Check className="w-4 h-4" />
                        已选择
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button
            onClick={handleConfirm}
            disabled={!selectedRole}
            className="bg-[#a6857b] hover:bg-[#8f6f66] text-white px-8 h-12"
          >
            确认选择
          </Button>
        </div>
      </div>
    </div>
  );
}
