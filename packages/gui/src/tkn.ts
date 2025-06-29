// EITHER
// - find out how to hide this
// - don't use it and make requests user IP-based
const tkn = import.meta.env["VITE_GITHUB_TOKEN"];
export const bearer: string | null = tkn ? `Bearer ${tkn}` : "";
