import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router";
import { Separator } from "@/components/ui/separator";
import { HomeIcon, LogInIcon, LucideProps, } from "lucide-react";
import { useGlobalEvent } from "@/contexts/global-event";
import { useConfig } from "@/contexts/config"
import { HEADER_HEIGHT } from "@/index";

export type MenuItem = {
    id: number,
    title: string;
    url: string;
    icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
}

export const addMenuItems = (items: MenuItem[], newItems: MenuItem[]): MenuItem[] => {
    const existingIds = new Set(items.map(item => item.id));
    return [...items, ...newItems.filter(item => !existingIds.has(item.id))];
};

export const removeMenuItems = (items: MenuItem[], itemsToRemove: MenuItem[]): MenuItem[] => {
    const removeIds = new Set(itemsToRemove.map(item => item.id));
    return items.filter(item => !removeIds.has(item.id));
};

export const MENU = {
    home: {
        id: 1,
        title: "Home",
        url: "/",
        icon: HomeIcon,
    },
    signIn: {
        id: 2,
        title: "Sign In",
        url: "/sign-in",
        icon: LogInIcon,
    },
    signUp: {
        id: 3,
        title: "Sign Up",
        url: "/sign-up",
        icon: LogInIcon,
    },
} as const;

function removeDuplicates<T>(items: T[]): T[] {
    const seen = new Set();
    return items.filter((item) => {
        const serializedItem = JSON.stringify(item); // Deep comparison
        if (seen.has(serializedItem)) {
            return false; // Duplicate found
        }
        seen.add(serializedItem);
        return true;
    });
}

export function AppSidebar() {
    const location = useLocation();
    const { menuItems } = useGlobalEvent();
    const { app } = useConfig();

    const uniqueMenuItems = removeDuplicates(menuItems).sort((a, b) => a.id - b.id);

    return (
        <Sidebar>
            <SidebarHeader className="flex flex-row items-center m-2" style={{ height: `${HEADER_HEIGHT}rem` }}>
                <img className="size-8" src="/assets/icon.png" />
                <h1 className="text-xl">{app.title}</h1>
            </SidebarHeader>
            <Separator />
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {uniqueMenuItems.map((item) => (
                                <SidebarMenuItem key={item.id}>
                                    <SidebarMenuButton size={"default"} isActive={location.pathname === item.url} asChild>
                                        <Link to={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
