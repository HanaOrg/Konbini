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
            className={`flex flex-row items-center justify-${justify} text-lg gap-2 px-4 py-3 bg-(--k-dimmed) font-semibold  w-fit border border-[#ffffff10] ${className}`}
        >
            {children}
        </div>
    );
}
