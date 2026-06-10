import React, { useState, useEffect } from 'react';
import { Landmark, Sparkles } from 'lucide-react';

export default function CulturalImage({ src, alt, className, icon: Icon = Landmark }) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Reset state when src changes
  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  if (hasError || !src) {
    return (
      <div className={`relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#0d0d0c] to-[#1a1612] border border-[#E6C697]/10 ${className}`}>
        {/* Subtle decorative background */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#E6C697]/20 via-transparent to-transparent"></div>
        <div className="absolute top-2 right-2 opacity-20">
          <Sparkles className="w-16 h-16 text-[#E6C697]" />
        </div>
        <div className="absolute bottom-2 left-2 opacity-10">
          <Icon className="w-24 h-24 text-[#E6C697]" />
        </div>
        
        {/* Central Card Content */}
        <div className="relative z-10 flex flex-col items-center p-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#E6C697]/20 bg-[#E6C697]/10 mb-4 shadow-[0_0_30px_rgba(230,198,151,0.1)]">
            <Icon className="h-6 w-6 text-[#E6C697]" />
          </div>
          
          <h4 className="font-heading text-lg text-[#E6C697] mb-1">
            StoryVault Archive
          </h4>
          <p className="text-[10px] font-medium tracking-[0.2em] text-[#E6C697]/50 uppercase max-w-[200px] line-clamp-2">
            {alt || "Cultural Illustration"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#0d0d0c] ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#15120f]">
           <div className="h-6 w-6 animate-pulse rounded-full bg-[#E6C697]/20"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-700 ${isLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
        loading="lazy"
      />
    </div>
  );
}
