import React from 'react';
import { Button as NextUIButton } from '@nextui-org/react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const getVariantProps = () => {
    switch (variant) {
      case 'primary':
        return { color: 'primary' };
      case 'secondary':
        return { variant: 'bordered' };
      case 'danger':
        return { color: 'danger' };
      default:
        return { color: 'primary' };
    }
  };

  return (
    <NextUIButton
      {...getVariantProps()}
      isLoading={isLoading}
      isDisabled={disabled}
      startContent={!isLoading && leftIcon}
      endContent={!isLoading && rightIcon}
      className={className}
      {...props}
    >
      {children}
    </NextUIButton>
  );
};

export { Button };