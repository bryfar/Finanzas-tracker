import React from 'react';

type MascotVariant = 'idle' | 'happy' | 'thinking' | 'sad' | 'celebrating';

interface MascotProps {
  variant?: MascotVariant;
  size?: number;
  className?: string;
}

const Mascot: React.FC<MascotProps> = ({ variant = 'idle', size = 100, className = '' }) => {
  // Brand Colors from config: Indigo 500 (#6366f1), Indigo 600 (#4f46e5), Lime 500 (#84cc16)
  const colors = {
    body: '#6366f1',
    bodyDark: '#4f46e5',
    highlight: '#818cf8',
    face: '#ffffff',
    blush: '#f472b6',
    accessory: '#84cc16' // Lime
  };

  const renderContent = () => {
    switch (variant) {
      case 'thinking':
        return (
          <g>
            {/* Body */}
            <path d="M50 20 C25 20 10 45 10 70 C10 85 20 95 30 95 L70 95 C80 95 90 85 90 70 C90 45 75 20 50 20" fill={colors.body} />
            <ellipse cx="65" cy="35" rx="10" ry="5" fill={colors.highlight} opacity="0.3" transform="rotate(-30 65 35)" />
            
            {/* Face Thinking */}
            <circle cx="40" cy="55" r="4" fill={colors.face} />
            <circle cx="65" cy="50" r="4" fill={colors.face} />
            <path d="M55 65 Q60 60 65 65" stroke={colors.face} strokeWidth="2" fill="none" />
            
            {/* Thinking Hand */}
            <circle cx="65" cy="75" r="8" fill={colors.bodyDark} />
            
            {/* Question Mark */}
            <text x="80" y="40" fontSize="24" fill={colors.accessory} fontFamily="sans-serif" fontWeight="bold" transform="rotate(15 80 40)">?</text>
          </g>
        );
      case 'sad':
        return (
          <g>
             {/* Drooping Body */}
             <path d="M50 30 C30 30 15 50 15 75 C15 90 25 95 35 95 L65 95 C75 95 85 90 85 75 C85 50 70 30 50 30" fill="#94a3b8" />
             
             {/* Face Sad */}
             <circle cx="35" cy="60" r="3" fill={colors.face} />
             <circle cx="65" cy="60" r="3" fill={colors.face} />
             <path d="M40 75 Q50 65 60 75" stroke={colors.face} strokeWidth="2" fill="none" />
             
             {/* Tear */}
             <path d="M70 65 Q75 75 70 80 Q65 75 70 65" fill="#bae6fd" />
          </g>
        );
      case 'celebrating':
        return (
          <g>
            {/* Jumping Body */}
            <path d="M50 15 C25 15 10 40 10 65 C10 80 20 90 30 90 L70 90 C80 90 90 80 90 65 C90 40 75 15 50 15" fill={colors.body} />
            <ellipse cx="30" cy="30" rx="8" ry="4" fill={colors.highlight} opacity="0.3" transform="rotate(30 30 30)" />
            
            {/* Face Happy */}
            <path d="M35 55 Q40 50 45 55" stroke={colors.face} strokeWidth="2" fill="none" />
            <path d="M60 55 Q65 50 70 55" stroke={colors.face} strokeWidth="2" fill="none" />
            <path d="M45 65 Q52 75 60 65" fill={colors.face} />
            <circle cx="35" cy="70" r="3" fill={colors.blush} opacity="0.6" />
            <circle cx="70" cy="70" r="3" fill={colors.blush} opacity="0.6" />
            
            {/* Hands Up */}
            <circle cx="15" cy="40" r="8" fill={colors.bodyDark} />
            <circle cx="85" cy="40" r="8" fill={colors.bodyDark} />
            
            {/* Confetti */}
            <rect x="10" y="10" width="4" height="8" fill={colors.accessory} transform="rotate(-20 10 10)" />
            <rect x="80" y="15" width="4" height="8" fill="#f43f5e" transform="rotate(20 80 15)" />
            <circle cx="50" cy="5" r="3" fill="#fbbf24" />
          </g>
        );
      case 'idle':
      default:
        return (
          <g>
            {/* Standard Body */}
            <path d="M50 20 C25 20 10 45 10 70 C10 85 20 95 30 95 L70 95 C80 95 90 85 90 70 C90 45 75 20 50 20" fill={colors.body} />
            <ellipse cx="35" cy="35" rx="10" ry="5" fill={colors.highlight} opacity="0.3" transform="rotate(-30 35 35)" />
            
            {/* Face Normal */}
            <circle cx="35" cy="55" r="4" fill={colors.face} />
            <circle cx="65" cy="55" r="4" fill={colors.face} />
            <path d="M45 68 Q50 72 55 68" stroke={colors.face} strokeWidth="2" fill="none" />
            
            {/* Little Arms */}
            <circle cx="15" cy="65" r="7" fill={colors.bodyDark} />
            <circle cx="85" cy="65" r="7" fill={colors.bodyDark} />
          </g>
        );
    }
  };

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} transition-transform hover:scale-110 duration-300`}>
      {renderContent()}
    </svg>
  );
};

export default Mascot;