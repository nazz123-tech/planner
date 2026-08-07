import { AuthGuard } from "../components/guard/AuthGuard";
import { Navigation } from "../components/ui/Navigation/Navigation";

export default function PrivateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <AuthGuard>
                <main>
                    <Navigation />
                    {children}
                </main>
            </AuthGuard>
        </>
    );
}
