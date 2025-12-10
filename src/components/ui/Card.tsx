import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-[2rem] shadow-soft border border-slate-100 hover:shadow-lg transition-shadow duration-300 ${className}`}
    >
      {children}
    </div>
  );
};