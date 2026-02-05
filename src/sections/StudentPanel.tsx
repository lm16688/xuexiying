import { useState } from 'react';
import {
  FileText,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Paperclip,
  Star,
  Send,
  Eye,
  EyeOff,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/Layout';
import { FileUpload } from '@/components/FileUpload';
import { useApp } from '@/contexts/AppContext';
import type { Camp, Assignment, Attachment } from '@/types';
import {
  generateId,
  formatDateTime,
  getRemainingTime,
  isOverdue,
} from '@/utils/helpers';

export function StudentPanel() {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('assignments');
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  // 提交表单
  const [submitForm, setSubmitForm] = useState({
    content: '',
    attachments: [] as Attachment[],
  });

  // 留言
  const [messageContent, setMessageContent] = useState('');

  // 选择学习营
  const handleSelectCamp = (camp: Camp) => {
    dispatch({ type: 'SET_CAMP', payload: camp });
  };

  // 设置昵称
  const handleSetNickname = (nickname: string) => {
    dispatch({ type: 'SET_NICKNAME', payload: nickname });
  };

  // 提交作业
  const handleSubmit = () => {
    if (!selectedAssignment || !submitForm.content.trim()) return;

    const submission = {
      id: generateId(),
      assignmentId: selectedAssignment.id,
      studentId: state.currentUser!.wxId,
      studentName: state.currentUser!.nickname,
      content: submitForm.content,
      attachments: submitForm.attachments,
      submittedAt: Date.now(),
    };

    dispatch({ type: 'CREATE_SUBMISSION', payload: submission });
    setSubmitForm({ content: '', attachments: [] });
    setIsSubmitOpen(false);
    setSelectedAssignment(null);
  };

  // 发送留言
  const handleSendMessage = (submissionId: string) => {
    if (!messageContent.trim()) return;

    const newMessage = {
      id: generateId(),
      submissionId,
      senderId: state.currentUser!.wxId,
      senderName: state.currentUser!.nickname,
      senderRole: 'student' as const,
      content: messageContent,
      createdAt: Date.now(),
    };

    dispatch({ type: 'CREATE_MESSAGE', payload: newMessage });
    setMessageContent('');
  };

  // 打开提交对话框
  const openSubmit = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsSubmitOpen(true);
  };

  // 获取当前学员的学习营
  const myCamps = state.camps.filter((camp) =>
    camp.students.includes(state.currentUser?.wxId || '')
  );

  // 获取当前学习营的作业
  const campAssignments = state.assignments.filter(
    (a) => a.campId === state.currentCamp?.id
  );

  // 获取我的提交
  const getMySubmission = (assignmentId: string) => {
    return state.submissions.find(
      (s) => s.assignmentId === assignmentId && s.studentId === state.currentUser?.wxId
    );
  };

  // 获取提交的评价
  const getReview = (submissionId: string) => {
    return state.reviews.find((r) => r.submissionId === submissionId);
  };

  // 获取提交的留言
  const getMessages = (submissionId: string) => {
    return state.messages.filter((m) => m.submissionId === submissionId);
  };

  // 如果没有选择学习营，显示选择界面
  if (!state.currentCamp) {
    return (
      <div className="min-h-screen bg-[#f8f5f2] flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#221f20] mb-2">选择学习营</h1>
            <p className="text-[#6b6b6b]">请选择一个学习营进入</p>
          </div>

          {myCamps.length === 0 ? (
            <Card className="border-[#e0ddd5]">
              <CardContent className="p-8 text-center">
                <p className="text-[#6b6b6b]">您还没有被分配到任何学习营</p>
                <p className="text-sm text-[#6b6b6b] mt-2">请联系管理员添加您到学习营</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myCamps.map((camp) => (
                <Card
                  key={camp.id}
                  onClick={() => handleSelectCamp(camp)}
                  className="border-[#e0ddd5] cursor-pointer hover:border-[#a6857b] hover:shadow-md transition-all"
                >
                  <CardHeader>
                    <CardTitle className="text-lg text-[#221f20]">{camp.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[#6b6b6b] line-clamp-2">
                      {camp.description || '暂无描述'}
                    </p>
                    <div className="flex items-center gap-4 mt-4 text-sm text-[#6b6b6b]">
                      <span>{camp.teachers.length} 位老师</span>
                      <span>{camp.students.length} 位学员</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 如果没有设置昵称，提示设置
  if (!state.currentUser?.nickname) {
    return (
      <div className="min-h-screen bg-[#f8f5f2] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-[#e0ddd5]">
          <CardHeader>
            <CardTitle className="text-[#221f20]">设置昵称</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-[#6b6b6b]">
              请设置一个昵称，这将显示在学习营中
            </p>
            <Input
              placeholder="请输入昵称"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSetNickname((e.target as HTMLInputElement).value);
                }
              }}
            />
            <Button
              onClick={() => {
                const input = document.querySelector('input') as HTMLInputElement;
                handleSetNickname(input.value);
              }}
              className="w-full bg-[#a6857b] hover:bg-[#8f6f66] text-white"
            >
              确认
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sidebar = (
    <div className="space-y-2">
      <div className="px-3 py-2">
        <h3 className="text-sm font-medium text-[#6b6b6b] uppercase tracking-wider">
          功能菜单
        </h3>
      </div>
      <Button
        variant="ghost"
        className={`w-full justify-start ${activeTab === 'assignments' ? 'bg-[#f8f5f2] text-[#a6857b]' : 'text-[#221f20]'}`}
        onClick={() => setActiveTab('assignments')}
      >
        <FileText className="w-4 h-4 mr-2" />
        我的作业
      </Button>
      <div className="pt-4 border-t border-[#e0ddd5]">
        <Button
          variant="ghost"
          className="w-full justify-start text-[#6b6b6b]"
          onClick={() => dispatch({ type: 'SET_CAMP', payload: null })}
        >
          切换学习营
        </Button>
      </div>
    </div>
  );

  return (
    <Layout sidebar={sidebar}>
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-[#221f20]">我的作业</h2>
            <p className="text-sm text-[#6b6b6b]">查看和完成作业</p>
          </div>

          <div className="space-y-4">
            {campAssignments.map((assignment) => {
              const submission = getMySubmission(assignment.id);
              const review = submission ? getReview(submission.id) : null;
              const messages = submission ? getMessages(submission.id) : [];
              const isExpanded = expandedAssignment === assignment.id;
              const overdue = isOverdue(assignment.deadline);

              return (
                <Card key={assignment.id} className="border-[#e0ddd5]">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg text-[#221f20]">
                            {assignment.title}
                          </CardTitle>
                          {submission ? (
                            <Badge className="bg-[#7b9e87] text-white">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              已完成
                            </Badge>
                          ) : overdue ? (
                            <Badge variant="destructive">已逾期</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[#a6857b] border-[#a6857b]">
                              <Clock className="w-3 h-3 mr-1" />
                              待完成
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-[#6b6b6b] mt-1">
                          布置老师: {assignment.teacherName || assignment.teacherId} |{' '}
                          {getRemainingTime(assignment.deadline)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedAssignment(isExpanded ? null : assignment.id)
                        }
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="space-y-4">
                      {/* 作业要求 */}
                      <div className="bg-[#f8f5f2] rounded-lg p-4">
                        <p className="text-sm font-medium text-[#6b6b6b] mb-2">作业要求:</p>
                        <p className="text-sm text-[#221f20]">{assignment.content}</p>

                        {assignment.attachments.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-[#6b6b6b] mb-2">老师附件:</p>
                            <div className="flex flex-wrap gap-2">
                              {assignment.attachments.map((att) => (
                                <a
                                  key={att.id}
                                  href={att.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-sm hover:bg-[#e0ddd5] transition-colors"
                                >
                                  <Paperclip className="w-4 h-4" />
                                  <span className="truncate max-w-[150px]">{att.name}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 我的提交 */}
                      {submission ? (
                        <div className="border border-[#e0ddd5] rounded-lg p-4">
                          <p className="text-sm font-medium text-[#6b6b6b] mb-2">
                            我的提交 ({formatDateTime(submission.submittedAt)}):
                          </p>
                          <p className="text-sm text-[#221f20] mb-3">{submission.content}</p>

                          {submission.attachments.length > 0 && (
                            <div className="mb-3">
                              <p className="text-sm font-medium text-[#6b6b6b] mb-2">我的附件:</p>
                              <div className="flex flex-wrap gap-2">
                                {submission.attachments.map((att) => (
                                  <a
                                    key={att.id}
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3 py-2 bg-[#f8f5f2] rounded-lg text-sm hover:bg-[#e0ddd5] transition-colors"
                                  >
                                    <Paperclip className="w-4 h-4" />
                                    <span className="truncate max-w-[150px]">{att.name}</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 评价 */}
                          {review && (
                            <div
                              className={`rounded-lg p-3 mt-3 ${
                                review.isPublic ? 'bg-[#7b9e87]/10' : 'bg-[#f8f5f2]'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-[#221f20]">老师评价</span>
                                <div className="flex">
                                  {[...Array(review.rating)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                                    />
                                  ))}
                                </div>
                                {review.isPublic ? (
                                  <Badge variant="outline" className="text-xs">
                                    <Eye className="w-3 h-3 mr-1" />
                                    公开
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">
                                    <EyeOff className="w-3 h-3 mr-1" />
                                    私密
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-[#221f20]">{review.comment}</p>
                            </div>
                          )}

                          {/* 留言 */}
                          {messages.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-medium text-[#6b6b6b] mb-2">留言:</p>
                              <div className="space-y-2">
                                {messages.map((msg) => (
                                  <div
                                    key={msg.id}
                                    className={`p-3 rounded-lg text-sm ${
                                      msg.senderRole === 'student'
                                        ? 'bg-[#a6857b]/10 ml-8'
                                        : 'bg-[#f8f5f2] mr-8'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium">
                                        {msg.senderName || msg.senderId}
                                      </span>
                                      <span className="text-xs text-[#6b6b6b]">
                                        {formatDateTime(msg.createdAt)}
                                      </span>
                                    </div>
                                    <p>{msg.content}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 回复留言 */}
                          <div className="flex gap-2 mt-4">
                            <Input
                              value={messageContent}
                              onChange={(e) => setMessageContent(e.target.value)}
                              placeholder="给老师留言..."
                            />
                            <Button
                              onClick={() => handleSendMessage(submission.id)}
                              className="bg-[#a6857b] hover:bg-[#8f6f66]"
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* 提交按钮 */
                        !overdue && (
                          <Button
                            onClick={() => openSubmit(assignment)}
                            className="bg-[#a6857b] hover:bg-[#8f6f66] text-white"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            提交作业
                          </Button>
                        )
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>

          {campAssignments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-[#e0ddd5] mb-4" />
              <p className="text-[#6b6b6b]">暂无作业</p>
            </div>
          )}
        </div>
      )}

      {/* 提交作业对话框 */}
      <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
        <DialogContent className="border-[#e0ddd5] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#221f20]">
              提交作业 - {selectedAssignment?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="submit-content">作业内容</Label>
              <Textarea
                id="submit-content"
                value={submitForm.content}
                onChange={(e) =>
                  setSubmitForm({ ...submitForm, content: e.target.value })
                }
                placeholder="请输入作业内容"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>附件</Label>
              <FileUpload
                attachments={submitForm.attachments}
                onChange={(attachments) =>
                  setSubmitForm({ ...submitForm, attachments })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubmitOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-[#a6857b] hover:bg-[#8f6f66] text-white"
            >
              提交作业
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
