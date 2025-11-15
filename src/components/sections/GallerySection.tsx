import { Loader2, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { GOOGLE_SCRIPT_URL } from "@/config/googleScript";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function GallerySection() {
  const [currentPage, setCurrentPage] = useState(0);
  const imagesPerPage = 6;
  
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
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const totalPages = Math.ceil(images.length / imagesPerPage);
  const startIndex = currentPage * imagesPerPage;
  const endIndex = startIndex + imagesPerPage;
  const currentImages = images.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

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
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentImages.map((image) => (
                <div
                  key={image.id}
                  className="group relative aspect-square overflow-hidden rounded-lg bg-muted hover:shadow-solar transition-all duration-300"
                >
                  <img
                    src={image.thumbnailLink || image.downloadLink}
                    alt={image.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector('.image-error')) {
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'image-error absolute inset-0 flex flex-col items-center justify-center gap-2 text-center p-4';
                        errorDiv.innerHTML = `
                          <svg class="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span class="text-xs text-muted-foreground">${image.name}</span>
                        `;
                        parent.appendChild(errorDiv);
                      }
                    }}
                  />
                </div>
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPrevPage}
                  disabled={currentPage === 0}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <span className="text-sm text-muted-foreground">
                  Page {currentPage + 1} of {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages - 1}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-muted/50 rounded-lg">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No images available yet. Configure your Google Drive folder in settings.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
