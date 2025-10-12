import { useState } from "react";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { DriveResource } from "@/lib/googleAppsScript";
import { GOOGLE_SCRIPT_URL } from "@/config/googleScript";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";

export function GallerySection() {
  const [selectedImage, setSelectedImage] = useState<DriveResource | null>(null);

  const { data: images = [], isLoading } = useQuery({
    queryKey: ['gallery-images'],
    queryFn: async () => {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?type=resources`);
      const data = await response.json();
      
      if (data.success && data.resources) {
        return data.resources;
      }
      return [];
    },
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Cache kept for 30 minutes
    refetchOnWindowFocus: false,
  });

  return (
    <section id="gallery" className="py-24 px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Our Gallery</h2>
          <p className="text-lg text-muted-foreground">
            Photos from our journey building solar racing excellence
          </p>
        </div>

        {isLoading && images.length === 0 ? (
          <div className="flex items-center justify-center gap-3 text-muted-foreground py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-lg">Loading gallery...</p>
          </div>
        ) : images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="group relative aspect-square overflow-hidden rounded-lg bg-muted cursor-pointer hover:shadow-solar transition-all duration-300"
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={image.thumbnailLink || image.downloadLink}
                  alt={image.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/50 rounded-lg">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No images available yet. Configure your Google Drive folder in settings.
            </p>
          </div>
        )}

        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl">
            {selectedImage && (
              <div className="space-y-4">
                <img
                  src={selectedImage.downloadLink || selectedImage.thumbnailLink}
                  alt={selectedImage.name}
                  className="w-full h-auto rounded-lg"
                />
                <p className="text-center text-sm text-muted-foreground">
                  {selectedImage.name}
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
