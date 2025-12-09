'use client'

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface PostFormImageSelectionProps {
  currentUrl: string;
  setUrl: (val: string) => void;
}

type LocalImage = {
  previewUrl: string;
  dataUrl: string;
  name: string;
};

export function PostFormImageSelection({
  currentUrl,
  setUrl,
}: PostFormImageSelectionProps) {
  const [images, setImages] = useState<LocalImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fileInputRef.current?.click();
  }, []);

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [images]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const fileArray = Array.from(files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (fileArray.length === 0) return;

    const readers = fileArray.map(
      (file) =>
        new Promise<LocalImage>((resolve, reject) => {
          const reader = new FileReader();
          const previewUrl = URL.createObjectURL(file);

          reader.onload = () => {
            const result = reader.result;
            if (typeof result !== "string") {
              URL.revokeObjectURL(previewUrl);
              reject(new Error("Errore lettura file"));
              return;
            }

            resolve({
              previewUrl,
              dataUrl: result,
              name: file.name,
            });
          };

          reader.onerror = () => {
            URL.revokeObjectURL(previewUrl);
            reject(reader.error ?? new Error("Errore lettura file"));
          };

          reader.readAsDataURL(file);
        })
    );

    Promise.all(readers)
      .then((newImages) => {
        setImages(newImages);
        setCurrentIndex(0);

        setUrl(newImages[0].dataUrl);
      })
      .catch((err) => {
        console.error("Errore caricamento immagini", err);
      })
      .finally(() => {
        e.target.value = "";
      });
  }

  function handleSelectIndex(index: number) {
    setCurrentIndex(index);
    setUrl(images[index].dataUrl);
  }

  const hasImages = images.length > 0;
  const activeImage = hasImages ? images[currentIndex] : null;

  return (
    <div className="flex flex-col gap-2 bg-white shadow-md rounded-md p-3 mt-0">

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {!hasImages && (
        <div
          className="flex flex-col items-center justify-center h-40 border border-dashed border-gray-400 rounded-md cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <span className="text-4xl text-gray-500">+</span>
          <span className="text-sm text-gray-500">Aggiungi immagine</span>
        </div>
      )}

      {hasImages && activeImage && (
        <div className="flex flex-col gap-2">
          <div className="relative w-full max-h-80 bg-black/5 rounded-md overflow-hidden flex items-center justify-center">
            <Image
              src={activeImage.previewUrl}
              alt={activeImage.name}
              width={600}
              height={400}
              className="object-contain max-h-80"
              unoptimized
            />
          </div>

          <div className="flex gap-2 overflow-x-auto py-1">
            {images.map((img, index) => (
              <button
                key={img.previewUrl}
                onClick={() => handleSelectIndex(index)}
                className={
                  "border rounded-md overflow-hidden flex-shrink-0 " +
                  (index === currentIndex ? "border-blue-500" : "border-transparent")
                }
                style={{ width: 64, height: 64 }}
              >
                <Image
                  src={img.previewUrl}
                  alt={img.name}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              </button>
            ))}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-gray-400 rounded-md flex-shrink-0 flex items-center justify-center text-3xl text-gray-400"
              style={{ width: 64, height: 64 }}
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
