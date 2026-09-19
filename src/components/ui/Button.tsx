import React from 'react';
import { Button as NextUIButton } from '@nextui-org/react';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onFocus' | 'onBlur'> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  disableAnimation?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

type RenderButtonProps = Omit<ButtonProps, 'variant'> & {
  color?: string;
  variant?: string;
  isLoading?: boolean;
  disableAnimation?: boolean;
  isDisabled?: boolean;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
};

const RenderButton = NextUIButton as unknown as React.ComponentType<RenderButtonProps>;

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  disableAnimation = true,
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
    <RenderButton
      {...getVariantProps()}
      isLoading={isLoading}
      disableAnimation={disableAnimation}
      isDisabled={disabled}
      startContent={!isLoading && leftIcon}
      endContent={!isLoading && rightIcon}
      className={className}
      {...props}
    >
      {children}
    </RenderButton>
  );
};

export { Button };
