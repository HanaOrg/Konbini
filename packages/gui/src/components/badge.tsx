import type { ComponentChildren } from "preact";

export default function Badge({
    color,
    children,
}: {
    color: `#${string}`;
    children: ComponentChildren;
}) {
    return (
        <div
            className="px-3 py-2 font-mono text-sm font-medium rounded-sm w-fit"
            style={{ backgroundColor: color }}
        >
            {children}
        </div>
    );
}
