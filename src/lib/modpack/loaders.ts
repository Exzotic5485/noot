type Loader = {
    logoUrl: string;
}

export const LOADERS: Record<string, Loader> = {
    fabric: {
        logoUrl: "https://fabricmc.net/assets/logo.png",
    },
    forge: {
        logoUrl: "",
    },
    neoforge: {
        logoUrl: "",
    },
} as const;
