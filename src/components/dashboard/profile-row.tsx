'use client';

import { Profile } from "@/lib/types";
import { User, Briefcase, GraduationCap, Code, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ProfileRowProps {
  profile: Profile;
}

export function ProfileRow({ profile }: ProfileRowProps) {
  return (
    <div className="group relative mb-4">
      {/* Subtle animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-indigo-50/30 to-teal-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-xl" />
      
      <div className="relative rounded-xl bg-white shadow-lg hover:shadow-xl border border-gray-100 transition-all duration-300 group-hover:-translate-y-0.5">
        <div className="px-4 sm:px-6 py-4">
          {/* Main container - stack on mobile, row on desktop */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 max-w-7xl mx-auto">
            {/* Left section with avatar, name and stats */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1 min-w-0">
              {/* Avatar and Name group */}
              <div className="flex items-center gap-4">
                {/* Enhanced Avatar Circle */}
                <div className="shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 p-[2px] shadow-lg group-hover:shadow-teal-500/25 transition-all duration-300">
                  <div className="h-full w-full rounded-full bg-white p-2 flex items-center justify-center">
                    <User className="h-5 w-5 text-teal-600" />
                  </div>
                </div>

                {/* Name with enhanced gradient */}
                <h3 className="text-lg font-semibold bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent whitespace-nowrap">
                  {profile.first_name} {profile.last_name}
                </h3>
              </div>

              {/* Stats Row - hidden on mobile, visible on sm and up */}
              <div className="hidden sm:flex items-center gap-3">
                {[
                  { 
                    icon: Briefcase, 
                    label: "Experience", 
                    count: profile.work_experience.length,
                    colors: {
                      bg: "from-cyan-50 to-cyan-100/70",
                      text: "text-cyan-700",
                      iconBg: "bg-cyan-100",
                      border: "border-cyan-200/50"
                    }
                  },
                  { 
                    icon: GraduationCap, 
                    label: "Education", 
                    count: profile.education.length,
                    colors: {
                      bg: "from-indigo-50 to-indigo-100/70",
                      text: "text-indigo-700",
                      iconBg: "bg-indigo-100",
                      border: "border-indigo-200/50"
                    }
                  },
                  { 
                    icon: Code, 
                    label: "Projects", 
                    count: profile.projects.length,
                    colors: {
                      bg: "from-violet-50 to-violet-100/70", 
                      text: "text-violet-700",
                      iconBg: "bg-violet-100",
                      border: "border-violet-200/50"
                    }
                  },
                ].map((stat) => (
                  <div 
                    key={stat.label} 
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full",
                      "bg-gradient-to-r border shadow-sm",
                      "transition-all duration-300 hover:shadow",
                      "hover:-translate-y-0.5",
                      stat.colors.bg,
                      stat.colors.border
                    )}
                  >
                    <div className={cn(
                      "p-1 rounded-full transition-transform duration-300",
                      stat.colors.iconBg,
                      "group-hover:scale-110"
                    )}>
                      <stat.icon className={cn("h-3.5 w-3.5", stat.colors.text)} />
                    </div>
                    <span className="text-sm whitespace-nowrap">
                      <span className={cn("font-semibold", stat.colors.text)}>{stat.count}</span>
                      <span className="text-muted-foreground ml-1.5">{stat.label}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Edit Button with enhanced styling */}
            <Link href="/profile" className="shrink-0">  
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200/70 hover:border-teal-300 text-teal-700 
                           hover:bg-gradient-to-r hover:from-teal-100 hover:to-cyan-100
                           transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md shadow-sm rounded-lg"
              >
                <Pencil className="h-3.5 w-3.5 mr-2" />
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 