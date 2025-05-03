import { useGlobalEvent } from "@/contexts/global-event"
import { useLayoutEffect } from "react"


export function SetTitle({ title }: { title: string }) {
    const { setTitle } = useGlobalEvent();

    useLayoutEffect(() => {
        setTitle(title)

        return () => {
            setTitle(null)
        }
    }, [])

    return null
}

export function Title() {
    const { title } = useGlobalEvent();

    return title && <p className='font-extrabold text-xl py-2'>{title}</p>
}
