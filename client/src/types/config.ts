import { LinkTag, MetaTag, ScriptTag } from "@/types/server";

export interface AppConfig {
    title?: string;
    version?: string;
    port?: string;
    url?: string;
}

export interface StaticRoute {
    path: string;
    title?: string;
    meta?: MetaTag[];
    link?: LinkTag[];
    script?: ScriptTag[];
}