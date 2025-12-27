"use client";

import {
  type RefObject,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import * as m from "motion/react-m";
import {
  useMotionValue,
  useTransform,
  animate,
  type MotionValue,
} from "motion/react";
import * as Primitive from "fumadocs-core/toc";
import type { TOCItemType } from "fumadocs-core/toc";
import { useOnChange } from "fumadocs-core/utils/use-on-change";
import { cn } from "@/lib/utils";
import {
  type PathSegment,
  type TocSvgData,
  ANIMATION_DURATION,
  FillActiveContext,
  TOCEmptyState,
  TOCItem,
  calcThumbPosition,
  getCircleX,
  useTocSegments,
} from "./toc-shared";

export type { TocSvgData };

const ANIMATION_CONFIG = {
  duration: ANIMATION_DURATION / 1000,
  ease: [0, 0, 0.58, 1] as [number, number, number, number],
};

interface TocThumbPositionProps {
  containerRef: RefObject<HTMLElement | null>;
  thumbHeight: MotionValue<number>;
  thumbTop: MotionValue<number>;
  circleY: MotionValue<number>;
  circleOpacity: MotionValue<number>;
  toc: TOCItemType[];
  segments: PathSegment[];
  onFillActiveChange?: (anchor: string | null) => void;
}

function TocThumbPosition({
  containerRef,
  thumbHeight,
  thumbTop,
  circleY,
  circleOpacity,
  toc,
  segments,
  onFillActiveChange,
}: TocThumbPositionProps) {
  const active = Primitive.useActiveAnchors();
  const isInitialized = useRef(false);

  function updatePosition(activeAnchors: string[], skipAnimation = false) {
    if (!containerRef.current) return;

    const [top, height, bottomY] = calcThumbPosition(
      containerRef.current,
      activeAnchors,
      toc,
    );

    thumbTop.set(top);

    if (!isInitialized.current || skipAnimation) {
      if (height > 0 && segments.length > 0) {
        thumbHeight.set(height);
        circleY.set(bottomY);
        circleOpacity.set(1);
        isInitialized.current = true;
      }
      return;
    }

    animate(thumbHeight, height, ANIMATION_CONFIG);
    animate(circleY, bottomY, ANIMATION_CONFIG);
  }

  const onResize = useEffectEvent(() => updatePosition(active, true));

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const observer = new ResizeObserver(onResize);
    observer.observe(container);

    return () => observer.disconnect();
  }, [containerRef]);

  useOnChange(active, () => updatePosition(active));

  useEffect(() => {
    if (!containerRef.current) return;

    const [, , , lastActiveIndex] = calcThumbPosition(
      containerRef.current,
      active,
      toc,
    );

    if (lastActiveIndex !== -1) {
      onFillActiveChange?.(toc[lastActiveIndex].url.replace("#", ""));
    }
  }, [active, containerRef, toc, onFillActiveChange]);

  return null;
}

interface TocThumbProps {
  className?: string;
  height: MotionValue<number>;
  top: MotionValue<number>;
}

function TocThumb({ className, height, top }: TocThumbProps) {
  return (
    <m.div
      role="none"
      className={cn("bg-fd-primary", className)}
      style={{ height, y: top }}
    />
  );
}

interface TocThumbCircleProps {
  circleX: MotionValue<number>;
  circleY: MotionValue<number>;
  opacity: MotionValue<number>;
}

function TocThumbCircle({ circleX, circleY, opacity }: TocThumbCircleProps) {
  return (
    <m.div
      role="none"
      aria-hidden="true"
      className="bg-fd-primary pointer-events-none absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{ left: circleX, top: circleY, opacity }}
    />
  );
}

interface FillTOCProps {
  toc: TOCItemType[];
  /** Enable stepped/indented line for depth 3+ headings */
  stepped?: boolean;
  /** Pre-computed SVG data for server-side rendering */
  initialSvg?: TocSvgData | null;
}

export function FillTOC({
  toc,
  stepped = false,
  initialSvg = null,
}: FillTOCProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fillActive, setFillActive] = useState<string | null>(null);

  const svg = useTocSegments(containerRef, toc, stepped, initialSvg);

  const thumbHeight = useMotionValue(0);
  const thumbTop = useMotionValue(0);
  const circleY = useMotionValue(0);
  const circleOpacity = useMotionValue(0);

  const segmentsRef = useRef<PathSegment[]>([]);
  segmentsRef.current = svg?.segments ?? [];

  const circleX = useTransform(circleY, (y) =>
    getCircleX(segmentsRef.current, y),
  );

  if (toc.length === 0) {
    return <TOCEmptyState />;
  }

  return (
    <div
      id="nd-toc"
      className="xl:layout:[--fd-toc-width:268px] sticky top-(--fd-docs-row-3) flex h-[calc(var(--fd-docs-height)-var(--fd-docs-row-3))] w-(--fd-toc-width) flex-col pe-4 pt-12 pb-2 [grid-area:toc] max-xl:hidden"
      data-slot="toc"
    >
      <h3
        id="toc-title"
        className="text-fd-muted-foreground text-xs font-medium tracking-wide uppercase"
      >
        On this page
      </h3>
      <Primitive.AnchorProvider toc={toc} single={false}>
        <FillActiveContext value={fillActive}>
          <TocThumbPosition
            containerRef={containerRef}
            thumbHeight={thumbHeight}
            thumbTop={thumbTop}
            circleY={circleY}
            circleOpacity={circleOpacity}
            toc={toc}
            segments={svg?.segments ?? []}
            onFillActiveChange={setFillActive}
          />
          <Primitive.ScrollProvider containerRef={containerRef}>
            <div className="relative min-h-0 flex-1">
              <nav
                aria-label="Table of contents"
                className="relative h-full min-h-0 overflow-auto mask-[linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent)] py-4 ps-[5px] [scrollbar-width:none]"
              >
                {svg && (
                  <svg
                    className="absolute start-0 top-0 rtl:-scale-x-100"
                    width={svg.width + 3}
                    height={svg.height + 3}
                    aria-hidden="true"
                  >
                    <path
                      d={svg.path}
                      className="stroke-fd-foreground/10"
                      strokeWidth="2"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                )}
                {svg && (
                  <div
                    className="absolute start-0 top-0 rtl:-scale-x-100"
                    style={{
                      width: svg.width,
                      height: svg.height,
                      maskImage: `url("data:image/svg+xml,${encodeURIComponent(
                        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svg.width} ${svg.height}"><path d="${svg.path}" stroke="black" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none" /></svg>`,
                      )}")`,
                    }}
                    aria-hidden="true"
                  >
                    <TocThumb height={thumbHeight} top={thumbTop} />
                  </div>
                )}
                <div ref={containerRef} className="flex flex-col">
                  {toc.map((item) => (
                    <TOCItem key={item.url} item={item} />
                  ))}
                </div>
                {svg && (
                  <div
                    className="bg-fd-foreground/10 pointer-events-none absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{ left: svg.endX, top: svg.endY }}
                    aria-hidden="true"
                  />
                )}
                <TocThumbCircle
                  circleX={circleX}
                  circleY={circleY}
                  opacity={circleOpacity}
                />
              </nav>
            </div>
          </Primitive.ScrollProvider>
        </FillActiveContext>
      </Primitive.AnchorProvider>
    </div>
  );
}
