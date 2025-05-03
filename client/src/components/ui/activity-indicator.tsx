import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from '@/lib/utils';

interface PlatformIndependentSize {
  mobile?: number,
  desktop?: number,
}

export default function ActivityIndicator({
  size = 54,
  strokeWidth = '6%',
  strokeHeight = '16%',
  className
}: {
  size?: number | PlatformIndependentSize;
  strokeWidth?: string;
  strokeHeight?: string;
  className?: string;
}) {
  const isMobile = useIsMobile();
  const s = typeof size === "number" ? size : isMobile ? size.mobile || 54 : size.desktop || 54;
  const width = `${s}px`;
  const height = `${s}px`;

  return (
    <div
      className="relative flex justify-center items-center"
      style={{ width, height }}
      aria-label='loading'
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className={cn(`absolute opacity-0 rounded-[50px] animate-activity-indicator bg-foreground`, className)}
          style={{
            boxShadow: '0 0 3px rgba(0, 0, 0, 0.2)',
            width: strokeWidth,
            height: strokeHeight,
            transform: `rotate(${i * 30}deg) translate(0, -130%)`,
            animationDelay: `${-((11 - i) * 0.0833).toFixed(4)}s`,
          }}
        ></div>
      ))}
    </div>
  );
}
