import React from 'react';

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    label?: string;  // 기존 단일 라벨
    labelWidth?: number; // 라벨 너비를 위한 prop 추가

    // 추가: 좌/우 라벨(동시 제공 시 단일 라벨 대신 사용)
    leftLabel?: string;
    rightLabel?: string;
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange, disabled = false, label, labelWidth, leftLabel, rightLabel, }) => {
    const switchId = React.useId();
    const leftId = React.useId();
    const rightId = React.useId();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.checked);
    };

    const hasSideLabels = !!(leftLabel || rightLabel);

    return (
        <div className={`switch-container ${disabled ? 'disabled' : ''} ${hasSideLabels ? 'with-sides' : ''}`}>
            {hasSideLabels ? (
                <>
                    {leftLabel && (
                        <span
                            id={leftId}
                            className={`switch-side ${!checked ? 'is-active' : ''}`}
                            aria-hidden
                        >
              {leftLabel}
            </span>
                    )}

                    <label
                        htmlFor={switchId}
                        className="switch-wrapper"
                        aria-labelledby={`${leftLabel ? leftId : ''} ${rightLabel ? rightId : ''}`.trim()}
                        aria-label={leftLabel && rightLabel ? `${leftLabel}/${rightLabel}` : label}
                    >
                        <input
                            id={switchId}
                            type="checkbox"
                            checked={checked}
                            onChange={handleChange}
                            disabled={disabled}
                            className={`switch-input${hasSideLabels ? ' labels' : ''}`}
                        />
                        <span className="switch-slider" />
                    </label>

                    {rightLabel && (
                        <span
                            id={rightId}
                            className={`switch-side ${checked ? 'is-active' : ''}`}
                            aria-hidden
                        >
              {rightLabel}
            </span>
                    )}
                </>
            ) : (
                <>
                    {label && (
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
                </>
            )}
        </div>
    );
};


export default Switch;