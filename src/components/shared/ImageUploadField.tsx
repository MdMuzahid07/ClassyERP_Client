import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadFieldProps {
  value: File | string | null;
  onChange: (file: File | null) => void;
  error?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({ value, onChange, error }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getPreviewUrl = () => {
    if (value instanceof File) {
      return URL.createObjectURL(value);
    }
    if (typeof value === 'string') {
      if (value.startsWith('http') || value.startsWith('/')) {
        return value;
      }
      const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
      const apiHost = apiUrl ? apiUrl.replace('/api/v1', '') : 'http://localhost:5000';
      return `${apiHost}/${value}`;
    }
    return null;
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      return;
    }
    onChange(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const preview = getPreviewUrl();

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-foreground">Product Image</span>

      <div
        className={`relative border-2 border-dashed rounded-xl transition-colors cursor-pointer ${
          preview
            ? 'border-border bg-muted/30'
            : isDragActive
              ? 'border-blue-500 bg-blue-500/10'
              : error
                ? 'border-red-300 dark:border-red-900 bg-red-50/10'
                : 'border-border hover:border-blue-500 bg-card text-foreground'
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />

        {preview ? (
          <div className="relative p-4 flex flex-col items-center justify-center min-h-[160px]">
            <img
              src={preview}
              alt="Preview"
              className="max-h-36 rounded-lg object-contain border border-border bg-card"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-slate-900 transition-colors"
              title="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center min-h-[160px] space-y-2">
            <div className="p-3 rounded-full bg-muted text-muted-foreground hover:text-blue-500 transition-colors">
              <Upload className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Drag & drop an image, or{' '}
                <span className="text-blue-600 hover:underline">browse</span>
              </p>
              <p className="text-xs text-muted-foreground">Supports JPG, PNG, WEBP up to 5MB</p>
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
};
export default ImageUploadField;
