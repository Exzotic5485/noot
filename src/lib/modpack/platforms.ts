import ogs from "open-graph-scraper";

type Platform = {
    id: string;
    domain: string;
    parseModId(url: string): string | null;
    resolveMod(modId: string): Promise<PlatformMod | null>;
};

type PlatformMod = {
    title: string;
    description: string;
    iconUrl: string;
    url: string;
};

export const PLATFORMS: Record<string, Platform> = {
    modrinth: {
        id: "modrinth",
        domain: "modrinth.com",
        parseModId(url: string) {
            const match = url.match(/\/mod\/([a-zA-Z0-9-]+)/i);

            return match ? match[1] : null;
        },
        async resolveMod(modId: string) {
            return resolveModByOG(`https://${this.domain}/mod/${modId}`);
        },
    },
    curseforge: {
        id: "curseforge",
        domain: "www.curseforge.com",
        parseModId(url: string) {
            const match = url.match(/\/mc-mods\/([a-zA-Z0-9-]+)/i);

            return match ? match[1] : null;
        },
        async resolveMod(modId: string) {
            return resolveModByOG(`https://${this.domain}/minecraft/mc-mods/${modId}`);
        },
    },
} as const;

export function getPlatformFromUrl(url: string | URL) {
    url = typeof url === "string" ? new URL(url) : url;

    for (const platform of Object.values(PLATFORMS)) {
        if (platform.domain == url.host) return platform;
    }

    return null;
}

async function resolveModByOG(url: string): Promise<PlatformMod | null> {
    const { error, result } = await ogs({
        url,
    });

    if (error) return null;

    return {
        title: result.ogTitle ?? "",
        description: result.ogDescription ?? "",
        iconUrl: result.ogImage?.[0]?.url ?? "",
        url: result.ogUrl ?? url,
    };
}
