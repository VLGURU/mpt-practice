import React from 'react';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';

const RatingStars = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="d-flex align-items-center">
      {[...Array(fullStars)].map((_, i) => (
        <FaStar key={`full-${i}`} className="text-warning" style={{ fontSize: '1.2rem' }} />
      ))}

      {hasHalfStar && <FaStarHalfAlt className="text-warning" style={{ fontSize: '1.2rem' }} />}

      {[...Array(emptyStars)].map((_, i) => (
        <FaStar key={`empty-${i}`} className="text-secondary" style={{ fontSize: '1.2rem', opacity: 0.3 }} />
      ))}

      <span className="ms-2 fw-bold" style={{ fontSize: '1.1rem' }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

export default RatingStars;
