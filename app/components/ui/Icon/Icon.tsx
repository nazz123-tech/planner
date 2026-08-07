interface IconProps {
    name: string;
    size: number;
    className?: string;
}

export default function Icon({ name, size, className }: IconProps) {
    return (
        <svg className={className} width={size} height={size}>
            <use href={`/icons/sprite.svg#${name}`} />
        </svg>
    );
}
