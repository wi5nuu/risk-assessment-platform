"use client"

import React from "react"
import { Menu } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sidebar } from "./Sidebar"

export function MobileNav() {
    const [open, setOpen] = React.useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden -ml-2">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="fixed inset-y-0 left-0 z-50 h-full w-[280px] bg-card p-0 shadow-xl transition-transform duration-300 translate-x-0 translate-y-0 border-r rounded-none">
                <DialogTitle className="sr-only">Navigation Menu</DialogTitle>
                <Sidebar onMobileClose={() => setOpen(false)} isMobile />
            </DialogContent>
        </Dialog>
    )
}
