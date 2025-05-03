import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from "@/components/ui/card"
import { MARGIN } from "@/index"
import { Fragment } from "react"
import { StaticMetadata } from "@/contexts/metadata"
import { useConfig } from "@/contexts/config"
import AuthForm from "@/components/layout/auth/auth-form"
import { SetTitle } from "@/components/layout/title"

export default function SignUp() {
    const { app } = useConfig()

    return (
        <Fragment>
            <SetTitle title="Sign up" />
            <StaticMetadata />
            <section className="w-full flex items-center justify-center" style={{ paddingRight: `${MARGIN}rem` }}>
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">
                            Create an Account
                        </CardTitle>
                        <CardDescription className="text-center">
                            Fill in your details to create a new account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AuthForm activeTab='sign-up' />
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
