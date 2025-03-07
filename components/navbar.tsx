"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Menu,
  MessageCircle,
  Moon,
  Search,
  Sun,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only show UI after first render on client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <header className="border-b border-blue-100 dark:border-blue-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
              HydroZen
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            {/* Placeholder buttons with same dimensions but no icons */}
            <div className="w-10 h-10" />
            <div className="w-10 h-10" />
            <div className="w-10 h-10" />
            <div className="w-10 h-10" />
            <div className="w-10 h-10" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-blue-100 dark:border-blue-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
            HydroZen
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          {isSearchOpen ? (
            <div className="relative w-full max-w-md">
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8 pr-4 py-2 w-full"
                autoFocus
                onBlur={() => setIsSearchOpen(false)}
              />
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="sr-only">Messages</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {theme === "dark" ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <User className="h-5 w-5" />
            <span className="sr-only">Profile</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
