// components/common/StarRating.js
import React from 'react';

/**
 * Enhanced StarRating component with half-star support
 * @param {number} value - Current rating value
 * @param {number} max - Maximum rating value (default: 5)
 * @param {function} onChange - Callback when rating changes (omit to make read-only)
 * @param {string} size - Size of stars: "sm", "md", or "lg"
 * @param {boolean} allowHalf - Whether to allow half-star ratings
 */
const StarRating = ({ value = 0, max = 5, onChange = null, size = "md", allowHalf = false }) => {
  const sizeClass = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl"
  }[size] || "text-2xl";

  const handleStarClick = (index, e) => {
    if (!onChange) return; // If no onChange handler, stars are not clickable

    const rect = e.currentTarget.getBoundingClientRect();
    const position = e.clientX - rect.left;
    const halfWidth = rect.width / 2;

    // If allowHalf is true and click is on the left half of the star
    if (allowHalf && position < halfWidth) {
      onChange(index - 0.5);
    } else {
      onChange(index);
    }
  };

  return (
    <div className="flex">
      {[...Array(max)].map((_, index) => {
        const starIndex = index + 1;
        let starClass = 'text-gray-300'; // default empty star

        if (value >= starIndex) {
          starClass = 'text-yellow-500'; // full star
        } else if (allowHalf && value >= starIndex - 0.5) {
          // Improved half-star rendering with cleaner styling
          return (
            <div key={starIndex} className={`${sizeClass} relative ${onChange ? 'cursor-pointer' : ''}`} onClick={(e) => handleStarClick(starIndex, e)}>
              <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                <span className="text-yellow-500">★</span>
              </div>
              <span className="text-gray-300">☆</span>
            </div>
          );
        }

        return (
          <span
            key={starIndex}
            className={`${sizeClass} ${onChange ? 'cursor-pointer' : ''} ${starClass}`}
            onClick={(e) => handleStarClick(starIndex, e)}
          >
            {value >= starIndex ? '★' : '☆'}
          </span>
        );
      })}
    </div>
  );
};

export default StarRating;