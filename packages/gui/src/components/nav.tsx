export default function Nav() {
    return (
        <nav className="p-8">
            <a href="/">
                <img
                    className="h-8 object-scale-down"
                    style={{ cursor: "pointer" }}
                    src="/konball.png"
                    alt="Konbini logo"
                />
            </a>
        </nav>
    );
}
