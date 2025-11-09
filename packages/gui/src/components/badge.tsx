import type { ComponentChildren } from "preact";

export default function Badge({
    color,
    children,
    text,
}: {
    color: `#${string}` | `var(--${string})`;
    text?: `#${string}`;
    children: ComponentChildren;
}) {
    return (
        <div
            className="px-3 py-2 font-mono text-sm font-medium  w-fit"
            style={{ backgroundColor: color, color: text }}
        >
            {children}
        </div>
    );
}
