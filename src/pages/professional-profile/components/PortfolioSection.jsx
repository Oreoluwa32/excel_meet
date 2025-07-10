import React, { useState } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PortfolioSection = ({ portfolio }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const openLightbox = (image) => {
    setSelectedImage(image);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  if (!portfolio || portfolio.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-card border-b border-border px-4 lg:px-6 py-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Portfolio</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {portfolio.map((item, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => openLightbox(item)}
            >
              <Image
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <Icon 
                  name="Eye" 
                  size={24} 
                  color="white" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <Button
              variant="ghost"
              size="icon"
              onClick={closeLightbox}
              className="absolute -top-12 right-0 text-white hover:text-white/80"
            >
              <Icon name="X" size={24} />
            </Button>
            
            <div className="bg-card rounded-lg overflow-hidden">
              <Image
                src={selectedImage.image}
                alt={selectedImage.title}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
              {selectedImage.title && (
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    {selectedImage.title}
                  </h3>
                  {selectedImage.description && (
                    <p className="text-muted-foreground mt-1">
                      {selectedImage.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PortfolioSection;