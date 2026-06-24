import type { ElementType, ComponentPropsWithoutRef, ReactNode } from 'react';

interface BaseButtonProps {
  children: ReactNode;
  variant?: 'popular' | 'secondary';
  className?: string;
}

type ButtonProps<T extends ElementType> = BaseButtonProps & {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, keyof BaseButtonProps | 'as'>;

export function Button<T extends ElementType = 'button'>({
  children,
  variant = 'secondary',
  className = '',
  as,
  ...props
}: ButtonProps<T>) {
  const Component = as || 'button';

  const baseStyles = "w-full font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider mt-8 transition-all active:scale-98 cursor-pointer relative overflow-hidden group/btn before:absolute before:inset-0 before:top-0 before:-left-[100%] before:w-[50%] before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transform before:-skew-x-25 hover:before:left-[150%] before:transition-all before:duration-1000 before:ease-in-out";
  
  const variants = {
    popular: 'appearance-none bg-indigo-600 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-200 dark:shadow-none transform-gpu',
    secondary: 'bg-slate-50 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700/50 border border-slate-700/20',
  };

  return (
    <Component 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </Component>
  );
}
