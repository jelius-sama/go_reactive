import { MARGIN } from "@/index";
import ErrorAlert from "@/components/layout/error-alert";
import { useNavigate } from "react-router";
import { Fragment } from "react";
import { Link, Meta, Metadata, Title } from "@/contexts/metadata";
import { SetTitle } from "@/components/layout/title"

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <Fragment>
            <SetTitle title="Not found" />
            <Metadata>
                <Title>404</Title>
                <Meta charset="UTF-8" />
                <Meta name="robots" content="noindex" />
                <Meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <Meta name="description" content="Sorry, the page you are looking for doesn’t exist. Try exploring more artwork on Pixelle." />
                <Meta property="og:title" content="404 – Page Not Found" />
                <Meta property="og:description" content="This page does not exist. Go back to the homepage or browse featured artwork." />
                <Meta property="og:type" content="website" />
                <Meta name="twitter:card" content="summary_large_image" />
                <Meta name="twitter:title" content="404 – Page Not Found" />
                <Meta name="twitter:description" content="This page does not exist. Go back to the homepage or browse featured artwork." />
                <Link rel="icon" href="/assets/favicon.ico" />
            </Metadata>

            <section className="w-full flex items-center justify-center" style={{ paddingRight: `${MARGIN}rem` }}>
                <ErrorAlert
                    error="The page you are looking for does not exists, please check the URL and try again."
                    title="404 - Page Not Found"
                    retry={{ handler: () => navigate("/"), title: "Return home" }}
                />
            </section>
        </Fragment>
    )
}
