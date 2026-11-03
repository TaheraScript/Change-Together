"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  CalendarPlus,
  LayoutDashboard,
  LogIn,
  LogOut,
  UserPlus,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/components/ui/toast";

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

export default function UserInfo() {
  const router = useRouter();

  // The Better Auth client comes from `@/lib/auth-client`.
  // `useSession` gives us the session on the client side.
  const { data: session, isPending } = authClient.useSession();

  // Destructure the session to reach the logged-in user's information.
  const user = session?.user;
  const displayName =
    user?.name?.trim() || user?.email?.split("@")[0] || "User";
  const email = user?.email ?? "";
  const image = user?.image ?? undefined;

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      toast.add({
        type: "success",
        title: "You're signed out",
        description: "Your events stay saved. Log back in any time.",
      });
      router.push("/");
      router.refresh();
    } catch {
      toast.add({
        type: "error",
        title: "Couldn't sign you out",
        description: "Please try again.",
      });
    }
  };

  // While the session is still loading, keep the layout from jumping.
  if (isPending) {
    return (
      <span
        aria-hidden="true"
        className="h-9 w-24 animate-pulse rounded-lg bg-slate-100"
      />
    );
  }

  // Not logged in: show the Login and Register buttons.
  if (!user) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Button
          size="sm"
          className="bg-[#164E63] text-white hover:bg-[#0e3a4b]"
          render={<Link href="/login" />}
        >
          <LogIn />
          <span>Login</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="hidden border-green-200 text-green-700 hover:bg-green-50 sm:inline-flex"
          render={<Link href="/register" />}
        >
          <UserPlus />
          <span>Register</span>
        </Button>
      </div>
    );
  }

  // Logged in: shadcn avatar (with hover name) as a dropdown + a Logout button.
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <TooltipProvider delay={150}>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger
              render={
                <DropdownMenuTrigger
                  aria-label={displayName}
                  className="rounded-full outline-none transition focus-visible:ring-4 focus-visible:ring-green-200"
                >
                  <Avatar
                    size="lg"
                    className="size-9 border-2 border-green-500"
                  >
                    {image ? (
                      <AvatarImage
                        src={image}
                        alt={displayName}
                        referrerPolicy="no-referrer"
                      />
                    ) : null}
                    <AvatarFallback className="bg-green-50 text-xs font-bold text-[#164E63]">
                      {initialsOf(displayName)}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
              }
            />
            {/* Hovering over the profile picture reveals the display name. */}
            <TooltipContent>{displayName}</TooltipContent>
          </Tooltip>

          <DropdownMenuContent align="end" className="w-56">
            <div className="flex flex-col px-1.5 py-1.5">
              <span className="truncate text-sm font-semibold text-foreground">
                {displayName}
              </span>
              {email ? (
                <span className="truncate text-xs text-muted-foreground">
                  {email}
                </span>
              ) : null}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/create-event" />}>
              <CalendarPlus />
              Create Event
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/manage-events" />}>
              <LayoutDashboard />
              Manage Events
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/joined-events" />}>
              <CalendarCheck />
              Joined Events
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipProvider>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="text-slate-500 hover:bg-red-50 hover:text-red-600"
      >
        <LogOut />
        <span className="hidden md:inline">Logout</span>
      </Button>
    </div>
  );
}
