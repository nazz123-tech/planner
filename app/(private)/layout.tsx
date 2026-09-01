import { AuthGuard } from "../components/guard/AuthGuard";
import { Navigation } from "../components/ui/Navigation/Navigation";
import { DragTaskProvider } from "../components/context/DragTaskContext";

export default function PrivateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard>
            <DragTaskProvider>
                <main>
                    <Navigation />
                    {children}
                </main>
            </DragTaskProvider>
        </AuthGuard>
    );
}
