'use client';

import React, { useEffect, useState } from 'react';

interface Product {
  image: string;
  name: string;
}

interface ProductSliderProps {
  products: Product[];
  onImageClick?: (image: string) => void;
}

const ProductSlider: React.FC<ProductSliderProps> = ({ products, onImageClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const visibleSlides = Math.min(products.length, 5);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % visibleSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + visibleSlides) % visibleSlides);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [products]);

  if (!products || products.length === 0) return null;

  return (
    <section className="w-full py-6">
      <div className="relative w-full mx-auto overflow-hidden rounded-lg shadow-lg">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {products.slice(0, visibleSlides).map((product, index) => (
            <img
              key={index}
              src={`/images/slider-1.png`}
              alt={product.name}
              onClick={() => onImageClick?.(product.image)}
              className="w-full h-100 object-cover flex-shrink-0 cursor-pointer"
            />
          ))}
        </div>

        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white text-black rounded-full p-2 shadow hover:bg-gray-100"
        >
          &#8592;
        </button>
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white text-black rounded-full p-2 shadow hover:bg-gray-100"
        >
          &#8594;
        </button>
      </div>
    </section>
  );
};

export default ProductSlider;
