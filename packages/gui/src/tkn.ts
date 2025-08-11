const tkn = "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"; //import.meta.env["VITE_GITHUB_TOKEN"];
export const bearer: string | null = tkn ? `Bearer ${tkn}` : "";
