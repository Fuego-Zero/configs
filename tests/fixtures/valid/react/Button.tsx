import type { MouseEventHandler, ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit";
}

export function Button({ children, disabled, onClick, type = "button" }: ButtonProps) {
  return (
    <button disabled={disabled} type={type} onClick={onClick}>
      {children}
    </button>
  );
}
