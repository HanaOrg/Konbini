export default function Badge({
    text,
    color,
    link,
}: {
    text: string;
    color: `#${string}`;
    link?: "https://" | "mailto:";
}) {
    return (
        <div
            className="px-3 py-2 font-mono text-sm font-medium rounded-sm w-fit"
            style={{ backgroundColor: color }}
        >
            {link ? (
                <a target="_blank" rel="noopener noreferrer" href={`${link}${text}`}>
                    {text}
                </a>
            ) : (
                text
            )}
        </div>
    );
}
