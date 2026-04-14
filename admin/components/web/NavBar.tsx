"use client"
import { useState, useTransition } from "react" 
import Link from 'next/link';
import Hamburger from 'hamburger-react';
import SideBar from "./SideBar";
import { Button } from "../ui/button";
import { logout } from "@/app/actions/auth";


export default function NavBar() {
    const [isBurgerOpen, setBurger] = useState(false);
    const [isPending, startTransition] = useTransition(); 

    function handleLogout() {
        startTransition(async () => {
            await logout();
        });
    }

    return (
        <>
            <header className="fixed top-0 left-0 right-0 h-16 p-4 flex items-center justify-between border-b bg-background z-50">
                <div className="md:hidden">
                    <Hamburger
                        size={20}
                        toggled={isBurgerOpen}
                        toggle={setBurger}
                        color="var(--foreground)"
                    />
                </div>
                
                <div className="flex-1 flex items-center justify-center">
                    <Link href="/">
                        <h1 className="text-2xl font-bold -tracking-tight">
                            VO<span className="text-primary">TWO</span>
                        </h1>
                    </Link>
                </div>

                <Button 
                    variant="outline" 
                    className="border-primary text-primary hover:bg-primary/10"
                    onClick={handleLogout}
                    disabled={isPending} 
                >
                    {isPending ? "Signing out..." : "Logout"}
                </Button>

            </header>
            <SideBar isOpen={isBurgerOpen} />
        </>
    );
}