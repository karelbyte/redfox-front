'use client'
import { useState, useRef } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
interface ImageUploadProps {
  value?: string;
  onChange: (file: File | null) => void;
  error?: string;
}

export default function ImageUpload({ value, onChange, error }: ImageUploadProps) {
  const getImageUrl = (value: string | undefined) => {
    return value ? `${process.env.NEXT_PUBLIC_URL_API}${value}` : null;
  }
  const [preview, setPreview] = useState<string | null>(getImageUrl(value) || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onChange(file);
    } else {
      setPreview(null);
      onChange(null);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div
        onClick={handleClick}
        className={`relative cursor-pointer rounded-lg border-2 border-dashed ${
          error ? 'border-red-300' : 'border-red-200'
        } p-4 hover:border-red-300 transition-colors`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        
        {preview ? (
          <div className="relative">
            <Image
              src={preview}
              alt="Preview"
              width={80}
              height={80}
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ) :  (
          <div className="flex flex-col items-center justify-center py-6">
            <PhotoIcon className="h-12 w-12 text-red-300 mb-2" />
            <p className="text-sm text-red-400">
              Haz clic para seleccionar una imagen
            </p>
            <p className="text-xs text-red-300 mt-1">
              PNG, JPG, GIF hasta 5MB
            </p>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
} 