import { MARGIN } from "@/index";
import { tryCatch } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query";
import { Fragment } from "react";
import ErrorAlert from "@/components/layout/error-alert";
import { PageData } from "@/types/server";
import { StaticMetadata } from "@/contexts/metadata";
import { SetTitle } from "@/components/layout/title"

async function fetchQuote(): Promise<{ id: number, quote: string }[] | { error: string }> {
    try {
        const [res, err] = await tryCatch(fetch(`/api/quote`));

        if (err !== null) {
            return { error: "Something went wrong" };
        }

        return await res.json() as { id: number, quote: string }[];
    } catch (error) {
        console.error("Error: ", error);
        return { error: "Something went wrong" };
    }
}

export default function Home({ pageProps }: { pageProps: PageData<"/">['data'] | null }) {
    const shouldFetch = pageProps === null;

    const { data: queryData, refetch } = useQuery<{ id: number, quote: string }[] | { error: string }>({
        queryKey: ['quotes'],
        queryFn: fetchQuote,
        enabled: shouldFetch,
        retry: false,
        staleTime: Infinity,
    });
    const quotes = pageProps ?? queryData;

    return (
        <Fragment>
            <SetTitle title="Home" />
            <StaticMetadata />

            {quotes && 'error' in quotes && (
                <section className="w-full h-full flex items-center justify-center" style={{ paddingRight: `${MARGIN}rem` }}>
                    <ErrorAlert
                        error={quotes.error}
                        title={"Error"}
                        retry={{ handler: () => refetch(), title: "Try again" }}
                    />
                </section>
            )}

            {quotes && 'error' in quotes === false && (
                <section className="w-full h-full grid grid-cols-[repeat(auto-fill,_minmax(150px,_1fr))] md:grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))] place-items-center gap-2" style={{ paddingRight: `${MARGIN}rem` }}>
                    {quotes.map((quote) => (
                        <p key={quote.id}>{quote.quote}</p>
                    ))}
                </section>
            )}

            {quotes === undefined && (
                <section className="w-full h-full grid grid-cols-[repeat(auto-fill,_minmax(150px,_1fr))] md:grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))] place-items-center gap-2" style={{ paddingRight: `${MARGIN}rem` }}>
                    {Array.from({ length: 21 }).map((_, index) => (
                        <p key={index}>Loading...</p>
                    ))}
                </section>
            )}
        </Fragment>
    );
}
