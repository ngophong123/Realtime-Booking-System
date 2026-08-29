import React, { useEffect, useState } from 'react';

interface TopLoadingBarProps {
  isLoading: boolean;
}

export const TopLoadingBar: React.FC<TopLoadingBarProps> = ({ isLoading }) => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isLoading) {
      setVisible(true);
      setProgress(25);
      timer = setTimeout(() => {
        setProgress(75);
      }, 200);
    } else {
      setProgress(100);
      timer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 350);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (!visible) return null;

  return (
    <div
      className="top-loading-bar"
      style={{
        width: `${progress}%`,
        opacity: progress === 100 ? 0 : 1,
      }}
    />
  );
};
