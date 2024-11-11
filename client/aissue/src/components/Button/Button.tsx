// components/Button.tsx
import React from 'react';
import styles from './Button.module.css';

interface ButtonProps {

  label: string;
  type?: 'button' | 'submit' | 'reset';
  style?: React.CSSProperties;
  disabled?: boolean;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({

  label,
  type = 'button',
  style,
  disabled = false,
  onClick,
}) => {
  return (
    <button
      className={styles.button}
      type={type}
      style={style}
      disabled={disabled}
      onClick={onClick}      
    >
      {label}
    </button>
  );
};

export default Button;