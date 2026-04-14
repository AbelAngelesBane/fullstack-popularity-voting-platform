"use client"
import { useState } from "react"
import Link from 'next/link'; // Important for Next.js!
import Hamburger from 'hamburger-react';
import { LayoutDashboard, Users, CreditCard, BarChart3 } from 'lucide-react';
import { ThemeToggle } from "./ThemeToggle";

const ITEMS = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Polls", icon: Users, path: "/poll" },
    { name: "Invoices", icon: CreditCard, path: "/invoice" },
    { name: "Reports", icon: BarChart3, path: "/report" },
];



export default function SideBar({ isOpen }: { isOpen: boolean }) {
    return (
        <aside 
            className={`
                fixed top-16 left-0 h-[calc(100vh-64px)] w-44 bg-background border-r p-4 z-40 transition-transform duration-300
                ${isOpen ? "translate-x-0" : "-translate-x-full"}
                md:translate-x-0
            `}
        >
            <nav>
                <ul className="flex flex-col gap-6">
                    {ITEMS.map((item) => (
                        <li key={item.name}>
                            <Link 
                                href={item.path} 
                                className="flex items-center gap-2 hover:text-text-primary transition-colors"
                            >
                                <item.icon size={18} />
                                <span className="text-sm font-medium">{item.name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="mt-6">
                    <ThemeToggle/>
            </div>
            
        </aside>
    );
}