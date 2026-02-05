import { useState, useRef } from 'react';
import { Upload, X, Image, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Attachment } from '@/types';
import { generateId, formatFileSize, getFileIconColor, getFileTypeName } from '@/utils/helpers';

interface FileUploadProps {
  attachments: Attachment[];
  onChange: (attachments: Attachment[]) => void;
  maxFiles?: number;
  maxSize?: number; // MB
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function FileUpload({
  attachments,
  onChange,
  maxFiles = 5,
  maxSize = 5,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (attachments.length + files.length > maxFiles) {
      alert(`最多只能上传 ${maxFiles} 个文件`);
      return;
    }

    setUploading(true);

    const newAttachments: Attachment[] = [];

    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_SIZE) {
        alert(`文件 ${file.name} 超过 ${maxSize}MB 限制`);
        continue;
      }

      try {
        const base64 = await fileToBase64(file);
        newAttachments.push({
          id: generateId(),
          name: file.name,
          type: file.type,
          url: base64,
          size: file.size,
        });
      } catch (error) {
        console.error('File conversion failed:', error);
      }
    }

    onChange([...attachments, ...newAttachments]);
    setUploading(false);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleRemove = (id: string) => {
    onChange(attachments.filter(a => a.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  return (
    <div className="space-y-3">
      {/* 上传区域 */}
      {attachments.length < maxFiles && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            transition-all duration-200
            ${isDragging
              ? 'border-[#a6857b] bg-[#a6857b]/5'
              : 'border-[#e0ddd5] hover:border-[#a6857b] hover:bg-[#f8f5f2]'
            }
          `}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          <Upload className="w-8 h-8 mx-auto mb-2 text-[#a6857b]" />
          <p className="text-sm text-[#221f20]">
            {uploading ? '上传中...' : '点击或拖拽文件到此处上传'}
          </p>
          <p className="text-xs text-[#6b6b6b] mt-1">
            支持图片、PDF、Word、Excel、PPT，单个文件不超过 {maxSize}MB
          </p>
        </div>
      )}

      {/* 文件列表 */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#e0ddd5]"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${getFileIconColor(attachment.type)}20` }}
                >
                  <span style={{ color: getFileIconColor(attachment.type) }}>
                    {getFileIcon(attachment.type)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#221f20] truncate max-w-[200px]">
                    {attachment.name}
                  </p>
                  <p className="text-xs text-[#6b6b6b]">
                    {getFileTypeName(attachment.type)} · {formatFileSize(attachment.size)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(attachment.id)}
                className="text-[#6b6b6b] hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
