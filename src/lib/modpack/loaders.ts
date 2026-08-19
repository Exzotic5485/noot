type Loader = {
    logoUrl: string;
    name: string;
}

export const LOADERS: Record<string, Loader> = {
    fabric: {
        logoUrl: "https://fabricmc.net/assets/logo.png",
        name: "Fabric"
    },
    forge: {
        logoUrl: "https://files.minecraftforge.net/static/images/embed_logo.png",
        name: "Forge"
    },
    neoforge: {
        logoUrl: "https://neoforged.net/img/authors/neoforged.png",
        name: "NeoForge"
    },
} as const;
