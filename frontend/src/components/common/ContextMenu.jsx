import { useEffect, useRef } from 'react';

export default function ContextMenu({ x, y, options, onClose }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose]);

  // Adjust menu coordinates so it does not spill off screen boundaries
  const adjustedX = Math.min(x, window.innerWidth - 200);
  const adjustedY = Math.min(y, window.innerHeight - 300);

  return (
    <div
      ref={menuRef}
      style={{ top: `${adjustedY}px`, left: `${adjustedX}px` }}
      className="fixed z-50 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 transition-colors duration-150"
    >
      {options.map((option, idx) => {
        if (option.divider) {
          return <div key={`div-${idx}`} className="h-px bg-slate-100 dark:bg-slate-800 my-1" />;
        }

        return (
          <button
            key={option.label}
            onClick={() => {
              option.onClick();
              onClose();
            }}
            className={`flex w-full items-center space-x-2.5 px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/80 text-left transition-colors duration-100 ${
              option.danger
                ? 'text-red-650 dark:text-red-400'
                : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            {option.icon}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
