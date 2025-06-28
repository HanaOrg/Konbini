import type { ComponentChildren } from "preact";

export default function Detail({
    iconName,
    children,
}: {
    iconName?: "web";
    children: ComponentChildren;
}) {
    return (
        <div className="flex flex-row items-center justify-center text-lg gap-2 p-4 bg-[#1515157F] text-base font-semibold rounded-xl w-fit border-1 border-[#2A2A2A]">
            {children}
        </div>
    );
}
