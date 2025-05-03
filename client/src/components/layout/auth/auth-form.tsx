import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect } from 'react'
import { SignInForm } from "@/components/layout/auth/sign-in";
import { SignUpForm } from "@/components/layout/auth/sign-up";
import { ForgotPasswordForm } from "@/components/layout/auth/forgot-password";
import { useGlobalEvent } from "@/contexts/global-event";
import { useNavigate } from "react-router";

type Tabs = "sign-in" | "sign-up" | "forgot-password";

export default function AuthForm({ activeTab }: { activeTab: Tabs }) {
    const navigate = useNavigate();
    const { user } = useGlobalEvent();

    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [user]);

    const setActiveTab = (tab: Tabs) => {
        navigate(`/${tab}`)
    }

    return (
        <Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab as Tabs)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sign-in">Sign In</TabsTrigger>
                <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="sign-in">
                <SignInForm onForgotPassword={() => setActiveTab("forgot-password")} />
            </TabsContent>
            <TabsContent value="sign-up">
                <SignUpForm />
            </TabsContent>
            <TabsContent value="forgot-password">
                <ForgotPasswordForm onBackToSignIn={() => setActiveTab("sign-in")} />
            </TabsContent>
        </Tabs>
    )
}

