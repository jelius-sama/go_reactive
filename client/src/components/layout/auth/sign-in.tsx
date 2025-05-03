import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useGlobalEvent } from "@/contexts/global-event"
import { toast } from "sonner"
import { useNavigate, useSearchParams } from "react-router"
import { useCacheControl } from "@/contexts/cache-control"

const signInSchema = z.object({
	email: z.string().email({ message: "Please enter a valid email address" }),
	password: z.string().min(8, { message: "Password must be at least 8 characters" }),
})

type SignInFormValues = z.infer<typeof signInSchema>

interface SignInFormProps {
	onForgotPassword?: () => void
}


export function SignInForm({ onForgotPassword }: SignInFormProps) {
	const [isLoading, setIsLoading] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const { setUser } = useGlobalEvent()
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const { clearQuoteCache } = useCacheControl()

	const form = useForm<SignInFormValues>({
		resolver: zodResolver(signInSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	})

	async function onSubmit(data: SignInFormValues) {
		setIsLoading(true)

		const response = await fetch("/api/sign-in", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email: data.email, password: data.password })
		});

		if (response.ok) {
			const user = await response.json();
			setUser(user)
			toast.success("Successfully signed in.")
			clearQuoteCache()

			setIsLoading(false)
			const redirectTo = searchParams.get("redirect")
			navigate(redirectTo ? `/${redirectTo}` : "/")
		} else {
			toast.error("Could not sign in. Check your credentials!");
			setIsLoading(false)
		}

		setIsLoading(false)
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
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

				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Password</FormLabel>
							<FormControl>
								<div className="relative">
									<Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} />
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
										onClick={() => setShowPassword(!showPassword)}
									>
										{showPassword ? (
											<EyeOffIcon className="h-4 w-4 text-muted-foreground" />
										) : (
											<EyeIcon className="h-4 w-4 text-muted-foreground" />
										)}
										<span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
									</Button>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="flex items-center justify-end">
					<Button type="button" variant="link" className="px-0 font-normal" onClick={onForgotPassword}>
						Forgot password?
					</Button>
				</div>

				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Signing in...
						</>
					) : (
						"Sign In"
					)}
				</Button>
			</form>
		</Form>
	)
}


