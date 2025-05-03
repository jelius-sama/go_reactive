import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { MouseEventHandler } from "react";

export default function ErrorAlert({ error, title, retry }: { error: string, title: string, retry?: { handler: MouseEventHandler<HTMLButtonElement>, title: string } }) {
    return (
        <Alert variant={"destructive"} className="flex flex-col w-full md:max-w-lg xl:max-w-xl [&>svg~*]:pl-0">
            <span className="flex flex-row items-center">
                <AlertCircleIcon className="h-4 w-4" />
                <AlertTitle className="!pl-3">{title}</AlertTitle>
            </span>
            <AlertDescription className="!pl-7">
                {error}
            </AlertDescription>
            {retry && (
                <Button variant={"secondary"} size={"sm"} className="w-fit place-self-end !pl-3 mt-3" onClick={retry.handler}>{retry.title}</Button>
            )}
        </Alert>
    )
}
