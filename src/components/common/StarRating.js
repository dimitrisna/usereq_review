import React from 'react';

// Fixed, editable Star Rating Component
const StarRating = ({ value, max = 5, onChange = null }) => {
  const handleStarClick = (rating) => {
    if (onChange) {
      onChange(rating);
    }
  };

  const stars = [];
  for (let i = 1; i <= max; i++) {
    stars.push(
      <span 
        key={i} 
        className={`text-2xl cursor-pointer ${onChange ? 'hover:text-yellow-400' : ''} ${i <= value ? 'text-yellow-500' : 'text-gray-300'}`}
        onClick={() => onChange && handleStarClick(i)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onChange && handleStarClick(i);
          }
        }}
        role={onChange ? "button" : "presentation"}
        tabIndex={onChange ? 0 : -1}
      >
        ★
      </span>
    );
  }
  
  return (
    <div className="flex" aria-label={`Rating: ${value} out of ${max} stars`}>
      {stars}
      {onChange && (
        <button 
          className="ml-2 text-sm text-gray-500 hover:text-gray-700"
          onClick={() => onChange(0)}
          aria-label="Clear rating"
        >
          Clear
        </button>
      )}
    </div>
  );
};

export default StarRating;