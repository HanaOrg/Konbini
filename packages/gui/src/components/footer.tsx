export default function Footer() {
    return (
        <footer>
            <i>Your convenience store.</i>
            Copyright &copy; The Hana Organization, 2025
            <hr />
            <p>
                <a href="/safety">How we keep our apps safe</a>
                {" · "}
                <a href="/credits">Who we are</a>
            </p>
            <hr />
            <p style={{ textAlign: "center", margin: 0, color: "orange", fontWeight: 600 }}>
                THIS IS NOT RELEASE SOFTWARE, it has been publicized for testing purposes.
                <br />
                IT IS NOT EXPECTED TO FEEL FINISHED OR BEHAVE PROPERLY.
            </p>
        </footer>
    );
}
