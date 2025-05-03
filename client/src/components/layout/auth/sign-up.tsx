import { useState, useRef, Fragment } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { EyeIcon, EyeOffIcon, Loader2, ImageIcon } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Link } from "react-router"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { useGlobalEvent } from "@/contexts/global-event"
import { useNavigate } from "react-router"
import { tryCatch } from "@/lib/utils"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

const signUpSchema = z
	.object({
		name: z.string().min(2, { message: "Name must be at least 2 characters" }),
		email: z.string().email({ message: "Please enter a valid email address" }),
		password: z.string().min(8, { message: "Password must be at least 8 characters" }),
		confirmPassword: z.string(),
		terms: z.boolean().refine((val) => val === true, {
			message: "You must agree to the terms and conditions",
		}),
		avatar: z
			.instanceof(File)
			.refine((file) => file.size <= MAX_FILE_SIZE, "File size must be less than 5MB")
			.refine(
				(file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
				"Only .jpg, .jpeg, .png and .webp formats are supported",
			)
			.optional(),
		banner: z
			.instanceof(File)
			.refine((file) => file.size <= MAX_FILE_SIZE, "File size must be less than 5MB")
			.refine(
				(file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
				"Only .jpg, .jpeg, .png and .webp formats are supported",
			)
			.optional(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	})

type SignUpFormValues = z.infer<typeof signUpSchema>

export function SignUpForm() {
	const [isLoading, setIsLoading] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [previewType, setPreviewType] = useState<"avatar" | "banner" | null>(null)
	const [previewImage, setPreviewImage] = useState<string | null>(null)
	const avatarInputRef = useRef<HTMLInputElement>(null)
	const bannerInputRef = useRef<HTMLInputElement>(null)
	const isMobile = useIsMobile()
	const { setUser } = useGlobalEvent();
	const navigate = useNavigate()

	const form = useForm<SignUpFormValues>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
			terms: false,
		},
	})

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: "avatar" | "banner") => {
		const file = e.target.files?.[0]
		if (!file) return

		form.setValue(fieldName, file, {
			shouldValidate: true,
			shouldDirty: true,
		})
	}

	const handlePreview = (fieldName: "avatar" | "banner") => {
		const file = form.getValues(fieldName)
		if (!file) return

		const imageUrl = URL.createObjectURL(file)
		setPreviewImage(imageUrl)
		setPreviewType(fieldName)
	}

	const closePreview = () => {
		if (previewImage) {
			URL.revokeObjectURL(previewImage)
		}
		setPreviewImage(null)
		setPreviewType(null)
	}

	async function onSubmit(data: SignUpFormValues) {
		setIsLoading(true)

		const [response, signUpErr] = await tryCatch(fetch("/api/sign_up", {
			method: "POST",
			body: JSON.stringify({ email: data.email, password: data.password }),
		}))

		setIsLoading(false)
		let loaderID: string | null = null

		if (signUpErr !== null) {
			toast.error("Network error when fetching data.")
			return
		}

		if (!response.ok) {
			console.warn("TODO: Display different error messages such as account already exists.")
			toast.error("Failed to create an account.")
			return
		}

		loaderID = String(Math.random());
		toast.loading("Setting up your profile...", { id: loaderID })

		const formData = new FormData();
		formData.append("name", data.name);
		data.avatar && formData.append("avatar", data.avatar);
		data.banner && formData.append("banner", data.banner);

		const [setupRes, setupErr] = await tryCatch(fetch("/api/new_user", {
			method: "POST",
			body: formData,
			credentials: "include"
		}))

		if (setupErr !== null) {
			toast.error("Critical error when setting up your profile.")
			return
		}

		toast.dismiss(loaderID)

		if (!setupRes.ok) {
			toast.error("Account created but could not set up your profile.")
			navigate("/")
			return
		}

		toast.success("Successfully created an account.")
		const user = await setupRes.json()
		setUser(user)
		navigate(`/profile/${user.id}`)
	}

	return (
		<Fragment>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Full Name</FormLabel>
								<FormControl>
									<Input placeholder="John Doe" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

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

					<FormField
						control={form.control}
						name="confirmPassword"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Confirm Password</FormLabel>
								<FormControl>
									<div className="relative">
										<Input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" {...field} />
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
											onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										>
											{showConfirmPassword ? (
												<EyeOffIcon className="h-4 w-4 text-muted-foreground" />
											) : (
												<EyeIcon className="h-4 w-4 text-muted-foreground" />
											)}
											<span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
										</Button>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="avatar"
						render={({ field: { value, onChange, ...fieldProps } }) => (
							<FormItem>
								<FormLabel>Avatar</FormLabel>
								<FormControl>
									<div className="flex items-center gap-2">
										<Input
											type="file"
											accept="image/*"
											{...fieldProps}
											ref={avatarInputRef}
											onChange={(e) => handleFileChange(e, "avatar")}
											className="flex-1"
										/>
										<Button
											type="button"
											variant="outline"
											size="icon"
											onClick={() => handlePreview("avatar")}
											disabled={!form.getValues("avatar")}
										>
											<ImageIcon className="h-4 w-4" />
										</Button>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="banner"
						render={({ field: { value, onChange, ...fieldProps } }) => (
							<FormItem>
								<FormLabel>Banner Image</FormLabel>
								<FormControl>
									<div className="flex items-center gap-2">
										<Input
											type="file"
											accept="image/*"
											{...fieldProps}
											ref={bannerInputRef}
											onChange={(e) => handleFileChange(e, "banner")}
											className="flex-1"
										/>
										<Button
											type="button"
											variant="outline"
											size="icon"
											onClick={() => handlePreview("banner")}
											disabled={!form.getValues("banner")}
										>
											<ImageIcon className="h-4 w-4" />
										</Button>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="terms"
						render={({ field }) => (
							<FormItem className="flex flex-row items-center space-x-2 space-y-0">
								<FormControl>
									<Checkbox checked={field.value} onCheckedChange={field.onChange} />
								</FormControl>
								<div className="space-y-1 leading-none">
									<FormLabel className="text-sm font-normal">
										I agree to the{" "}
										<Button variant="link" asChild={true} className="h-auto p-0 text-sm font-normal">
											<Link to="/tos">
												Terms of Service
											</Link>
										</Button>{" "}
										and{" "}
										<Button variant="link" asChild={true} className="h-auto p-0 text-sm font-normal">
											<Link to="/privacy-policy">
												Privacy Policy
											</Link>
										</Button>
									</FormLabel>
									<FormMessage />
								</div>
							</FormItem>
						)}
					/>

					<Button type="submit" className="w-full" disabled={isLoading}>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Creating account...
							</>
						) : (
							"Create Account"
						)}
					</Button>
				</form>
			</Form>

			{!isMobile ? (
				<Dialog open={!!previewImage} onOpenChange={() => closePreview()}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>{previewType === "avatar" ? "Avatar Preview" : "Banner Preview"}</DialogTitle>
						</DialogHeader>
						<PreviewContent previewImage={previewImage} previewType={previewType} />
					</DialogContent>
				</Dialog>
			) : (
				<Drawer open={!!previewImage} onOpenChange={() => closePreview()}>
					<DrawerContent>
						<DrawerHeader>
							<DrawerTitle>{previewType === "avatar" ? "Avatar Preview" : "Banner Preview"}</DrawerTitle>
						</DrawerHeader>
						<PreviewContent previewType={previewType} previewImage={previewImage} />
					</DrawerContent>
				</Drawer>
			)}
		</Fragment>
	)
}

function PreviewContent({ previewType, previewImage }: { previewType: "avatar" | "banner" | null, previewImage: string | null }) {
	return (
		<Fragment>
			{previewType === "avatar" ? (
				<div className="flex flex-col items-center justify-center p-4">
					<div className="relative h-40 w-40 overflow-hidden rounded-full border border-border">
						{previewImage && (
							<img
								src={previewImage || "/placeholder.svg"}
								alt="Avatar preview"
								className="h-full w-full object-cover"
							/>
						)}
					</div>
					<p className="mt-4 text-sm text-muted-foreground">Avatar Preview</p>
				</div>
			) : (
				<div className="flex flex-col items-center justify-center p-4">
					<div className="relative h-40 w-full overflow-hidden rounded-md border border-border">
						{previewImage && (
							<img
								src={previewImage || "/placeholder.svg"}
								alt="Banner preview"
								className="h-full w-full object-cover"
							/>
						)}
					</div>
					<p className="mt-4 text-sm text-muted-foreground">Banner Preview</p>
				</div>
			)}
		</Fragment>
	)
}
