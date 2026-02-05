import { useState } from 'react';
import {
  Plus,
  FileText,
  Users,
  Eye,
  EyeOff,
  Star,
  Send,
  ChevronDown,
  ChevronUp,
  Paperclip,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// Tabs component not used in this panel
import { Switch } from '@/components/ui/switch';
import { Layout } from '@/components/Layout';
import { FileUpload } from '@/components/FileUpload';
import { useApp } from '@/contexts/AppContext';
import type { Camp, Assignment, Review, Message, Attachment } from '@/types';
import {
  generateId,
  formatDate,
  formatDateTime,
  getRemainingTime,
} from '@/utils/helpers';

export function TeacherPanel() {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('assignments');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null);
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null);

  // 表单状态
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    content: '',
    deadline: '',
    attachments: [] as Attachment[],
  });

  // 评价表单
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    isPublic: true,
  });

  // 留言回复
  const [replyContent, setReplyContent] = useState('');

  // 选择学习营
  const handleSelectCamp = (camp: Camp) => {
    dispatch({ type: 'SET_CAMP', payload: camp });
  };

  // 设置昵称
  const handleSetNickname = (nickname: string) => {
    dispatch({ type: 'SET_NICKNAME', payload: nickname });
  };

  // 创建作业
  const handleCreateAssignment = () => {
    if (!state.currentCamp || !assignmentForm.title.trim()) return;

    const newAssignment: Assignment = {
      id: generateId(),
      campId: state.currentCamp.id,
      teacherId: state.currentUser!.wxId,
      teacherName: state.currentUser!.nickname,
      title: assignmentForm.title,
      content: assignmentForm.content,
      attachments: assignmentForm.attachments,
      deadline: assignmentForm.deadline
        ? new Date(assignmentForm.deadline).getTime()
        : Date.now() + 7 * 24 * 60 * 60 * 1000,
      createdAt: Date.now(),
    };

    dispatch({ type: 'CREATE_ASSIGNMENT', payload: newAssignment });
    setAssignmentForm({ title: '', content: '', deadline: '', attachments: [] });
    setIsCreateOpen(false);
  };

  // 提交评价
  const handleSubmitReview = (submissionId: string) => {
    if (!reviewForm.comment.trim()) return;

    const newReview: Review = {
      id: generateId(),
      submissionId,
      teacherId: state.currentUser!.wxId,
      teacherName: state.currentUser!.nickname,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
      isPublic: reviewForm.isPublic,
      createdAt: Date.now(),
    };

    dispatch({ type: 'CREATE_REVIEW', payload: newReview });
    setReviewForm({ rating: 5, comment: '', isPublic: true });
  };

  // 发送留言
  const handleSendMessage = (submissionId: string) => {
    if (!replyContent.trim()) return;

    const newMessage: Message = {
      id: generateId(),
      submissionId,
      senderId: state.currentUser!.wxId,
      senderName: state.currentUser!.nickname,
      senderRole: 'teacher',
      content: replyContent,
      createdAt: Date.now(),
    };

    dispatch({ type: 'CREATE_MESSAGE', payload: newMessage });
    setReplyContent('');
  };

  // 获取当前老师的学习营
  const myCamps = state.camps.filter((camp) =>
    camp.teachers.includes(state.currentUser?.wxId || '')
  );

  // 获取当前学习营的作业
  const campAssignments = state.assignments.filter(
    (a) => a.campId === state.currentCamp?.id
  );

  // 获取作业的提交
  const getSubmissions = (assignmentId: string) => {
    return state.submissions.filter((s) => s.assignmentId === assignmentId);
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
        布置作业
      </Button>
      <Button
        variant="ghost"
        className={`w-full justify-start ${activeTab === 'submissions' ? 'bg-[#f8f5f2] text-[#a6857b]' : 'text-[#221f20]'}`}
        onClick={() => setActiveTab('submissions')}
      >
        <Users className="w-4 h-4 mr-2" />
        查看作业
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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#221f20]">作业管理</h2>
              <p className="text-sm text-[#6b6b6b]">布置和管理作业</p>
            </div>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="bg-[#a6857b] hover:bg-[#8f6f66] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              布置作业
            </Button>
          </div>

          <div className="space-y-4">
            {campAssignments.map((assignment) => (
              <Card key={assignment.id} className="border-[#e0ddd5]">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-[#221f20]">{assignment.title}</CardTitle>
                      <p className="text-sm text-[#6b6b6b] mt-1">
                        布置时间: {formatDate(assignment.createdAt)} |{' '}
                        {getRemainingTime(assignment.deadline)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedAssignment(
                          expandedAssignment === assignment.id ? null : assignment.id
                        )
                      }
                    >
                      {expandedAssignment === assignment.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                {expandedAssignment === assignment.id && (
                  <CardContent>
                    <div className="prose prose-sm max-w-none text-[#221f20]">
                      <p>{assignment.content}</p>
                    </div>
                    {assignment.attachments.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-[#6b6b6b] mb-2">附件:</p>
                        <div className="flex flex-wrap gap-2">
                          {assignment.attachments.map((att) => (
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
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {campAssignments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-[#e0ddd5] mb-4" />
              <p className="text-[#6b6b6b]">暂无作业，点击上方按钮布置</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'submissions' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-[#221f20]">学员作业</h2>
            <p className="text-sm text-[#6b6b6b]">查看和评价学员提交的作业</p>
          </div>

          <div className="space-y-4">
            {campAssignments.map((assignment) => {
              const submissions = getSubmissions(assignment.id);
              return (
                <Card key={assignment.id} className="border-[#e0ddd5]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-[#221f20]">{assignment.title}</CardTitle>
                    <p className="text-sm text-[#6b6b6b]">
                      已提交: {submissions.length} 人
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {submissions.map((submission) => {
                        const review = getReview(submission.id);
                        const messages = getMessages(submission.id);
                        const isExpanded = expandedSubmission === submission.id;

                        return (
                          <div
                            key={submission.id}
                            className="border border-[#e0ddd5] rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-[#221f20]">
                                  {submission.studentName || submission.studentId}
                                </p>
                                <p className="text-sm text-[#6b6b6b]">
                                  提交时间: {formatDateTime(submission.submittedAt)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {review && (
                                  <Badge className="bg-[#7b9e87] text-white">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    已评价
                                  </Badge>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setExpandedSubmission(isExpanded ? null : submission.id)
                                  }
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="mt-4 space-y-4 border-t border-[#e0ddd5] pt-4">
                                {/* 作业内容 */}
                                <div>
                                  <p className="text-sm font-medium text-[#6b6b6b] mb-2">
                                    作业内容:
                                  </p>
                                  <p className="text-sm text-[#221f20]">{submission.content}</p>
                                </div>

                                {/* 附件 */}
                                {submission.attachments.length > 0 && (
                                  <div>
                                    <p className="text-sm font-medium text-[#6b6b6b] mb-2">
                                      附件:
                                    </p>
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

                                {/* 留言 */}
                                {messages.length > 0 && (
                                  <div>
                                    <p className="text-sm font-medium text-[#6b6b6b] mb-2">
                                      留言:
                                    </p>
                                    <div className="space-y-2">
                                      {messages.map((msg) => (
                                        <div
                                          key={msg.id}
                                          className={`p-3 rounded-lg text-sm ${
                                            msg.senderRole === 'teacher'
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

                                {/* 评价表单 */}
                                {!review ? (
                                  <div className="bg-[#f8f5f2] rounded-lg p-4">
                                    <p className="text-sm font-medium text-[#221f20] mb-3">
                                      评价作业
                                    </p>
                                    <div className="space-y-3">
                                      <div>
                                        <Label className="text-sm">评分</Label>
                                        <div className="flex gap-1 mt-1">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <Button
                                              key={star}
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                setReviewForm({ ...reviewForm, rating: star })
                                              }
                                              className="p-1"
                                            >
                                              <Star
                                                className={`w-5 h-5 ${
                                                  star <= reviewForm.rating
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-[#e0ddd5]'
                                                }`}
                                              />
                                            </Button>
                                          ))}
                                        </div>
                                      </div>
                                      <div>
                                        <Label className="text-sm">评语</Label>
                                        <Textarea
                                          value={reviewForm.comment}
                                          onChange={(e) =>
                                            setReviewForm({ ...reviewForm, comment: e.target.value })
                                          }
                                          placeholder="请输入评语"
                                          rows={3}
                                        />
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Switch
                                          checked={reviewForm.isPublic}
                                          onCheckedChange={(checked) =>
                                            setReviewForm({ ...reviewForm, isPublic: checked })
                                          }
                                        />
                                        <Label className="text-sm">对所有人可见</Label>
                                      </div>
                                      <Button
                                        onClick={() => handleSubmitReview(submission.id)}
                                        className="bg-[#a6857b] hover:bg-[#8f6f66] text-white"
                                      >
                                        提交评价
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-[#7b9e87]/10 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="font-medium text-[#221f20]">我的评价</span>
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

                                {/* 回复留言 */}
                                <div className="flex gap-2">
                                  <Input
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="回复留言..."
                                  />
                                  <Button
                                    onClick={() => handleSendMessage(submission.id)}
                                    className="bg-[#a6857b] hover:bg-[#8f6f66]"
                                  >
                                    <Send className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {submissions.length === 0 && (
                        <p className="text-sm text-[#6b6b6b] text-center py-4">
                          暂无学员提交作业
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* 创建作业对话框 */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="border-[#e0ddd5] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#221f20]">布置作业</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">作业标题</Label>
              <Input
                id="title"
                value={assignmentForm.title}
                onChange={(e) =>
                  setAssignmentForm({ ...assignmentForm, title: e.target.value })
                }
                placeholder="请输入作业标题"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">作业内容</Label>
              <Textarea
                id="content"
                value={assignmentForm.content}
                onChange={(e) =>
                  setAssignmentForm({ ...assignmentForm, content: e.target.value })
                }
                placeholder="请输入作业内容"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">截止时间</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={assignmentForm.deadline}
                onChange={(e) =>
                  setAssignmentForm({ ...assignmentForm, deadline: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>附件</Label>
              <FileUpload
                attachments={assignmentForm.attachments}
                onChange={(attachments) =>
                  setAssignmentForm({ ...assignmentForm, attachments })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleCreateAssignment}
              className="bg-[#a6857b] hover:bg-[#8f6f66] text-white"
            >
              发布作业
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
