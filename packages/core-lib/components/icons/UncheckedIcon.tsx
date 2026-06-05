export const UncheckedIcon = ({ color }: { color?: string }) => {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        fill="white"
        stroke={color ?? "#666666"}
        strokeWidth="2"
      />
    </svg>
  );
};
