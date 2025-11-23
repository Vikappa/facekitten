import { useState } from "react";
import type { IconType } from "react-icons";

interface NavBarActionButtonProps {
  icon: IconType;
  size?: number;
  className?: string;
  functionProp?: () => void;
  ringClassName?: string;
}

export function NavBarActionButton({
  icon: Icon,
  size = 32,
  className = "",
  functionProp,
  ringClassName = "",
}: NavBarActionButtonProps) {
  const [active, setActive] = useState(false);

  function activateButton() {
    setActive(!active);
    functionProp?.();
  }

  return (
    <div
      className={`
        flex items-center justify-center
        rounded-full
        ${ringClassName}
      `}
    >
      <Icon
        size={size}
        onClick={activateButton}
        className={`cursor-pointer ${active ? "text-blue-600" : "text-black"} ${className}`}
      />
    </div>
  );
}
