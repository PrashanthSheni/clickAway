import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

export default function RadialMenu({ isOpen, onClose, items }) {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
    } else {
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !mounted) return null;

  const radius = 220; // Distance from center
  const totalItems = items.length;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-300 ${
        isOpen ? "bg-background/50 backdrop-blur-xl opacity-100 pointer-events-auto" : "bg-transparent backdrop-blur-none opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl aspect-square flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Center Node */}
        <button
          onClick={onClose}
          className={`absolute z-10 w-24 h-24 rounded-full bg-primary/20 border border-primary/40 flex flex-col items-center justify-center text-primary shadow-[0_0_50px_-10px_rgba(14,165,233,0.5)] hover:bg-primary/30 transition-all duration-500 group ${
            isOpen ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        >
          <X size={32} className="group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black uppercase mt-1 tracking-widest">Close</span>
        </button>

        {/* Radial Nodes */}
        {items.map((item, index) => {
          // Calculate position along the circle
          // Offset by -90 degrees (-PI/2) so the first item is at the top
          const angle = (index / totalItems) * 2 * Math.PI - Math.PI / 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          // Delay animation slightly for each item to create a fan-out effect
          const transitionDelay = `${index * 30}ms`;

          return (
            <button
              key={item.label}
              onClick={() => {
                navigate(item.to);
                onClose();
              }}
              style={{
                transform: isOpen 
                  ? `translate(${x}px, ${y}px) scale(1)` 
                  : `translate(0px, 0px) scale(0)`,
                transitionDelay: isOpen ? transitionDelay : "0ms"
              }}
              className={`absolute w-20 h-20 rounded-2xl bg-sf-bg-soft/80 border border-border/50 flex flex-col items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-110 hover:shadow-[0_0_30px_-5px_rgba(14,165,233,0.4)] transition-all duration-500 group text-muted-foreground`}
            >
              <item.icon size={24} className="group-hover:animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-center px-1 leading-tight w-[120px] absolute -bottom-7 text-foreground">
                {item.label}
              </span>
            </button>
          );
        })}
        
        {/* Background Decorative Rings */}
        <div className={`absolute w-[440px] h-[440px] rounded-full border border-primary/10 transition-all duration-1000 ${isOpen ? "scale-100 opacity-100" : "scale-50 opacity-0"}`} />
        <div className={`absolute w-[300px] h-[300px] rounded-full border border-primary/5 transition-all duration-700 ${isOpen ? "scale-100 opacity-100" : "scale-50 opacity-0"}`} />
      </div>
    </div>
  );
}
