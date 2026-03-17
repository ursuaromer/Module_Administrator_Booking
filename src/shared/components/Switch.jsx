import React from 'react';
import '../styles/switch.css';

const Switch = ({ checked, onChange, disabled, title }) => {
    return (
        <label className={`switch_container ${disabled ? 'disabled' : ''}`} title={title}>
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                disabled={disabled}
            />
            <span className="switch_slider"></span>
        </label>
    );
};

export default Switch;
