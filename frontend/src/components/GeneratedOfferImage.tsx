import React from 'react';

interface GeneratedOfferImageProps {
  title: string;
  discount: number;
  width?: number;
  height?: number;
  variant?: number;
}

// Define 8 different theme configurations
const themes = [
  // Variant 0: Modern Gradient with Bold Text
  {
    name: 'Modern Gradient',
    gradients: [['#ff9966', '#ff5e62']],
    textStyle: 'bold',
    layout: 'centered',
    animation: 'none',
    tagline: 'Limited Time Offer',
    discountStyle: 'pill'
  },
  // Variant 1: Geometric Pattern with Diagonal Layout
  {
    name: 'Geometric Pattern',
    gradients: [['#36d1c4', '#1e90ff']],
    textStyle: 'geometric',
    layout: 'diagonal',
    animation: 'geometric',
    tagline: 'Special Deal',
    discountStyle: 'geometric'
  },
  // Variant 2: Retro Style with Vintage Colors
  {
    name: 'Retro Style',
    gradients: [['#f7971e', '#ffd200']],
    textStyle: 'retro',
    layout: 'stacked',
    animation: 'retro',
    tagline: 'Flash Sale',
    discountStyle: 'retro'
  },
  // Variant 3: Elegant Dark with Gold Accent
  {
    name: 'Elegant Dark',
    gradients: [['#2c3e50', '#34495e']],
    textStyle: 'elegant',
    layout: 'elegant',
    animation: 'elegant',
    tagline: 'Premium Offer',
    discountStyle: 'elegant'
  },
  // Variant 4: Neon Glow with Cyberpunk Style
  {
    name: 'Neon Glow',
    gradients: [['#f953c6', '#b91d73']],
    textStyle: 'neon',
    layout: 'neon',
    animation: 'neon',
    tagline: 'Hot Deal',
    discountStyle: 'neon'
  },
  // Variant 5: Minimalist Clean Design
  {
    name: 'Minimalist',
    gradients: [['#43cea2', '#185a9d']],
    textStyle: 'minimal',
    layout: 'minimal',
    animation: 'minimal',
    tagline: 'Clean Deal',
    discountStyle: 'minimal'
  },
  // Variant 6: Bold Typography with High Contrast
  {
    name: 'Bold Typography',
    gradients: [['#ff5858', '#f09819']],
    textStyle: 'bold-typography',
    layout: 'typography',
    animation: 'typography',
    tagline: 'Bold Savings',
    discountStyle: 'bold'
  },
  // Variant 7: Artistic Abstract with Creative Layout
  {
    name: 'Artistic Abstract',
    gradients: [['#00c3ff', '#ffff1c']],
    textStyle: 'artistic',
    layout: 'abstract',
    animation: 'artistic',
    tagline: 'Creative Deal',
    discountStyle: 'artistic'
  }
];

export const OFFER_IMAGE_VARIANTS = themes.length;

// Responsive font size based on title length
const getResponsiveFontSize = (title: string, height: number, style: string) => {
  const baseSize = Math.floor(height / 7);
  switch (style) {
    case 'bold-typography':
      return Math.floor(baseSize * 1.2);
    case 'minimal':
      return Math.floor(baseSize * 0.9);
    case 'retro':
      return Math.floor(baseSize * 1.1);
    default:
      return baseSize;
  }
};

// Truncate title with ellipsis if too long
const truncateTitle = (title: string, maxLen: number) => {
  return title.length > maxLen ? title.slice(0, maxLen - 1) + '…' : title;
};

const GeneratedOfferImage: React.FC<GeneratedOfferImageProps> = ({
  title,
  discount,
  width = 320,
  height = 180,
  variant = 0,
}) => {
  const safeDiscount = typeof discount === 'number' && !isNaN(discount) ? discount : 10;
  const theme = themes[variant % themes.length];
  const fontSize = getResponsiveFontSize(title, height, theme.textStyle);
  const maxTitleLen = Math.floor(width / (fontSize * 0.6));
  const displayTitle = truncateTitle(title, maxTitleLen);

  const renderVariant = () => {
    switch (variant % 8) {
      case 0: // Modern Gradient
        return (
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gradient0" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={theme.gradients[0][0]} />
                <stop offset="100%" stopColor={theme.gradients[0][1]} />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width={width} height={height} rx="16" fill="url(#gradient0)" />
            <text x="50%" y="40%" textAnchor="middle" fontSize={fontSize} fontWeight="bold" fill="#fff" 
                  style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }} dominantBaseline="middle">
              {displayTitle}
            </text>
            <rect x={width/2-60} y={height*0.6-30} width="120" height="60" rx="30" fill="#fff" opacity="0.2" />
            <text x="50%" y={height*0.6+15} textAnchor="middle" fontSize={Math.floor(height/3.5)} fontWeight="bold" 
                  fill="#fff" style={{ letterSpacing: 2 }}>
              -{safeDiscount}%
            </text>
            <text x="50%" y={height-20} textAnchor="middle" fontSize="14" fill="#fff" opacity="0.8">
              {theme.tagline}
            </text>
          </svg>
        );

      case 1: // Geometric Pattern
        return (
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gradient1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={theme.gradients[0][0]} />
                <stop offset="100%" stopColor={theme.gradients[0][1]} />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width={width} height={height} fill="url(#gradient1)" />
            {/* Geometric shapes */}
            <polygon points={`${width*0.8},0 ${width},0 ${width},${height*0.2}`} fill="#fff" opacity="0.1" />
            <circle cx={width*0.2} cy={height*0.8} r="40" fill="#fff" opacity="0.1" />
            <text x="30%" y="45%" textAnchor="middle" fontSize={fontSize*0.9} fontWeight="bold" fill="#fff" 
                  transform={`rotate(-15, ${width*0.3}, ${height*0.45})`}>
              {displayTitle}
            </text>
            <rect x={width*0.6} y={height*0.6} width="80" height="40" fill="#fff" opacity="0.9" />
            <text x={width*0.7} y={height*0.65} textAnchor="middle" fontSize="16" fontWeight="bold" fill="#333">
              -{safeDiscount}%
            </text>
            <text x="70%" y={height-15} textAnchor="middle" fontSize="12" fill="#fff" opacity="0.9">
              {theme.tagline}
            </text>
          </svg>
        );

      case 2: // Retro Style
        return (
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gradient2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={theme.gradients[0][0]} />
                <stop offset="100%" stopColor={theme.gradients[0][1]} />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width={width} height={height} fill="url(#gradient2)" />
            {/* Retro stripes */}
            <rect x="0" y="0" width={width} height="10" fill="#fff" opacity="0.3" />
            <rect x="0" y={height-10} width={width} height="10" fill="#fff" opacity="0.3" />
            <text x="50%" y="35%" textAnchor="middle" fontSize={fontSize} fontWeight="bold" fill="#fff" 
                  style={{ fontFamily: 'serif', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              {displayTitle}
            </text>
            <circle cx={width/2} cy={height*0.7} r="35" fill="#fff" opacity="0.9" />
            <text x="50%" y={height*0.75} textAnchor="middle" fontSize="20" fontWeight="bold" fill="#333">
              -{safeDiscount}%
            </text>
            <text x="50%" y={height-15} textAnchor="middle" fontSize="14" fill="#fff" opacity="0.9" 
                  style={{ fontFamily: 'serif' }}>
              {theme.tagline}
            </text>
          </svg>
        );

      case 3: // Elegant Dark
        return (
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gradient3" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={theme.gradients[0][0]} />
                <stop offset="100%" stopColor={theme.gradients[0][1]} />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width={width} height={height} fill="url(#gradient3)" />
            {/* Elegant border */}
            <rect x="10" y="10" width={width-20} height={height-20} fill="none" stroke="#fff" strokeWidth="2" opacity="0.3" />
            <text x="50%" y="40%" textAnchor="middle" fontSize={fontSize} fontWeight="300" fill="#fff" 
                  style={{ letterSpacing: 1 }}>
              {displayTitle}
            </text>
            <rect x={width/2-50} y={height*0.65-20} width="100" height="40" fill="none" stroke="#fff" strokeWidth="2" />
            <text x="50%" y={height*0.65+5} textAnchor="middle" fontSize="18" fontWeight="300" fill="#fff">
              -{safeDiscount}%
            </text>
            <text x="50%" y={height-20} textAnchor="middle" fontSize="12" fill="#fff" opacity="0.7">
              {theme.tagline}
            </text>
          </svg>
        );

      case 4: // Neon Glow
        return (
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gradient4" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={theme.gradients[0][0]} />
                <stop offset="100%" stopColor={theme.gradients[0][1]} />
              </linearGradient>
              <filter id="neon">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <rect x="0" y="0" width={width} height={height} fill="url(#gradient4)" />
            <text x="50%" y="40%" textAnchor="middle" fontSize={fontSize} fontWeight="bold" fill="#fff" 
                  filter="url(#neon)" style={{ textShadow: '0 0 10px #fff' }}>
              {displayTitle}
            </text>
            <rect x={width/2-60} y={height*0.6-30} width="120" height="60" rx="30" fill="#fff" opacity="0.9" 
                  filter="url(#neon)" />
            <text x="50%" y={height*0.6+15} textAnchor="middle" fontSize="20" fontWeight="bold" fill="#333">
              -{safeDiscount}%
            </text>
            <text x="50%" y={height-15} textAnchor="middle" fontSize="14" fill="#fff" opacity="0.9">
              {theme.tagline}
            </text>
          </svg>
        );

      case 5: // Minimalist
        return (
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gradient5" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={theme.gradients[0][0]} />
                <stop offset="100%" stopColor={theme.gradients[0][1]} />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width={width} height={height} fill="url(#gradient5)" />
            <text x="50%" y="45%" textAnchor="middle" fontSize={fontSize} fontWeight="300" fill="#fff" 
                  style={{ letterSpacing: 2 }}>
              {displayTitle}
            </text>
            <line x1={width*0.2} y1={height*0.7} x2={width*0.8} y2={height*0.7} stroke="#fff" strokeWidth="2" opacity="0.8" />
            <text x="50%" y={height*0.8} textAnchor="middle" fontSize="24" fontWeight="300" fill="#fff">
              -{safeDiscount}%
            </text>
            <text x="50%" y={height-20} textAnchor="middle" fontSize="12" fill="#fff" opacity="0.6">
              {theme.tagline}
            </text>
          </svg>
        );

      case 6: // Bold Typography
        return (
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gradient6" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={theme.gradients[0][0]} />
                <stop offset="100%" stopColor={theme.gradients[0][1]} />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width={width} height={height} fill="url(#gradient6)" />
            <text x="50%" y="35%" textAnchor="middle" fontSize={fontSize*1.2} fontWeight="900" fill="#fff" 
                  style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.5)' }}>
              {displayTitle}
            </text>
            <rect x={width*0.1} y={height*0.6} width={width*0.8} height="50" fill="#fff" opacity="0.95" />
            <text x="50%" y={height*0.65} textAnchor="middle" fontSize="28" fontWeight="900" fill="#333">
              -{safeDiscount}%
            </text>
            <text x="50%" y={height-15} textAnchor="middle" fontSize="16" fill="#fff" opacity="0.9" fontWeight="bold">
              {theme.tagline}
            </text>
          </svg>
        );

      case 7: // Artistic Abstract
        return (
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gradient7" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={theme.gradients[0][0]} />
                <stop offset="100%" stopColor={theme.gradients[0][1]} />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width={width} height={height} fill="url(#gradient7)" />
            {/* Abstract shapes */}
            <ellipse cx={width*0.3} cy={height*0.3} rx="30" ry="20" fill="#fff" opacity="0.2" />
            <polygon points={`${width*0.7},${height*0.2} ${width*0.8},${height*0.4} ${width*0.6},${height*0.4}`} fill="#fff" opacity="0.2" />
            <text x="50%" y="40%" textAnchor="middle" fontSize={fontSize} fontWeight="bold" fill="#fff" 
                  transform={`rotate(5, ${width/2}, ${height*0.4})`}>
              {displayTitle}
            </text>
            <circle cx={width/2} cy={height*0.7} r="40" fill="#fff" opacity="0.9" />
            <text x="50%" y={height*0.75} textAnchor="middle" fontSize="22" fontWeight="bold" fill="#333">
              -{safeDiscount}%
            </text>
            <text x="50%" y={height-15} textAnchor="middle" fontSize="14" fill="#fff" opacity="0.8">
              {theme.tagline}
            </text>
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
      {renderVariant()}
    </div>
  );
};

export default GeneratedOfferImage; 