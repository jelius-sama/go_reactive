// Change this to match the user struct of your application
export type User = any;
export type UserAssets = any

export interface ServerSideProps {
    didEncounterInternalServerError: boolean;
    serverSideProps: {
        userAssets: UserAssets | null;
        user: User | null;
        pageData: PageData<"/" | "*">;
    };
}

export type PageData<PP extends string> = {
    path: PP;
    data: PP extends "/"
    ? { id: number, quote: string }[]
    : null;
    metadata: HeadConfig;
};


export interface MetaNameTag {
    name: "description" | "keywords" | "author" | "viewport" | "theme-color" | "twitter:card" | "twitter:title" | "twitter:description" | "twitter:image" | "twitter:site" | "twitter:creator" | "apple-mobile-web-app-capable" | "apple-mobile-web-app-status-bar-style" | "mobile-web-app-capable" | "robots";
    content: string;
}

export interface MetaPropertyTag {
    property: "og:title" | "og:description" | "og:image" | "og:url" | "og:type" | "og:site_name";
    content: string;
}

export interface MetaCharsetTag {
    charset: string;
}

export interface MetaHttpEquivTag {
    ["http-equiv"]: string;
    content: string;
}

export type MetaTag = MetaNameTag | MetaPropertyTag | MetaCharsetTag | MetaHttpEquivTag;

export interface LinkTag {
    rel: "icon" | "apple-touch-icon" | "stylesheet" | "preconnect" | "manifest" | "canonical";
    href: string;
    type?: string;
    crossorigin?: string;
}

export interface ScriptTag {
    src?: string;
    defer?: boolean;
    type?: string;
    content?: string;
}

export interface HeadConfig {
    title: string;
    meta: MetaTag[];
    link: LinkTag[];
    script?: ScriptTag[];
}
