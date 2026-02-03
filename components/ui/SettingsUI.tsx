import React from 'react';
import { CheckIcon, CaretDownIcon } from '@phosphor-icons/react';

// --- Generic Toggle Switch ---
interface ToggleProps {
    label: string;
    subLabel?: string;
    checked: boolean;
    onChange: () => void;
    icon?: React.ReactNode;
}

export const SettingsToggle: React.FC<ToggleProps> = ({ label, subLabel, checked, onChange, icon }) => (
    <div
        onClick={onChange}
        className="group flex items-center justify-between py-3 cursor-pointer select-none"
    >
        <div className="flex items-center gap-4">
            {icon && (
                <span className={`transition-colors duration-300 ${checked ? 'text-white' : 'text-white/60'}`}>{icon}</span>
            )}
            <div>
                <span className={`block text-sm transition-colors ${checked ? 'text-white' : 'text-white/60 group-hover:text-white/80'}`}>{label}</span>
                {subLabel && <span className="block text-xs text-white/50 mt-0.5">{subLabel}</span>}
            </div>
        </div>

        {/* Minimal Checkbox Design */}
        <div className={`w-6 h-6 border flex items-center justify-center transition-all duration-200 ${checked ? 'bg-white border-white' : 'bg-transparent border-white/20 group-hover:border-white/50'}`}>
            <CheckIcon size={18} weight="bold" className={`text-black transition-transform duration-200 ${checked ? 'scale-100' : 'scale-0'}`} />
        </div>
    </div>
);

// --- Generic Range Slider ---
interface SliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    unit?: string;
    onChange: (val: number) => void;
    disabled?: boolean;
}

export const SettingsSlider: React.FC<SliderProps> = ({ label, value, min, max, unit, onChange, disabled }) => (
    <div className={`space-y-3 transition-opacity duration-300 ${disabled ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex justify-between text-xs text-white/60 uppercase tracking-wide">
            <span>{label}</span>
            <span className="text-white font-['Consolas']">{value}{unit}</span>
        </div>
        <div className="relative h-1 bg-white/10 rounded-full group cursor-pointer">
            <div
                className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-150"
                style={{ width: `${((value - min) / (max - min)) * 100}%` }}
            />
            {/* Thumb - distinct but minimal */}
            <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `${((value - min) / (max - min)) * 100}%` }}
            />
            <input
                type="range"
                min={min} max={max}
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer touch-none"
            />
        </div>
    </div>
);

// --- Selection Button Group ---
interface Option {
    id: string;
    label?: string;
    value?: string; // For colors
    icon?: React.ReactNode;
}

interface SelectGroupProps {
    label: string;
    options: Option[];
    selectedId: string;
    onChange: (id: any) => void;
    type?: 'text' | 'color' | 'icon';
}

export const SettingsSelectGroup: React.FC<SelectGroupProps> = ({ label, options, selectedId, onChange, type = 'text' }) => {

    // For TEXT type, use an efficient native SELECT element (styled same as MyListPage)
    if (type === 'text') {
        return (
            <div className="space-y-2">
                <label className="text-xs text-white/60 uppercase tracking-wide">{label}</label>
                <div className="relative group">
                    <select
                        value={selectedId}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full appearance-none bg-[#222] border border-white/10 text-white pl-4 pr-10 py-2.5 rounded focus:outline-none cursor-pointer hover:bg-[#333] transition text-sm font-['Consolas'] focus:border-white/30"
                    >
                        {options.map((opt) => (
                            <option key={opt.id} value={opt.id} className="bg-[#222] text-white/80">
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    {/* Consistent Arrow */}
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <CaretDownIcon size={16} className="text-white/60" />
                    </div>
                </div>
            </div>
        );
    }

    // For COLOR and ICON, keep the specific efficient grid layouts
    return (
        <div className="space-y-3 pb-2">
            <label className="text-xs text-white/60 uppercase tracking-wide">{label}</label>
            <div className="flex gap-3 flex-wrap">
                {options.map((opt) => {
                    const isSelected = selectedId === opt.id;

                    if (type === 'color') {
                        return (
                            <button
                                key={opt.id}
                                onClick={() => onChange(opt.id)}
                                className={`w-9 h-9 rounded-md border-2 transition-all duration-200 flex items-center justify-center shadow-sm ${isSelected ? 'border-white ring-2 ring-white/20 scale-110 z-10' : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/40 hover:scale-105'}`}
                                style={{ backgroundColor: opt.value }}
                                title={opt.label || opt.id}
                            >
                                {isSelected && <CheckIcon size={14} weight="bold" className="text-black/50" />}
                            </button>
                        );
                    }

                    if (type === 'icon') {
                        return (
                            <button
                                key={opt.id}
                                onClick={() => onChange(opt.id)}
                                className={`px-4 py-1.5 rounded-full text-sm font-['Consolas'] transition-all duration-200 border flex items-center gap-2 ${isSelected ? 'border-white text-white bg-white/10' : 'border-transparent text-white/50 hover:text-white/70 hover:bg-white/5'}`}
                            >
                                {opt.icon}
                                {opt.label && <span className="text-[10px] uppercase">{opt.label}</span>}
                            </button>
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    );
};