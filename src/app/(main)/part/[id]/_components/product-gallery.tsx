"use client";

import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ProductGalleryProps {
  partImages: { url: string }[];
  title: string;
}

export function ProductGallery({
  partImages = [],
  title,
}: ProductGalleryProps) {
  const images = useMemo(() => {
    return partImages?.map((img) => img?.url);
  }, [partImages?.map]);
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
        <img
          src={images[currentImage] || "/media/placeholder.png"}
          alt={`${title} - Image ${currentImage + 1}`}
          className="h-full w-full object-cover"
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="-translate-y-1/2 absolute top-1/2 left-2 bg-background/80 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="-translate-y-1/2 absolute top-1/2 right-2 bg-background/80 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Expand Button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-background/80 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Expand className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader className="sr-only">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>
                {currentImage + 1} / {images.length}
              </DialogDescription>
            </DialogHeader>
            <img
              src={images[currentImage] || "/placeholder.svg"}
              alt={`${title} - Image ${currentImage + 1}`}
              className="h-auto max-h-[80vh] w-full object-contain"
            />
          </DialogContent>
        </Dialog>

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute right-2 bottom-2 rounded bg-background/80 px-2 py-1 text-foreground text-sm">
            {currentImage + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                index === currentImage
                  ? "border-accent"
                  : "border-border hover:border-accent/50"
              }`}
            >
              <img
                src={image || "/placeholder.svg"}
                alt={`${title} thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
