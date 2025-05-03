import { renderToReadableStream } from "react-dom/server";
import { dirname, join } from "path";
import Bun, { fileURLToPath } from "bun";
import { ServerSideProps } from "../src/types/server";
import { existsSync, unlinkSync } from "fs"
import { JSX } from "react";

const isProd = process.env.NODE_ENV === "production";
const currentFile = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFile);

const clientDir = join(currentDir, "..");

const distPath = join(clientDir, "dist/ssr/main.js");
const srcPath = join(clientDir, "src/main.tsx");

const socketPath = "/tmp/ssr.sock";

// Remove existing socket file if present
if (existsSync(socketPath)) {
    try {
        unlinkSync(socketPath);
    } catch (err) {
        console.error("Failed to remove existing socket file:", err);
    }
}

Bun.listen({
    unix: socketPath,
    socket: {
        data(socket, data) {
            try {
                const input = data.toString("utf8");
                const props: ServerSideProps = JSON.parse(input);

                (async () => {
                    let Entry: (props: ServerSideProps) => JSX.Element;
                    if (isProd) {
                        Entry = (await import(distPath)).Entry;
                    } else {
                        Entry = (await import(srcPath)).Entry;
                    }

                    const stream = await renderToReadableStream(
                        Entry(props)
                    );

                    const reader = stream.getReader();
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        socket.write(value);
                    }
                    socket.end();
                })();
            } catch (err) {
                console.error("SSR server error:", err);
                socket.write("Internal Server Error");
                socket.end();
            }
        },
        error(_socket, err) {
            console.error("Socket error:", err);
        },
    }
});

console.log(`SSR server listening on Unix socket: ${socketPath}`);
