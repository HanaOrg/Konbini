import type { ComponentChildren } from "preact";

export default function Detail({
    children,
    className,
    justify = "center",
}: {
    children: ComponentChildren;
    className?: string;
    justify?: "start" | "center";
}) {
    return (
        <div
            className={`flex flex-row items-center justify-${justify} text-lg gap-2 px-4 py-3 bg-[var(--k-dimmed)] text-base font-semibold rounded-xl w-fit border-1 border-[#ffffff10] ${className}`}
        >
            {children}
        </div>
    );
}
