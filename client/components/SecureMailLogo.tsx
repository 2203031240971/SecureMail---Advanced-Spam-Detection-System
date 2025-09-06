import React from 'react';

interface SecureMailLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'full' | 'wordmark' | 'symbolic' | 'icon' | 'minimal';
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
}

const sizes = {
  xs: { icon: 'w-6 h-6', text: 'text-sm', container: 'w-8 h-8', spacing: 'gap-1.5' },
  sm: { icon: 'w-8 h-8', text: 'text-base', container: 'w-10 h-10', spacing: 'gap-2' },
  md: { icon: 'w-12 h-12', text: 'text-xl', container: 'w-16 h-16', spacing: 'gap-3' },
  lg: { icon: 'w-16 h-16', text: 'text-2xl', container: 'w-20 h-20', spacing: 'gap-3' },
  xl: { icon: 'w-20 h-20', text: 'text-3xl', container: 'w-24 h-24', spacing: 'gap-4' },
  '2xl': { icon: 'w-24 h-24', text: 'text-4xl', container: 'w-28 h-28', spacing: 'gap-4' }
};

export function SecureMailLogo({ size = 'md', variant = 'full', theme = 'auto', className = '' }: SecureMailLogoProps) {
  const sizeClasses = sizes[size];

  // Symbolic Logo (Icon Only) - Simple Professional Shield with Lock
  const SymbolicLogo = () => (
    <div className={`${sizeClasses.container} relative ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className={`${sizeClasses.icon} drop-shadow-xl`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Professional shield shape with white border */}
        <path
          d="M50 8
             C62 8, 72 12, 78 18
             C80 20, 80 25, 80 35
             C80 55, 75 70, 65 80
             C58 86, 52 90, 50 92
             C48 90, 42 86, 35 80
             C25 70, 20 55, 20 35
             C20 25, 20 20, 22 18
             C28 12, 38 8, 50 8 Z"
          fill="#dc2626"
          stroke="#ffffff"
          strokeWidth="2"
        />

        {/* Lock symbol inside shield - Larger size */}
        <g transform="translate(50, 47)">
          {/* Lock body */}
          <rect
            x="-8"
            y="2"
            width="16"
            height="14"
            rx="2"
            fill="#ffffff"
          />

          {/* Lock shackle */}
          <path
            d="M-6 2 C-6 -3, -3 -6, 0 -6 C3 -6, 6 -3, 6 2"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Keyhole */}
          <circle
            cx="0"
            cy="9"
            r="1.5"
            fill="#dc2626"
          />
        </g>
      </svg>
    </div>
  );

  // Wordmark Logo (Text-based with typography)
  const WordmarkLogo = () => (
    <div className={`flex flex-col ${className}`}>
      <div className="relative">
        <h1 className={`font-black tracking-tight leading-none ${sizeClasses.text}`}>
          <span className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 bg-clip-text text-transparent">
            Secure
          </span>
          <span className="text-foreground">Mail</span>
        </h1>
        
        {/* Underline accent */}
        <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-red-500 to-transparent"></div>
      </div>
      
      {size !== 'xs' && size !== 'sm' && (
        <div className="flex items-center gap-1 mt-1">
          <div className="w-1 h-1 bg-red-500 rounded-full"></div>
          <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
            AI-Powered Protection
          </span>
          <div className="w-1 h-1 bg-red-500 rounded-full"></div>
        </div>
      )}
    </div>
  );

  // Minimal Logo (Simple icon)
  const MinimalLogo = () => (
    <div className={`${sizeClasses.container} relative ${className}`}>
      <svg
        viewBox="0 0 80 80"
        className={`${sizeClasses.icon}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`minimalGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
        </defs>
        
        {/* Simple shield shape */}
        <path
          d="M40 10 
             C50 10, 60 15, 62 22
             C62 28, 62 45, 58 55
             C54 62, 47 66, 40 68
             C33 66, 26 62, 22 55
             C18 45, 18 28, 18 22
             C20 15, 30 10, 40 10 Z"
          fill={`url(#minimalGradient-${size})`}
        />
        
        {/* Simple mail icon */}
        <rect
          x="28"
          y="32"
          width="24"
          height="16"
          rx="2"
          fill="white"
          opacity="0.9"
        />
        <path
          d="M28 32 L40 42 L52 32"
          stroke="#dc2626"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );

  // Full Logo (Icon + Wordmark combination)
  const FullLogo = () => (
    <div className={`flex items-center ${sizeClasses.spacing} ${className}`}>
      <SymbolicLogo />
      <WordmarkLogo />
    </div>
  );

  // Icon variant (alias for symbolic)
  const IconLogo = () => <SymbolicLogo />;

  switch (variant) {
    case 'symbolic':
      return <SymbolicLogo />;
    case 'wordmark':
      return <WordmarkLogo />;
    case 'minimal':
      return <MinimalLogo />;
    case 'icon':
      return <IconLogo />;
    case 'full':
    default:
      return <FullLogo />;
  }
}

// Animated version for loading states
export function AnimatedSecureMailLogo({ 
  size = 'md', 
  variant = 'symbolic',
  className = '' 
}: Pick<SecureMailLogoProps, 'size' | 'variant' | 'className'>) {
  const sizeClasses = sizes[size];

  return (
    <div className={`${sizeClasses.container} relative ${className}`}>
      <svg
        viewBox="0 0 120 120"
        className={`${sizeClasses.icon} drop-shadow-lg`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`animatedGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444">
              <animate attributeName="stop-color" values="#ef4444;#dc2626;#b91c1c;#ef4444" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#dc2626">
              <animate attributeName="stop-color" values="#dc2626;#b91c1c;#ef4444;#dc2626" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#b91c1c">
              <animate attributeName="stop-color" values="#b91c1c;#ef4444;#dc2626;#b91c1c" dur="3s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
          
          <filter id={`glowFilter-${size}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Animated background circle */}
        <circle
          cx="60"
          cy="60"
          r="52"
          fill={`url(#animatedGradient-${size})`}
          filter={`url(#glowFilter-${size})`}
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 60 60;360 60 60"
            dur="12s"
            repeatCount="indefinite"
          />
        </circle>
        
        {/* Pulsing shield */}
        <path
          d="M60 20 
             C75 20, 88 28, 92 40
             C92 48, 92 65, 85 80
             C78 90, 68 95, 60 98
             C52 95, 42 90, 35 80
             C28 65, 28 48, 28 40
             C32 28, 45 20, 60 20 Z"
          fill="#ffffff"
          stroke="#e2e8f0"
          strokeWidth="1"
        >
          <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
        </path>
        
        {/* Animated mail */}
        <g transform="translate(60, 55)">
          <rect
            x="-16"
            y="-10"
            width="32"
            height="20"
            rx="3"
            fill="#dc2626"
          />
          <path
            d="M-16 -10 L0 5 L16 -10 L16 -7 L0 8 L-16 -7 Z"
            fill="#b91c1c"
          >
            <animateTransform
              attributeName="transform"
              type="scale"
              values="1;1.05;1"
              dur="2s"
              repeatCount="indefinite"
            />
          </path>
          
          {/* Animated lock */}
          <g transform="translate(12, -6)">
            <circle
              cx="0"
              cy="0"
              r="4"
              fill="#fbbf24"
            >
              <animate attributeName="r" values="4;4.5;4" dur="2s" repeatCount="indefinite" />
            </circle>
            <rect
              x="-2"
              y="2"
              width="4"
              height="4"
              rx="1"
              fill="#f59e0b"
            />
          </g>
        </g>
        
        {/* Animated security dots */}
        <g opacity="0.7">
          <circle cx="40" cy="40" r="1.5" fill="#ffffff">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="80" cy="40" r="1.5" fill="#ffffff">
            <animate attributeName="opacity" values="1;0.7;1" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="40" cy="80" r="1.5" fill="#ffffff">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="80" cy="80" r="1.5" fill="#ffffff">
            <animate attributeName="opacity" values="1;0.7;1" dur="1.3s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
    </div>
  );
}

// Logo showcase component for displaying all variants
export function LogoShowcase() {
  return (
    <div className="grid gap-8 p-8 bg-background">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">SecureMail Logo Variants</h2>
        
        {/* Full Logo */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Full Logo (Icon + Wordmark)</h3>
          <div className="flex items-center gap-6 p-4 bg-muted/30 rounded-lg">
            <SecureMailLogo size="sm" variant="full" />
            <SecureMailLogo size="md" variant="full" />
            <SecureMailLogo size="lg" variant="full" />
          </div>
        </div>
        
        {/* Symbolic Logo */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Symbolic Logo (Icon Only)</h3>
          <div className="flex items-center gap-6 p-4 bg-muted/30 rounded-lg">
            <SecureMailLogo size="sm" variant="symbolic" />
            <SecureMailLogo size="md" variant="symbolic" />
            <SecureMailLogo size="lg" variant="symbolic" />
            <SecureMailLogo size="xl" variant="symbolic" />
          </div>
        </div>
        
        {/* Wordmark Logo */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Wordmark Logo (Text Only)</h3>
          <div className="flex items-center gap-6 p-4 bg-muted/30 rounded-lg">
            <SecureMailLogo size="sm" variant="wordmark" />
            <SecureMailLogo size="md" variant="wordmark" />
            <SecureMailLogo size="lg" variant="wordmark" />
          </div>
        </div>
        
        {/* Minimal Logo */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Minimal Logo (Simple Icon)</h3>
          <div className="flex items-center gap-6 p-4 bg-muted/30 rounded-lg">
            <SecureMailLogo size="sm" variant="minimal" />
            <SecureMailLogo size="md" variant="minimal" />
            <SecureMailLogo size="lg" variant="minimal" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SecureMailLogo;
