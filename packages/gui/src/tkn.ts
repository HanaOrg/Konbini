// EITHER
// - find out how to hide this
// - don't use it and make requests user IP-based
export const bearer: string | null = `Bearer ${import.meta.env["VITE_GITHUB_TOKEN"]}`;
