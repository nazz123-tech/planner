interface IconProps {
  name: string;
  size: number;
}

export default function Icon({ name, size }: IconProps) {
  return (
    <svg width={size} height={size}>
      <use href={`/sprite.svg#${name}`} />
    </svg>
  );
}
