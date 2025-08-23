import type { KONBINI_MANIFEST } from "shared/types/manifest";

export default function MaintainersList({
    author,
    maintainers,
}: {
    author: string;
    maintainers: KONBINI_MANIFEST["maintainers"];
}) {
    return (
        <>
            <h2 className="mt-12 text-3xl text-white font-semibold">Maintainers of this package</h2>
            <p className="mb-4">besides {author}</p>
            <div className="flex flex-row gap-4 flex-wrap">
                {maintainers!.map((m) => (
                    <div className="flex flex-col gap-1 flex-grow-1">
                        <h3 className="text-xl font-semibold text-white">{m.name}</h3>
                        {m.email && <a href={`mailto:${m.email}`}>{m.email}</a>}
                        <div className="flex flex-row gap-2">
                            {m.github && (
                                <a
                                    href={`https://github.com/${m.github}`}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                    className="py-2 px-4 rounded-xl bg-[#00000020] w-auto hover:bg-[#00000090]"
                                >
                                    {m.github} on GitHub
                                </a>
                            )}
                            {m.link && (
                                <a
                                    href={m.link}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                    className="py-2 px-4 rounded-xl bg-[#00000020] w-auto hover:bg-[#00000090]"
                                >
                                    {m.link}
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
