"use client";

import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
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
  const [api, setApi] = useState<CarouselApi | null>(null);

  // Listen to carousel changes to sync currentImage state
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      const selectedIndex = api.selectedScrollSnap();
      setCurrentImage(selectedIndex);
    };

    api.on("select", onSelect);
    onSelect(); // Set initial state

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Scroll carousel when thumbnail is clicked
  const onThumbnailClick = useCallback(
    (index: number) => {
      if (api) {
        api.scrollTo(index);
      } else {
        setCurrentImage(index);
      }
    },
    [api],
  );

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
        <Carousel setApi={setApi}>
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={index}>
                <Image
                  src={image || "/media/placeholder.png"}
                  alt={`${title} - Image ${index + 1}`}
                  width={512}
                  height={512}
                  className="h-full w-full object-cover"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute top-1/2 left-2 bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
            <ChevronLeft className="h-4 w-4" />
          </CarouselPrevious>
          <CarouselNext className="absolute top-1/2 right-2 bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
            <ChevronRight className="h-4 w-4" />
          </CarouselNext>
        </Carousel>

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
            <Image
              src={images[currentImage] || "/placeholder.svg"}
              width={512}
              height={512}
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
              onClick={() => onThumbnailClick(index)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                index === currentImage
                  ? "border-accent"
                  : "border-border hover:border-accent/50"
              }`}
            >
              <Image
                src={image || "/placeholder.svg"}
                width={64}
                height={64}
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
