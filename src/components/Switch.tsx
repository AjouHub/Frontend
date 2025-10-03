import React from 'react';

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    label?: string;
    labelWidth?: number; // 1. 라벨 너비를 위한 prop 추가
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange, disabled = false, label, labelWidth }) => {
    const switchId = React.useId();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.checked);
    };

    return (
        <div className={`switch-container ${disabled ? 'disabled' : ''}`}>
            {label && (
                // 2. style 속성을 추가하여 최소 너비를 동적으로 설정
                <span
                    className="switch-label-text"
                    style={{ minWidth: labelWidth ? `${labelWidth}px` : 'auto' }}
                >
                    {label}
                </span>
            )}

            <label htmlFor={switchId} className="switch-wrapper">
                <input
                    id={switchId}
                    type="checkbox"
                    checked={checked}
                    onChange={handleChange}
                    disabled={disabled}
                    className="switch-input"
                />
                <span className="switch-slider" />
            </label>
        </div>
    );
};

export default Switch;