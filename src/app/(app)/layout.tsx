'use client'
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/ui/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { useEffect, useState } from "react";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    /* 
  React does not allow you to trigger navigation (router.push) during render. If you do, you’ll see this warning:
  Warning: Cannot update a component (`Router`) while rendering a different component (`AuthLayout`)

  So we cannot diretly use if condition with useRouter, so we use useEffect as :
  useEffect runs only after the component is loaded, so we use isAuthChecked to load the component initially then useEffect is run
  
  We needed to render something before our user condition is checked in useEffect, so we used isAuthChecked initially as false to render "Checking Auth status"

  */

    // const router = useRouter();
    // const { user } = useSelector((state: RootState) => state.auth);
    // const [isAuthChecked, setIsAuthChecked] = useState(false)

    // useEffect(() => {
    //     if (user == null) {
    //         return router.push('/signin')
    //     } else {
    //         setIsAuthChecked(true)
    //     }
    // }, [user, router])

    // if (!isAuthChecked) return "Checking auth status"


    // ********************** WE HAVE IMPLEMENTED SERVER BASED AUTH USING MIDDLEWARE.TS FILE **********************************
    return (

        <ThemeProvider attribute={"class"} defaultTheme="system" enableSystem>
            <SidebarProvider className="flex">
                <AppSidebar />
                <main className="flex-1 min-h-screen">
                    {children}
                    {/* <SidebarTrigger /> */}
                </main>
            </SidebarProvider>

        </ThemeProvider>
    );
}
