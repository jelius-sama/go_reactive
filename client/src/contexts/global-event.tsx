import { MENU, MenuItem, removeMenuItems, addMenuItems } from "@/components/layout/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState, useEffect } from "react";
import { CacheControlProvider } from "@/contexts/cache-control"
import { User, UserAssets } from "@/types/server"

export interface GlobalEventType {
    title: string | null;
    setTitle: Dispatch<SetStateAction<string | null>>;
    menuItems: MenuItem[],
    setMenuItems: Dispatch<SetStateAction<MenuItem[]>>;
    user: User | null;
    setUser: Dispatch<SetStateAction<User | null>>;
    setUserAssets: Dispatch<SetStateAction<UserAssets | null>>;
    userAssets: UserAssets | null;
}

const queryClient = new QueryClient()
const GlobalEvent = createContext<GlobalEventType | undefined>(undefined);

interface GlobalEventProps {
    children: ReactNode;
    initialUser: User | null;
    initialUserAssets: UserAssets | null;
}

export const GlobalEventProvider: React.FC<GlobalEventProps> = ({ children, initialUser, initialUserAssets }) => {
    const [title, setTitle] = useState<string | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([MENU.home]);
    const [user, setUser] = useState<User | null>(initialUser);
    const [userAssets, setUserAssets] = useState<UserAssets | null>(initialUserAssets);

    // In your sign-in or sign-out handler:
    useEffect(() => {
        setMenuItems((prevItems) => {
            let updatedItems = [...prevItems];

            if (!user) {
                updatedItems = removeMenuItems(updatedItems, []);
                updatedItems = addMenuItems(updatedItems, [MENU.signIn, MENU.signUp]);
            } else {
                updatedItems = removeMenuItems(updatedItems, [MENU.signIn, MENU.signUp]);
                updatedItems = addMenuItems(updatedItems, []);
            }

            return updatedItems;
        });

        if (!user) {
            setUserAssets(null);
            return;
        }

        (async () => {
            const avatarPath = user.user_metadata.avatar_file_path;
            const bannerPath = user.user_metadata.banner_file_path;

            const params = new URLSearchParams();

            if (avatarPath) params.append("avatar_file_path", avatarPath);
            if (bannerPath) params.append("banner_file_path", bannerPath);
            const response = await fetch(`/api/user_assets?${params.toString()}`, {
                method: "GET",
            })

            if (!response.ok) {
                console.warn("Failed to fetch user assets, the user may not have set custom assets or it is a skill issue.")
                return
            }

            setUserAssets(await response.json() as UserAssets)
        })()
    }, [user])

    return (
        <GlobalEvent.Provider value={{ title, setTitle, setMenuItems, menuItems, user, setUser, setUserAssets, userAssets }}>
            <QueryClientProvider client={queryClient}>
                <CacheControlProvider>{children}</CacheControlProvider>
            </QueryClientProvider>
        </GlobalEvent.Provider>
    );
};

export const useGlobalEvent = (): GlobalEventType => {
    const context = useContext(GlobalEvent);
    if (!context) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
};

