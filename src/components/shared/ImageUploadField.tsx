import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadFieldProps {
  value: File | string | null;
  onChange: (file: File | null) => void;
  error?: string;
  isUploading?: boolean;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  value,
  onChange,
  error,
  isUploading = false,
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles?.[0]) {
        const file = acceptedFiles[0];
        if (file.size > 5 * 1024 * 1024) {
          toast.error('File size exceeds 5MB limit');
          return;
        }
        onChange(file);
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

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

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(null);
  };

  const preview = getPreviewUrl();

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-foreground">Product Image</span>

      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl transition-colors cursor-pointer ${
          preview
            ? 'border-border bg-muted/30'
            : isDragActive
              ? 'border-blue-500 bg-blue-500/10'
              : error
                ? 'border-red-300 dark:border-red-900 bg-red-50/10'
                : 'border-border hover:border-blue-500 bg-card text-foreground'
        }`}
      >
        <input {...getInputProps()} />

        {isUploading && (
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center space-y-2 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
            <span className="text-xs font-semibold text-white">Uploading image...</span>
          </div>
        )}

        {preview ? (
          <div className="relative p-4 flex flex-col items-center justify-center min-h-[160px]">
            <img
              src={preview}
              alt="Preview"
              className="pointer-events-none max-h-36 rounded-lg object-contain border border-border bg-card"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-slate-900 transition-colors z-20"
              title="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="pointer-events-none flex flex-col items-center justify-center py-8 px-4 text-center min-h-[160px] space-y-2">
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
