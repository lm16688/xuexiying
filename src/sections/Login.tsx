import { useState } from 'react';
import { BookOpen, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';

export function Login() {
  const { dispatch } = useApp();
  const [wxId, setWxId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!wxId.trim()) {
      alert('请输入微信号');
      return;
    }

    setIsLoading(true);
    // 模拟微信登录延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    dispatch({ type: 'LOGIN', payload: { wxId: wxId.trim() } });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f8f5f2] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-[#e0ddd5] shadow-lg">
        <CardHeader className="text-center pb-8">
          <div className="w-20 h-20 bg-[#a6857b] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#221f20]">
            学习营分享平台
          </CardTitle>
          <CardDescription className="text-[#6b6b6b]">
            连接老师与学员的学习社区
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="wxid" className="text-[#221f20]">
              微信号
            </Label>
            <Input
              id="wxid"
              placeholder="请输入您的微信号"
              value={wxId}
              onChange={(e) => setWxId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="border-[#e0ddd5] focus:border-[#a6857b] focus:ring-[#a6857b]"
            />
            <p className="text-xs text-[#6b6b6b]">
              演示账号: admin001, teacher001, teacher002, student001, student002, student003
            </p>
          </div>

          <Button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-[#a6857b] hover:bg-[#8f6f66] text-white h-12"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            {isLoading ? '登录中...' : '微信登录'}
          </Button>

          <div className="text-center text-sm text-[#6b6b6b]">
            <p>首次登录请直接输入微信号</p>
            <p>系统将自动创建账号</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
