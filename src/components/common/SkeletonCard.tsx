import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div
      className="cine-card"
      style={{
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        borderRadius: 'var(--radius-card)',
      }}
    >
      {/* Skeleton Poster with Shimmer */}
      <div
        className="skeleton-shimmer"
        style={{
          width: '100%',
          aspectRatio: '2 / 3',
          borderRadius: '8px',
        }}
      />
      {/* Title Shimmer Line 1 */}
      <div
        className="skeleton-shimmer"
        style={{
          width: '85%',
          height: '18px',
          borderRadius: '4px',
        }}
      />
      {/* Meta Shimmer Line 2 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          className="skeleton-shimmer"
          style={{
            width: '45%',
            height: '14px',
            borderRadius: '4px',
          }}
        />
        <div
          className="skeleton-shimmer"
          style={{
            width: '30%',
            height: '14px',
            borderRadius: '4px',
          }}
        />
      </div>
    </div>
  );
};
