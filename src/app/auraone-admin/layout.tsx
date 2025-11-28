import { AppSidebar } from "@/components/Admin/AppSidebar";
import Header from "@/components/Admin/Header";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarProvider className="antialiased font-poppinsRegular">
            <Header/>
            <div className="flex mt-16 w-full">
                <AppSidebar />
                <main className="w-full overflow-x-auto">
                    {children}
                </main>
            </div>
        </SidebarProvider>
    );
}