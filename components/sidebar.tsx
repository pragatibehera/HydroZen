"use client";

import { useState } from "react";
import MyIcon from "@/public/Adobe Express - file (1).svg";
import {
  Cloud,
  Droplet,
  Home,
  Leaf,
  BarChart,
  Settings,
  HelpCircle,
  LogOut,
  MessageSquare,
  Menu,
  ChevronLeft,
  Waves,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter, usePathname } from "next/navigation";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  collapsed?: boolean;
}

function NavItem({ icon, label, isActive, onClick, collapsed }: NavItemProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="lg"
            className={cn(
              "w-full justify-start gap-3 px-3 font-normal transition-colors duration-200",
              isActive
                ? "bg-gradient-to-r from-blue-100 to-cyan-50 text-blue-700 dark:from-blue-900/40 dark:to-cyan-900/20 dark:text-blue-300"
                : "text-gray-600 dark:text-gray-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20",
              collapsed && "justify-center px-0"
            )}
            onClick={onClick}
          >
            {icon}
            {!collapsed && (
              <span className="transition-opacity duration-200">{label}</span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className={cn(!collapsed && "hidden")}>
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    {
      id: "overview",
      label: "Hydroview",
      icon: <Home className="h-5 w-5" />,
      path: "/",
    },
    {
      id: "hydro-harvest",
      label: "Hydro Harvest",
      icon: <Cloud className="h-5 w-5" />,
      path: "/models/atmospheric-moisture",
    },
    {
      id: "hydro-guard",
      label: "Hydro Guard",
      icon: <Droplet className="h-5 w-5" />,
      path: "/models/leakage-detection",
    },
    {
      id: "hydro-hold",
      label: "Hydro Hold",
      icon: <Home className="h-5 w-5" />,
      path: "/models/household-management",
    },
    {
      id: "hydro-grow",
      label: "Hydro Grow",
      icon: <Leaf className="h-5 w-5" />,
      path: "/models/agriculture-optimization",
    },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleTabClick = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:sticky top-0 left-0 h-screen transform transition-all duration-300 ease-in-out z-50",
          "bg-gradient-to-b from-white/95 to-blue-50/95 dark:from-gray-900/95 dark:to-blue-950/95 backdrop-blur-md",
          "border-r border-blue-100 dark:border-blue-800",
          "md:translate-x-0 flex flex-col",
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 flex items-center justify-between">
            <div
              className={cn(
                "flex items-center gap-2 transition-all duration-300",
                isCollapsed ? "justify-center w-full" : "px-2"
              )}
            >
              <div className="rounded-full bg-white p-1.5 relative group">
                <img
                  src="/Adobe Express - file (1).svg"
                  alt="HydroZen Logo"
                  className="h-6 w-6 animate-pulse "
                />
                <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-ping group-hover:animate-none"></div>
              </div>
              {!isCollapsed && (
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  HydroZen
                </h1>
              )}
            </div>

            {/* Collapse Button (Desktop Only) */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex hover:bg-blue-50 dark:hover:bg-blue-900/20"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <ChevronLeft
                className={cn(
                  "h-4 w-4 transition-transform duration-300",
                  isCollapsed && "rotate-180"
                )}
              />
            </Button>
          </div>

          <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
            {tabs.map((tab) => (
              <NavItem
                key={tab.id}
                icon={tab.icon}
                label={tab.label}
                isActive={pathname === tab.path}
                onClick={() => handleTabClick(tab.path)}
                collapsed={isCollapsed}
              />
            ))}
          </nav>

          <div className="border-t border-blue-100 dark:border-blue-800 p-2">
            <NavItem
              icon={<Settings className="h-5 w-5" />}
              label="Settings"
              collapsed={isCollapsed}
            />
            <NavItem
              icon={<HelpCircle className="h-5 w-5" />}
              label="Help & Support"
              collapsed={isCollapsed}
            />
            <NavItem
              icon={<LogOut className="h-5 w-5" />}
              label="Logout"
              collapsed={isCollapsed}
            />
          </div>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        className="fixed bottom-4 right-4 md:hidden z-50 bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-3 rounded-full shadow-lg hover:shadow-blue-500/25 transition-shadow duration-200"
        onClick={toggleMobileMenu}
      >
        <Menu className="h-6 w-6" />
      </button>
    </>
  );
}
