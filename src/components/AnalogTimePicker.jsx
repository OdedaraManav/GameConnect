import React, { useState, useEffect } from 'react';
import { Clock, Sun, Moon, ArrowRight } from 'lucide-react';

// Helper to parse time string ("20:30", "8:30 PM", etc.) into { hour, minute, period }
export function parseTimeString(str, defaultH = 8, defaultM = 0, defaultP = 'PM') {
  if (!str || typeof str !== 'string') {
    return { hour: defaultH, minute: defaultM, period: defaultP };
  }

  const clean = str.trim();

  // Match 12-hour format e.g. "8:30 PM" or "08:30 AM"
  const match12 = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let h = parseInt(match12[1], 10);
    const m = parseInt(match12[2], 10);
    const p = match12[3].toUpperCase();
    if (h < 1) h = 12;
    if (h > 12) h = 12;
    return { hour: h, minute: m % 60, period: p };
  }

  // Match 24-hour format e.g. "20:30" or "08:00"
  const match24 = clean.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    let h24 = parseInt(match24[1], 10);
    const m = parseInt(match24[2], 10);
    let p = 'AM';
    if (h24 >= 12) {
      p = 'PM';
      if (h24 > 12) h24 -= 12;
    }
    if (h24 === 0) h24 = 12;
    return { hour: h24, minute: m % 60, period: p };
  }

  return { hour: defaultH, minute: defaultM, period: defaultP };
}

// Helper to format { hour, minute, period } into 12-hour string "8:30 PM"
export function format12h({ hour, minute, period }) {
  const mStr = String(minute).padStart(2, '0');
  return `${hour}:${mStr} ${period}`;
}

// Helper to format { hour, minute, period } into 24-hour string "20:30"
export function format24h({ hour, minute, period }) {
  let h24 = hour;
  if (period === 'PM' && hour < 12) h24 += 12;
  if (period === 'AM' && hour === 12) h24 = 0;
  const hStr = String(h24).padStart(2, '0');
  const mStr = String(minute).padStart(2, '0');
  return `${hStr}:${mStr}`;
}

export default function AnalogTimePicker({ initialStart = '20:00', initialEnd = '00:00', onChange }) {
  const [activeTab, setActiveTab] = useState('start'); // 'start' | 'end'
  const [mode, setMode] = useState('hour'); // 'hour' | 'minute'

  const [fromTime, setFromTime] = useState(() => parseTimeString(initialStart, 8, 0, 'PM'));
  const [toTime, setToTime] = useState(() => parseTimeString(initialEnd, 12, 0, 'AM'));

  const activeTime = activeTab === 'start' ? fromTime : toTime;
  const setActiveTime = activeTab === 'start' ? setFromTime : setToTime;

  // Emit formatted state to parent component whenever times change
  useEffect(() => {
    const start12 = format12h(fromTime);
    const end12 = format12h(toTime);
    const start24 = format24h(fromTime);
    const end24 = format24h(toTime);
    const displayString = `${start12} – ${end12}`;

    if (onChange) {
      onChange({
        availabilityStart: start24,
        availabilityEnd: end24,
        availability: displayString,
        start12,
        end12
      });
    }
  }, [fromTime, toTime, onChange]);

  const handleSelectHour = (h) => {
    setActiveTime((prev) => ({ ...prev, hour: h }));
    setMode('minute'); // Auto advance to minute selection
  };

  const handleSelectMinute = (m) => {
    setActiveTime((prev) => ({ ...prev, minute: m }));
  };

  const handleTogglePeriod = (p) => {
    setActiveTime((prev) => ({ ...prev, period: p }));
  };

  // Clock dimensions
  const size = 220;
  const center = size / 2;
  const radius = 80;

  // Hour numbers 1 to 12
  const hourNumbers = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  // Minute numbers 0 to 55 in steps of 5
  const minuteNumbers = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  // Calculate hand angle in degrees from top (12 o'clock)
  const currentHandAngle = mode === 'hour'
    ? (activeTime.hour % 12) * 30
    : (activeTime.minute % 60) * 6;

  return (
    <div className="analog-time-picker-container" style={{
      background: 'rgba(15, 23, 42, 0.85)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: '16px',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
      backdropFilter: 'blur(10px)'
    }}>
      {/* 1. Top Tab Selector: From Time vs To Time */}
      <div style={{
        display: 'flex',
        width: '100%',
        background: 'rgba(30, 41, 59, 0.7)',
        borderRadius: '12px',
        padding: '4px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <button
          type="button"
          onClick={() => { setActiveTab('start'); setMode('hour'); }}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'start' ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(59, 130, 246, 0.3))' : 'transparent',
            color: activeTab === 'start' ? '#38bdf8' : '#94a3b8',
            outline: activeTab === 'start' ? '1px solid rgba(56, 189, 248, 0.5)' : 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
        >
          <span>FROM TIME</span>
          <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>
            {format12h(fromTime)}
          </span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('end'); setMode('hour'); }}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'end' ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.3), rgba(168, 85, 247, 0.3))' : 'transparent',
            color: activeTab === 'end' ? '#f472b6' : '#94a3b8',
            outline: activeTab === 'end' ? '1px solid rgba(244, 114, 182, 0.5)' : 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
        >
          <span>TO TIME</span>
          <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>
            {format12h(toTime)}
          </span>
        </button>
      </div>

      {/* 2. Sub-controls: Mode Selector (Hour / Minute) & AM/PM Toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '0 4px'
      }}>
        {/* Hour / Minute Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(15, 23, 42, 0.6)', padding: '3px', borderRadius: '8px' }}>
          <button
            type="button"
            onClick={() => setMode('hour')}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              border: 'none',
              background: mode === 'hour' ? '#0284c7' : 'transparent',
              color: mode === 'hour' ? '#fff' : '#94a3b8',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
          >
            Hour
          </button>
          <button
            type="button"
            onClick={() => setMode('minute')}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              border: 'none',
              background: mode === 'minute' ? '#0284c7' : 'transparent',
              color: mode === 'minute' ? '#fff' : '#94a3b8',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
          >
            Minute
          </button>
        </div>

        {/* AM / PM Toggle */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(15, 23, 42, 0.6)', padding: '3px', borderRadius: '8px' }}>
          <button
            type="button"
            onClick={() => handleTogglePeriod('AM')}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              border: 'none',
              background: activeTime.period === 'AM' ? 'linear-gradient(135deg, #eab308, #f97316)' : 'transparent',
              color: activeTime.period === 'AM' ? '#fff' : '#94a3b8',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Sun size={12} /> AM
          </button>
          <button
            type="button"
            onClick={() => handleTogglePeriod('PM')}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              border: 'none',
              background: activeTime.period === 'PM' ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'transparent',
              color: activeTime.period === 'PM' ? '#fff' : '#94a3b8',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Moon size={12} /> PM
          </button>
        </div>
      </div>

      {/* 3. Visual Analog Clock Face */}
      <div style={{ position: 'relative', width: `${size}px`, height: `${size}px`, margin: '4px 0' }}>
        <svg width={size} height={size} style={{ overflow: 'visible' }}>
          {/* Clock Outer Circle */}
          <circle
            cx={center}
            cy={center}
            r={radius + 18}
            fill="rgba(15, 23, 42, 0.9)"
            stroke={activeTab === 'start' ? '#06b6d4' : '#ec4899'}
            strokeWidth="2"
            style={{ filter: activeTab === 'start' ? 'drop-shadow(0 0 8px rgba(6,182,212,0.4))' : 'drop-shadow(0 0 8px rgba(236,72,153,0.4))' }}
          />

          {/* Inner ring */}
          <circle
            cx={center}
            cy={center}
            r={radius + 16}
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="1"
          />

          {/* Clock Hand Pointer */}
          {(() => {
            const rad = ((currentHandAngle - 90) * Math.PI) / 180;
            const handLength = mode === 'hour' ? radius - 15 : radius - 10;
            const hx = center + handLength * Math.cos(rad);
            const hy = center + handLength * Math.sin(rad);
            const strokeColor = activeTab === 'start' ? '#38bdf8' : '#f472b6';

            return (
              <g>
                <line
                  x1={center}
                  y1={center}
                  x2={hx}
                  y2={hy}
                  stroke={strokeColor}
                  strokeWidth="3"
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 6px ${strokeColor})` }}
                />
                <circle cx={center} cy={center} r="5" fill={strokeColor} />
                <circle cx={hx} cy={hy} r="14" fill={strokeColor} fillOpacity="0.25" stroke={strokeColor} strokeWidth="1.5" />
              </g>
            );
          })()}
        </svg>

        {/* Clock Number Buttons around face */}
        {(mode === 'hour' ? hourNumbers : minuteNumbers).map((num, idx) => {
          // Angle in degrees from top (12 o'clock is 0 deg -> -90 in standard polar)
          const angleDeg = idx * 30;
          const rad = ((angleDeg - 90) * Math.PI) / 180;
          const numRadius = radius - 8;
          const nx = center + numRadius * Math.cos(rad);
          const ny = center + numRadius * Math.sin(rad);

          const isSelected = mode === 'hour'
            ? activeTime.hour === num
            : (activeTime.minute === num || (activeTime.minute % 5 !== 0 && Math.round(activeTime.minute / 5) * 5 === num));

          const activeBg = activeTab === 'start'
            ? 'linear-gradient(135deg, #06b6d4, #3b82f6)'
            : 'linear-gradient(135deg, #ec4899, #a855f7)';

          return (
            <button
              key={`${mode}-${num}`}
              type="button"
              onClick={() => (mode === 'hour' ? handleSelectHour(num) : handleSelectMinute(num))}
              style={{
                position: 'absolute',
                left: `${nx - 14}px`,
                top: `${ny - 14}px`,
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                border: 'none',
                background: isSelected ? activeBg : 'transparent',
                color: isSelected ? '#ffffff' : '#e2e8f0',
                fontWeight: isSelected ? 700 : 500,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 0 10px rgba(6,182,212,0.5)' : 'none'
              }}
            >
              {mode === 'minute' ? String(num).padStart(2, '0') : num}
            </button>
          );
        })}
      </div>

      {/* 4. Active Summary Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: '100%',
        padding: '8px 12px',
        borderRadius: '10px',
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        fontSize: '0.85rem',
        color: '#cbd5e1'
      }}>
        <Clock size={15} className="icon-cyan" />
        <span>Selected Range:</span>
        <strong style={{ color: '#06b6d4' }}>{format12h(fromTime)}</strong>
        <ArrowRight size={14} style={{ color: '#64748b' }} />
        <strong style={{ color: '#ec4899' }}>{format12h(toTime)}</strong>
      </div>
    </div>
  );
}
