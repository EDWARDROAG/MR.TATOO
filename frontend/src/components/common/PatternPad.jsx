/**
 * ============================================================
 * ARCHIVO: PatternPad.jsx
 * UBICACIÓN: frontend/src/components/common/
 * ROL: component
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Componente UI React — PatternPad.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   PatternPad (default)
 *
 * DEPENDENCIAS CLAVE:
 *   —
 *
 * CONSUMIDORES / RELACIONES:
 *   Importado por: EquipmentReceptionsPage
 *
 * NOTAS:
 *   Frontend · mantener contrato y consumidores al cambiar la API
 *
 * ============================================================
 * HISTORIAL DE CAMBIOS:
 * -----------------------------------------------------------
 * [2.1] - 2026-07-30 18:15
 *    ✅ Cabecera unificada (contrato + trazabilidad Lamakinet/CoreX)
 * [2.0] - 2026-07-30 18:15
 *    ✅ Cabecera unificada (contrato + trazabilidad Lamakinet/CoreX)
 * [1.0] - (previo)
 *    ✅ Implementación existente antes de unificar cabecera
 * ============================================================
 */

import React, { useEffect, useRef, useState } from 'react';

const DOTS = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => ({
  i,
  x: 40 + (i % 3) * 60,
  y: 40 + Math.floor(i / 3) * 60,
}));

const PatternPad = ({ value = [], onChange }) => {
  const [sequence, setSequence] = useState(() => (Array.isArray(value) ? [...value] : []));
  const [previewLine, setPreviewLine] = useState(null);
  const drawingRef = useRef(false);
  const seqRef = useRef(sequence);

  useEffect(() => {
    if (Array.isArray(value)) {
      seqRef.current = [...value];
      setSequence([...value]);
    }
  }, [value]);

  const syncSequence = (next) => {
    seqRef.current = next;
    setSequence(next);
  };

  const svgPoint = (ev) => {
    const svg = ev.currentTarget;
    const rect = svg.getBoundingClientRect();
    return {
      x: ((ev.clientX - rect.left) / rect.width) * 200,
      y: ((ev.clientY - rect.top) / rect.height) * 200,
    };
  };

  const hit = (ev) => {
    const pt = svgPoint(ev);
    const found = DOTS.find((d) => Math.hypot(d.x - pt.x, d.y - pt.y) <= 22);
    if (!found) return;
    if (seqRef.current.includes(found.i)) return;
    syncSequence([...seqRef.current, found.i]);
  };

  const onDown = (ev) => {
    ev.currentTarget.setPointerCapture?.(ev.pointerId);
    drawingRef.current = true;
    syncSequence([]);
    setPreviewLine(null);
    hit(ev);
  };

  const onMove = (ev) => {
    if (!drawingRef.current) return;
    hit(ev);
    const current = seqRef.current;
    if (!current.length) return;
    const last = DOTS[current[current.length - 1]];
    const pt = svgPoint(ev);
    setPreviewLine({ x1: last.x, y1: last.y, x2: pt.x, y2: pt.y });
  };

  const onUp = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    setPreviewLine(null);
    onChange?.([...seqRef.current]);
  };

  const clear = () => {
    drawingRef.current = false;
    syncSequence([]);
    setPreviewLine(null);
    onChange?.([]);
  };

  const segments = [];
  for (let i = 1; i < sequence.length; i += 1) {
    const a = DOTS[sequence[i - 1]];
    const b = DOTS[sequence[i]];
    segments.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
  }

  const sequenceLabel = sequence.length
    ? sequence.map((n) => n + 1).join(' → ')
    : 'Dibuja el patrón (mín. 4 puntos)';

  return (
    <div className="max-w-[220px]">
      <svg
        viewBox="0 0 200 200"
        className="aspect-square w-full cursor-crosshair touch-none rounded-xl border border-violet-300/40 bg-slate-900/80"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        onPointerCancel={onUp}
      >
        {previewLine && (
          <line
            x1={previewLine.x1}
            y1={previewLine.y1}
            x2={previewLine.x2}
            y2={previewLine.y2}
            stroke="#a78bfa"
            strokeWidth="4"
            strokeLinecap="round"
            strokeOpacity="0.5"
          />
        )}
        {segments.map((seg, idx) => (
          <line
            key={`seg-${idx}`}
            x1={seg.x1}
            y1={seg.y1}
            x2={seg.x2}
            y2={seg.y2}
            stroke="#a78bfa"
            strokeWidth="4"
            strokeLinecap="round"
          />
        ))}
        {DOTS.map((d) => {
          const active = sequence.includes(d.i);
          return (
            <circle
              key={d.i}
              cx={d.x}
              cy={d.y}
              r="14"
              fill={active ? '#7c3aed' : '#1f2937'}
              stroke={active ? '#ddd6fe' : '#a78bfa'}
              strokeWidth="2"
            />
          );
        })}
      </svg>
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <small className="text-xs text-gray-500">{sequenceLabel}</small>
        <button type="button" className="corex-btn-outline px-2 py-1 text-xs" onClick={clear}>
          Borrar
        </button>
      </div>
    </div>
  );
};

export default PatternPad;
