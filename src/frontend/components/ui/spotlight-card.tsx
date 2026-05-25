import React, { useEffect, useRef, ReactNode } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'yellow';
  customSize?: boolean;
  style?: React.CSSProperties;
}

// Tuned hue values so the glow is vivid on a near-black backdrop
const glowColorMap: Record<string, { base: number; spread: number; saturation: number; lightness: number }> = {
  purple: { base: 265, spread: 60,  saturation: 95, lightness: 65 },
  blue:   { base: 215, spread: 60,  saturation: 90, lightness: 65 },
  green:  { base: 140, spread: 60,  saturation: 90, lightness: 60 },
  red:    { base: 0,   spread: 30,  saturation: 95, lightness: 65 },
  orange: { base: 25,  spread: 40,  saturation: 95, lightness: 65 },
  yellow: { base: 48,  spread: 30,  saturation: 95, lightness: 65 },
};

const GlowCard = React.forwardRef<
  HTMLDivElement,
  GlowCardProps & React.HTMLAttributes<HTMLDivElement>
>(({ children, className = '', glowColor = 'purple', customSize: _customSize = false, style, ...props }, ref) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  // Merge forwarded ref
  useEffect(() => {
    if (!ref) return;
    if (typeof ref === 'function') ref(cardRef.current);
    else (ref as React.MutableRefObject<HTMLDivElement | null>).current = cardRef.current;
  }, [ref]);

  // Track pointer position relative to the card's bounding rectangle
  useEffect(() => {
    const sync = (e: PointerEvent) => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        cardRef.current.style.setProperty('--x', x.toFixed(1));
        cardRef.current.style.setProperty('--xp', (x / rect.width).toFixed(3));
        cardRef.current.style.setProperty('--y', y.toFixed(1));
        cardRef.current.style.setProperty('--yp', (y / rect.height).toFixed(3));
      }
    };
    document.addEventListener('pointermove', sync);
    return () => document.removeEventListener('pointermove', sync);
  }, []);

  const { base, spread, saturation, lightness } = glowColorMap[glowColor] ?? glowColorMap.purple;

  const inlineVars: React.CSSProperties & Record<string, string | number> = {
    '--base': base,
    '--spread': spread,
    '--saturation': saturation,
    '--lightness': lightness,
    '--radius': '20',          // matches rounded-2xl (20px)
    '--border': '1.5',          // border thickness in px
    '--size': '380',            // spotlight diameter in px
    '--outer': '1',
    '--bg-spot-opacity': '0.06',       // subtle inner glow
    '--border-spot-opacity': '0.9',    // vivid border spotlight
    '--border-light-opacity': '0.15',  // soft white highlight
    '--border-size': 'calc(var(--border, 2) * 1px)',
    '--spotlight-size': 'calc(var(--size, 200) * 1px)',
    '--hue': 'calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))',
    backgroundImage: `radial-gradient(
      var(--spotlight-size) var(--spotlight-size) at
      calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
      hsl(var(--hue) calc(var(--saturation)*1%) calc(var(--lightness)*1%) / var(--bg-spot-opacity, 0.06)),
      transparent
    )`,
    backgroundColor: 'rgba(7, 5, 16, 0.92)',
    border: 'var(--border-size) solid rgba(255,255,255,0.08)',
    backdropFilter: 'blur(40px) saturate(160%)',
    WebkitBackdropFilter: 'blur(40px) saturate(160%)',
    position: 'relative',
    touchAction: 'none',
    ...style,
  };

  // Injected CSS for the ::before / ::after spotlight border glow
  const css = `
    [data-glow]::before,
    [data-glow]::after {
      pointer-events: none;
      content: "";
      position: absolute;
      inset: calc(var(--border-size) * -1);
      border: var(--border-size) solid transparent;
      border-radius: calc(var(--radius) * 1px);
      background-repeat: no-repeat;
      mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
      mask-clip: padding-box, border-box;
      mask-composite: intersect;
      -webkit-mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
      -webkit-mask-clip: padding-box, border-box;
      -webkit-mask-composite: source-in, xor;
    }
    [data-glow]::before {
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75) at
        calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
        hsl(var(--hue) calc(var(--saturation)*1%) calc(var(--lightness)*1%) / var(--border-spot-opacity, 0.9)),
        transparent 100%
      );
      filter: brightness(2.2);
    }
    [data-glow]::after {
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 0.45) calc(var(--spotlight-size) * 0.45) at
        calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
        hsl(0 100% 100% / var(--border-light-opacity, 0.15)),
        transparent 100%
      );
    }
    [data-glow] [data-glow] {
      position: absolute;
      inset: 0;
      will-change: filter;
      opacity: var(--outer, 1);
      border-radius: calc(var(--radius) * 1px);
      filter: blur(calc(var(--border-size) * 8));
      background: none;
      pointer-events: none;
      border: none;
    }
    [data-glow] > [data-glow]::before {
      inset: -8px;
      border-width: 8px;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div
        ref={cardRef}
        data-glow
        style={inlineVars}
        className={`rounded-2xl relative shadow-[0_24px_60px_rgba(0,0,0,0.7)] ${className}`}
        {...props}
      >
        {/* Inner glow node required by the CSS selector */}
        <div ref={innerRef} data-glow />
        {children}
      </div>
    </>
  );
});

GlowCard.displayName = 'GlowCard';
export { GlowCard };
