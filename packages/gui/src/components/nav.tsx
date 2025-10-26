import { useEffect } from "preact/hooks";
import { accentPage } from "../colors";
import { PiMagnifyingGlass } from "react-icons/pi";

export default function Nav() {
    useEffect(() => {
        if (!window.location.pathname.includes("/package/")) accentPage(undefined);
    }, []);

    return (
        <nav className="py-6 px-14 flex flex-row items-center justify-between">
            <a href="/">
                <img
                    height={80}
                    className="h-8 object-scale-down cursor-pointer"
                    src="/konball.png"
                    alt="Konbini logo"
                />
            </a>

            <form
                action={"/search"}
                className="border-1 border-[#FFFFFF17] hover:bg-[#FFFFFF1F] focus:bg-[#FFFFFF2F] bg-[#FFFFFF14] focus:border-1 focus:border-[#FFFFFF5A] rounded-xl flex flex-row items-center pl-4"
            >
                <PiMagnifyingGlass size={25} color="#FFFFFF5A" />{" "}
                <input
                    type="search"
                    name="q"
                    placeholder="Search for packages"
                    className="w-full px-4 py-3 focus:outline-none"
                />
            </form>
        </nav>
    );
}
