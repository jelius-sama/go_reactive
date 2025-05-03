import { createContext, useContext, ReactNode, FC } from "react";
import { useQueryClient } from "@tanstack/react-query"

interface CacheContextType {
    clearQuoteCache: () => void;
}

const CacheContext = createContext<CacheContextType | null>(null);

export const useCacheControl = (): CacheContextType => {
    const context = useContext(CacheContext);
    if (!context) {
        throw new Error("useCacheControl must be used within a CacheControlProvider");
    }
    return context;
};

interface CacheControlProviderProps {
    children: ReactNode;
}

export const CacheControlProvider: FC<CacheControlProviderProps> = ({ children }) => {
    const queryClient = useQueryClient();

    const clearQuoteCache = () => {
        queryClient.removeQueries({
            queryKey: ['quotes'],
            exact: true,
        });
    }

    const value: CacheContextType = {
        clearQuoteCache,
    };

    return <CacheContext.Provider value={value}>{children}</CacheContext.Provider>;
};
