import { useState } from 'react';
import { Plus, Edit2, Trash2, Users, BookOpen, UserPlus, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Layout } from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import type { Camp } from '@/types';
import { generateId, formatDate } from '@/utils/helpers';

export function AdminPanel() {
  const { state, dispatch } = useApp();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [selectedCamp, setSelectedCamp] = useState<Camp | null>(null);
  const [newMemberWxId, setNewMemberWxId] = useState('');
  const [memberRole, setMemberRole] = useState<'teacher' | 'student'>('student');

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleCreate = () => {
    if (!formData.name.trim()) {
      alert('请输入学习营名称');
      return;
    }

    const newCamp: Camp = {
      id: generateId(),
      name: formData.name,
      description: formData.description,
      createdAt: Date.now(),
      teachers: [],
      students: [],
    };

    dispatch({ type: 'CREATE_CAMP', payload: newCamp });
    setFormData({ name: '', description: '' });
    setIsCreateOpen(false);
  };

  const handleEdit = () => {
    if (!selectedCamp || !formData.name.trim()) return;

    dispatch({
      type: 'UPDATE_CAMP',
      payload: { ...selectedCamp, name: formData.name, description: formData.description },
    });
    setIsEditOpen(false);
    setSelectedCamp(null);
  };

  const handleDelete = () => {
    if (selectedCamp) {
      dispatch({ type: 'DELETE_CAMP', payload: selectedCamp.id });
      setIsDeleteOpen(false);
      setSelectedCamp(null);
    }
  };

  const openEdit = (camp: Camp) => {
    setSelectedCamp(camp);
    setFormData({ name: camp.name, description: camp.description });
    setIsEditOpen(true);
  };

  const openDelete = (camp: Camp) => {
    setSelectedCamp(camp);
    setIsDeleteOpen(true);
  };

  const openMembers = (camp: Camp) => {
    setSelectedCamp(camp);
    setIsMembersOpen(true);
  };

  const handleAddMember = () => {
    if (!selectedCamp || !newMemberWxId.trim()) return;

    const actionType = memberRole === 'teacher' ? 'ADD_TEACHER' : 'ADD_STUDENT';
    dispatch({
      type: actionType,
      payload: { campId: selectedCamp.id, wxId: newMemberWxId.trim() },
    });

    // 同时更新用户列表
    const existingUser = state.users.find(u => u.wxId === newMemberWxId.trim());
    if (!existingUser) {
      dispatch({
        type: 'LOAD_DATA',
        payload: {
          users: [
            ...state.users,
            {
              wxId: newMemberWxId.trim(),
              role: memberRole,
              campId: selectedCamp.id,
            },
          ],
        },
      });
    }

    setNewMemberWxId('');
  };

  const handleRemoveMember = (wxId: string) => {
    if (!selectedCamp) return;
    dispatch({
      type: 'REMOVE_MEMBER',
      payload: { campId: selectedCamp.id, wxId },
    });
  };

  const sidebar = (
    <div className="space-y-2">
      <div className="px-3 py-2">
        <h3 className="text-sm font-medium text-[#6b6b6b] uppercase tracking-wider">
          管理菜单
        </h3>
      </div>
      <Button
        variant="ghost"
        className="w-full justify-start text-[#221f20] bg-[#f8f5f2]"
      >
        <BookOpen className="w-4 h-4 mr-2" />
        学习营管理
      </Button>
    </div>
  );

  return (
    <Layout sidebar={sidebar}>
      <div className="space-y-6">
        {/* 头部 */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#221f20]">学习营管理</h2>
            <p className="text-sm text-[#6b6b6b]">创建和管理学习营，添加老师和学员</p>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-[#a6857b] hover:bg-[#8f6f66] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            新建学习营
          </Button>
        </div>

        {/* 学习营列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.camps.map((camp) => (
            <Card key={camp.id} className="border-[#e0ddd5]">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg text-[#221f20]">{camp.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openMembers(camp)}
                      className="text-[#6b6b6b] hover:text-[#a6857b]"
                    >
                      <Users className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(camp)}
                      className="text-[#6b6b6b] hover:text-[#a6857b]"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDelete(camp)}
                      className="text-[#6b6b6b] hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#6b6b6b] mb-4 line-clamp-2">
                  {camp.description || '暂无描述'}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-[#6b6b6b]">
                    <Users className="w-4 h-4" />
                    <span>{camp.teachers.length} 位老师</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#6b6b6b]">
                    <Users className="w-4 h-4" />
                    <span>{camp.students.length} 位学员</span>
                  </div>
                </div>
                <p className="text-xs text-[#6b6b6b] mt-3">
                  创建于 {formatDate(camp.createdAt)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {state.camps.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 mx-auto text-[#e0ddd5] mb-4" />
            <p className="text-[#6b6b6b]">暂无学习营，点击上方按钮创建</p>
          </div>
        )}
      </div>

      {/* 创建对话框 */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="border-[#e0ddd5]">
          <DialogHeader>
            <DialogTitle className="text-[#221f20]">新建学习营</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">学习营名称</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入学习营名称"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="请输入学习营描述"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreate} className="bg-[#a6857b] hover:bg-[#8f6f66] text-white">
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑对话框 */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="border-[#e0ddd5]">
          <DialogHeader>
            <DialogTitle className="text-[#221f20]">编辑学习营</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">学习营名称</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">描述</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              取消
            </Button>
            <Button onClick={handleEdit} className="bg-[#a6857b] hover:bg-[#8f6f66] text-white">
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="border-[#e0ddd5]">
          <DialogHeader>
            <DialogTitle className="text-[#221f20]">确认删除</DialogTitle>
          </DialogHeader>
          <p className="text-[#6b6b6b] py-4">
            确定要删除学习营 "{selectedCamp?.name}" 吗？此操作不可恢复。
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              取消
            </Button>
            <Button onClick={handleDelete} variant="destructive">
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 成员管理对话框 */}
      <Dialog open={isMembersOpen} onOpenChange={setIsMembersOpen}>
        <DialogContent className="border-[#e0ddd5] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#221f20]">管理成员 - {selectedCamp?.name}</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="teachers" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="teachers">老师 ({selectedCamp?.teachers.length})</TabsTrigger>
              <TabsTrigger value="students">学员 ({selectedCamp?.students.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="teachers" className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="输入微信号添加老师"
                  value={memberRole === 'teacher' ? newMemberWxId : ''}
                  onChange={(e) => {
                    setMemberRole('teacher');
                    setNewMemberWxId(e.target.value);
                  }}
                />
                <Button onClick={handleAddMember} className="bg-[#a6857b] hover:bg-[#8f6f66]">
                  <UserPlus className="w-4 h-4" />
                </Button>
              </div>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {selectedCamp?.teachers.map((wxId) => (
                    <div
                      key={wxId}
                      className="flex items-center justify-between p-2 bg-[#f8f5f2] rounded"
                    >
                      <span className="text-sm">{wxId}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(wxId)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="students" className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="输入微信号添加学员"
                  value={memberRole === 'student' ? newMemberWxId : ''}
                  onChange={(e) => {
                    setMemberRole('student');
                    setNewMemberWxId(e.target.value);
                  }}
                />
                <Button onClick={handleAddMember} className="bg-[#a6857b] hover:bg-[#8f6f66]">
                  <UserPlus className="w-4 h-4" />
                </Button>
              </div>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {selectedCamp?.students.map((wxId) => (
                    <div
                      key={wxId}
                      className="flex items-center justify-between p-2 bg-[#f8f5f2] rounded"
                    >
                      <span className="text-sm">{wxId}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(wxId)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
