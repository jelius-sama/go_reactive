"use client"

import { cn } from "@/lib/utils";
import React, { HTMLAttributes, useEffect, useState } from "react";

interface ImageProps extends Omit<Omit<Omit<Omit<Omit<Omit<HTMLAttributes<HTMLImageElement>, "style">, "className">, "onError">, "onLoadingComplete">, "width">, "height"> {
    sourceOnError: "default" | (string & {}) | undefined;
    src: string | undefined;
    className?: string;
    containerClassName?: string;
    style?: React.CSSProperties;
    containerStyle?: React.CSSProperties;
    width: number;
    height: number;
    disableAnimation?: boolean;
    alt?: string;
}

export default function Image({ disableAnimation = false, sourceOnError, containerClassName, className, style, containerStyle, src, width, height, ...rest }: ImageProps) {
    const [source, setSource] = useState<string | undefined>(src);

    useEffect(() => {
        if (src === source) return
        setSource(src)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [src]);

    return (
        <span className={cn("overflow-hidden transition-all duration-300 pointer-coarse:group-active:opacity-75 pointer-fine:group-hover:opacity-75", containerClassName)} style={{ position: "relative", contain: "layout paint style", display: "block", ...containerStyle }}>
            <img
                className={cn("w-full h-full ease-in-out duration-700", className)}
                src={source}
                onError={() => { if (sourceOnError) { setSource(sourceOnError === "default" ? "/assets/logo.jpg" : sourceOnError) } }}
                style={!disableAnimation ? {
                    filter: "grayscale(100%) blur(40px)",
                    transform: "scaleX(1.1) scaleY(1.1)",
                    ...style
                } : {}}
                width={width}
                height={height}
                onLoad={(e) => {
                    if (disableAnimation) return;
                    e.currentTarget.style.filter = "grayscale(0%) blur(0px)";
                    e.currentTarget.style.transform = "scaleX(1) scaleY(1)";
                }}
                {...rest}
            />
        </span>
    );
}
