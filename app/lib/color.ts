/**
 * Small colour helpers for keeping text legible on a coloured surface.
 */

function parseHex(input: string): [number, number, number] | null {
    let hex = input.trim().replace(/^#/, "");
    if (hex.length === 3) {
        hex = hex
            .split("")
            .map((channel) => channel + channel)
            .join("");
    }
    if (hex.length !== 6 || /[^0-9a-f]/i.test(hex)) return null;

    const value = Number.parseInt(hex, 16);
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

/** WCAG relative luminance, 0 (black) – 1 (white). Null when unparseable. */
export function relativeLuminance(color: string): number | null {
    const rgb = parseHex(color);
    if (!rgb) return null;

    const [r, g, b] = rgb.map((channel) => {
        const c = channel / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** True when `color` is dark enough that it needs light text on top of it. */
export function isDarkColor(color: string): boolean {
    const luminance = relativeLuminance(color);
    return luminance !== null && luminance < 0.5;
}

/**
 * A theme text colour that stays readable on `background`. Returns null when
 * the background can't be parsed, so callers can keep their default.
 */
export function readableTextColor(background: string): string | null {
    const luminance = relativeLuminance(background);
    if (luminance === null) return null;
    return luminance < 0.5
        ? "var(--text-on-primary)"
        : "var(--text-primary)";
}
