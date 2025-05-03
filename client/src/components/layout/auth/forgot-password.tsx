import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"

const forgotPasswordSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

interface ForgotPasswordFormProps {
    onBackToSignIn: () => void
}

export function ForgotPasswordForm({ onBackToSignIn }: ForgotPasswordFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const form = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    })

    function onSubmit(data: ForgotPasswordFormValues) {
        setIsLoading(true)
        // Simulate API call
        console.log(data)
        setTimeout(() => {
            setIsLoading(false)
            setIsSubmitted(true)
        }, 2000)
    }

    return (
        <div className="space-y-4 pt-4">
            <Button
                type="button"
                variant="ghost"
                className="mb-2 -ml-2 flex h-8 items-center text-sm"
                onClick={onBackToSignIn}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to sign in
            </Button>

            {isSubmitted ? (
                <div className="space-y-4">
                    <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertDescription className="ml-2 text-green-800 dark:text-green-300">
                            If an account exists with the email you provided, you will receive password reset instructions.
                        </AlertDescription>
                    </Alert>
                    <Button
                        type="button"
                        className="w-full"
                        onClick={() => {
                            setIsSubmitted(false)
                            form.reset()
                        }}
                    >
                        Send another reset link
                    </Button>
                </div>
            ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="text-sm text-muted-foreground">
                            Enter your email address and we&apos;ll send you a link to reset your password.
                        </div>

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="name@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending reset link...
                                </>
                            ) : (
                                "Send Reset Link"
                            )}
                        </Button>
                    </form>
                </Form>
            )}
        </div>
    )
}

