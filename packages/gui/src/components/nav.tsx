export default function Nav() {
    return (
        <nav className="p-8 flex flex-row items-center justify-between">
            <a href="/">
                <img
                    className="h-8 object-scale-down cursor-pointer"
                    src="/konball.png"
                    alt="Konbini logo"
                />
            </a>

            <form action={"/search"}>
                <input
                    type="search"
                    name="q"
                    placeholder="Search for packages"
                    className="w-full border-1 border-[#FFFFFF17] hover:bg-[#FFFFFF1F] focus:bg-[#FFFFFF2F] bg-[#FFFFFF14] px-4 py-3 focus:border-1 focus:border-[#FFFFFF5A] rounded-2xl focus:outline-none"
                />
            </form>
        </nav>
    );
}
