export default function Badge({ text, color }: { text: string; color: `#${string}` }) {
    return (
        <div
            className="px-3 py-2 font-mono text-sm font-medium rounded-sm w-fit"
            style={{ backgroundColor: color }}
        >
            {text}
        </div>
    );
}
