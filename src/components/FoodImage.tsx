import React, { useState } from 'react';
import { Utensils } from 'lucide-react';
import { FOOD_IMAGE_MAP } from '../data/mealsDataset';
import { FoodImageKey } from '../types/nutrition';

interface FoodImageProps {
  imageKey: FoodImageKey;
  alt: string;
  className?: string;
}

export const FoodImage: React.FC<FoodImageProps> = ({
  imageKey,
  alt,
  className = 'w-full h-44',
}) => {
  const [failed, setFailed] = useState(false);
  const src = FOOD_IMAGE_MAP[imageKey];

  if (!src || failed) {
    return (
      <div
        className={`${className} bg-gradient-to-br from-[#E6F4EC] via-[#F2F6EF] to-[#E5ECE2] flex flex-col items-center justify-center gap-2 text-[#1B6B40] p-4`}
        role="img"
        aria-label={alt}
      >
        <Utensils className="w-7 h-7 opacity-75" />
        <span className="text-xs font-medium text-center text-[#14532D] line-clamp-2">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${className} object-cover bg-[#EEF3EC]`}
    />
  );
};
