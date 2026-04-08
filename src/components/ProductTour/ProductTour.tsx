'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

const TOUR_KEY = 'nitro-product-tour-completed';

interface TourStep {
  target: string;       // CSS selector
  placement: 'right' | 'bottom' | 'left' | 'top';
  title: string;
  text: string;
}

interface TooltipPos {
  top: number;
  left: number;
  arrowSide: 'left' | 'right' | 'top' | 'bottom';
  arrowOffset: number;
}

function getPos(el: Element, placement: TourStep['placement']): TooltipPos {
  const r = el.getBoundingClientRect();
  const TW = 300; // tooltip width
  const TH = 140; // tooltip height approx
  const GAP = 12;
  const ARROW = 10;

  switch (placement) {
    case 'right':
      return {
        top: r.top + r.height / 2 - TH / 2,
        left: r.right + GAP,
        arrowSide: 'left',
        arrowOffset: TH / 2 - ARROW,
      };
    case 'left':
      return {
        top: r.top + r.height / 2 - TH / 2,
        left: r.left - TW - GAP,
        arrowSide: 'right',
        arrowOffset: TH / 2 - ARROW,
      };
    case 'bottom':
      return {
        top: r.bottom + GAP,
        left: r.left + r.width / 2 - TW / 2,
        arrowSide: 'top',
        arrowOffset: TW / 2 - ARROW,
      };
    case 'top':
      return {
        top: r.top - TH - GAP,
        left: r.left + r.width / 2 - TW / 2,
        arrowSide: 'bottom',
        arrowOffset: TW / 2 - ARROW,
      };
  }
}

const ARROW_STYLES: Record<string, React.CSSProperties> = {
  left:   { top: 0, left: -10, borderWidth: '10px 10px 10px 0', borderColor: 'transparent rgb(var(--color-primary-600)) transparent transparent', position: 'absolute' },
  right:  { top: 0, right: -10, borderWidth: '10px 0 10px 10px', borderColor: 'transparent transparent transparent rgb(var(--color-primary-600))', position: 'absolute' },
  top:    { left: 0, top: -10, borderWidth: '0 10px 10px 10px', borderColor: 'transparent transparent rgb(var(--color-primary-600)) transparent', position: 'absolute' },
  bottom: { left: 0, bottom: -10, borderWidth: '10px 10px 0 10px', borderColor: 'rgb(var(--color-primary-600)) transparent transparent transparent', position: 'absolute' },
};

interface Props {
  steps: TourStep[];
  locale?: string;
  onDone: () => void;
}

export function ProductTour({ steps, locale = 'es', onDone }: Props) {
  const [idx, setIdx] = useState(0);
  const [pos, setPos] = useState<TooltipPos | null>(null);
  const [mounted, setMounted] = useState(false);

  const T = {
    es: { next: 'Siguiente', back: 'Atrás', done: '¡Entendido!', skip: 'Saltar tour', of: 'de' },
    en: { next: 'Next', back: 'Back', done: 'Got it!', skip: 'Skip tour', of: 'of' },
    zh: { next: '下一步', back: '返回', done: '明白了！', skip: '跳过', of: '/' },
  };
  const c = T[locale as keyof typeof T] || T.es;

  const step = steps[idx];

  const reposition = useCallback(() => {
    if (!step) return;
    const el = document.querySelector(step.target);
    if (!el) {
      // Elemento no encontrado — centrar en pantalla sin flecha
      setPos({
        top: window.innerHeight / 2 - 100,
        left: window.innerWidth / 2 - 150,
        arrowSide: 'top',
        arrowOffset: -999, // ocultar flecha
      });
      return;
    }
    setPos(getPos(el, step.placement));
  }, [step]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    reposition();
    window.addEventListener('resize', reposition);
    return () => window.removeEventListener('resize', reposition);
  }, [reposition]);

  const finish = useCallback(() => {
    localStorage.setItem(TOUR_KEY, 'true');
    onDone();
  }, [onDone]);

  const next = () => {
    if (idx < steps.length - 1) setIdx(idx + 1);
    else finish();
  };

  const back = () => { if (idx > 0) setIdx(idx - 1); };

  if (!mounted || !step || !pos) return null;

  const arrowStyle: React.CSSProperties = {
    ...ARROW_STYLES[pos.arrowSide],
    borderStyle: 'solid',
    width: 0,
    height: 0,
    ...(pos.arrowSide === 'left' || pos.arrowSide === 'right'
      ? { top: pos.arrowOffset }
      : { left: pos.arrowOffset }),
  };

  const tooltip = (
    <>
      {/* Backdrop semitransparente suave */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 9990, pointerEvents: 'none', background: 'rgba(0,0,0,0.08)' }}
      />
      {/* Tooltip */}
      <div
        style={{
          position: 'fixed',
          top: Math.max(8, pos.top),
          left: Math.max(8, pos.left),
          width: 300,
          zIndex: 9999,
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          overflow: 'visible',
          fontFamily: 'inherit',
        }}
      >
        {/* Flecha */}
        {pos.arrowOffset !== -999 && (
          <div style={{ position: 'absolute', ...arrowStyle }} />
        )}

        {/* Header */}
        <div style={{
          background: `rgb(var(--color-primary-600))`,
          borderRadius: '12px 12px 0 0',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>{step.title}</span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
            {idx + 1} {c.of} {steps.length}
          </span>
        </div>

        {/* Body */}
        <div style={{ background: 'white', padding: '14px 16px', fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
          {step.text}
        </div>

        {/* Footer */}
        <div style={{
          background: 'white',
          borderTop: '1px solid #f3f4f6',
          borderRadius: '0 0 12px 12px',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <button
            onClick={finish}
            style={{ marginRight: 'auto', background: 'none', border: 'none', color: '#9ca3af', fontSize: 12, cursor: 'pointer', padding: '4px 0' }}
          >
            {c.skip}
          </button>
          {idx > 0 && (
            <button
              onClick={back}
              style={{ background: 'white', border: '1px solid #d1d5db', color: '#374151', borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}
            >
              {c.back}
            </button>
          )}
          <button
            onClick={next}
            style={{ background: `rgb(var(--color-primary-600))`, border: 'none', color: 'white', borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}
          >
            {idx < steps.length - 1 ? c.next : c.done}
          </button>
        </div>
      </div>
    </>
  );

  return createPortal(tooltip, document.body);
}
