import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from "@/components/ui/card"
import { MARGIN } from "@/index"
import { Fragment } from "react"
import { StaticMetadata } from "@/contexts/metadata"
import { useConfig } from "@/contexts/config"
import AuthForm from "@/components/layout/auth/auth-form"
import { SetTitle } from "@/components/layout/title"

export default function SignIn() {
    const { app } = useConfig();

    return (
        <Fragment>
            <SetTitle title="Sign in" />
            <StaticMetadata />
            <section className="w-full flex items-center justify-center" style={{ paddingRight: `${MARGIN}rem` }}>
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">
                            Sign In
                        </CardTitle>
                        <CardDescription className="text-center">
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AuthForm activeTab='sign-in' />
                    </CardContent>
                    {app.title && (
                        <CardFooter className="flex justify-center text-sm text-muted-foreground">
                            &copy; {new Date().getFullYear() + " " + app.title + ". All rights reserved."}
                        </CardFooter>
                    )}
                </Card>
            </section>
        </Fragment>
    )
}


