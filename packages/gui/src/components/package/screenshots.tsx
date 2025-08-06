import { useState } from "preact/hooks";

export default function ScreenshotSlideshow({
    ss,
}: {
    ss: {
        text: string;
        link: `https://${string}.${"webp" | "png"}`;
    }[];
}) {
    const [slideIndex, setSlideIndex] = useState<number>(0);

    function moveSlideIndex(n: number) {
        if (n < 0) {
            setSlideIndex(ss.length - 1);
            return;
        }
        if (n > ss.length - 1) {
            setSlideIndex(0);
            return;
        }
        setSlideIndex(n);
        return;
    }

    return (
        <>
            <h2 className="mt-12 mb-4 text-3xl text-white font-semibold">Screenshots</h2>
            <div className="slideshow-container">
                {ss.map((s, i) => (
                    <div className={`slides ${i === slideIndex ? "flex" : "hidden"}`}>
                        <div className="number-text">{i + 1 + "/" + ss.length}</div>
                        <img src={s.link} alt={s.text} />
                        <div className="w-[80%] text-base min-h-18 mx-auto flex items-center justify-center text-center">
                            {s.text}
                        </div>
                        <div className="flex flex-row gap-1 items-center justify-center">
                            {ss.map((_, i) => (
                                <div
                                    className={i == slideIndex ? "dot active" : "dot"}
                                    onClick={() => moveSlideIndex(i)}
                                ></div>
                            ))}
                        </div>
                    </div>
                ))}
                <a className="prev" onClick={() => moveSlideIndex(slideIndex - 1)}>
                    &#10094;
                </a>
                <a className="next" onClick={() => moveSlideIndex(slideIndex + 1)}>
                    &#10095;
                </a>
            </div>
        </>
    );
}
