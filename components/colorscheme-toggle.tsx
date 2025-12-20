import React from "react";
import { ActionIcon, useMantineColorScheme } from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";

type ColorScheme = "light" | "dark" | "system";

interface Props {
  theme: ColorScheme;
  color?: string;
  className?: string;
  size?: string;
  onClick: (theme: ColorScheme) => void;
}

const ColorSchemeToggle: React.FC<Props> = ({
  theme,
  color,
  className,
  size = "lg",
  onClick,
}) => {
  const { setColorScheme } = useMantineColorScheme();

  return (
    <ActionIcon
      size={size}
      aria-label="Theme toggle"
      color={color}
      className={className}
      variant="subtle"
      onClick={() => {
        const colorScheme = theme === "light" ? "dark" : "light";
        setColorScheme(colorScheme);
        onClick(colorScheme);
      }}
    >
      {theme === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />}
    </ActionIcon>
  );
};

export default ColorSchemeToggle;
