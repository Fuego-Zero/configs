import type { MouseEventHandler } from "react";

interface ChipProps {
  once?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  online?: boolean;
  type?: "button";
}

function Chip({ onClick, type = "button" }: ChipProps) {
  return <button type={type} onClick={onClick} />;
}

export function CallbackSafe() {
  return <Chip once online type="button" onClick={() => undefined} />;
}
