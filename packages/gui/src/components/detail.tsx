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
            className={`flex flex-row items-center justify-${justify} text-lg gap-2 px-4 py-3 bg-[#1515157F] text-base font-semibold rounded-xl w-fit border-1 border-[#2A2A2A] ${className}`}
        >
            {children}
        </div>
    );
}
