'use client'

import { useState, useRef } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface ImageCarouselProps {
  images: (File | string)[];
  onChange: (images: (File | string)[]) => void;
}

export default function ImageCarousel({ images, onChange }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onChange([...images, ...files]);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
    if (currentIndex >= newImages.length) {
      setCurrentIndex(Math.max(0, newImages.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const getImageUrl = (image: File | string) => {
    if (typeof image === 'string') {
      return `${process.env.NEXT_PUBLIC_URL_API}${image}`;
    }
    return URL.createObjectURL(image);
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-red-400">Imágenes del producto</h3>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
        >
          Añadir imagen
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="hidden"
      />

      {images.length > 0 ? (
        <div className="relative bg-white rounded-lg border border-red-200 p-4">
          <div className="relative w-1/2 mx-auto aspect-video overflow-hidden rounded-lg">
            <img
              src={getImageUrl(images[currentIndex])}
              alt={`Imagen ${currentIndex + 1}`}
              className="w-full h-full object-contain"
            />
            
            {/* Botón de eliminar */}
            <button
              type="button"
              onClick={() => handleRemoveImage(currentIndex)}
              className="absolute top-2 right-4 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>

            {/* Controles de navegación */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-red-100 text-white rounded-full hover:bg-red-700 transition-colors"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-red-100 text-white rounded-full hover:bg-red-700 transition-colors"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* Indicador de imágenes */}
          <div className="mt-2 flex justify-center space-x-1">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-red-600' : 'bg-red-200'
                }`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-48 bg-white rounded-lg border-2 border-dashed border-red-200">
          <svg
            className="h-12 w-12 text-red-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm text-red-300">
            Haz clic en &quot;Añadir imagen&quot; para subir imágenes
          </p>
        </div>
      )}
    </div>
  );
} 