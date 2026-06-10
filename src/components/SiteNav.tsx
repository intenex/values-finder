import Link from "next/link";
import { logout } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

export function SiteNav({ email }: { email?: string | null }) {
  return (
    <nav className="border-b bg-card/60">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-display text-lg tracking-tight">
          Values
        </Link>
        <div className="flex items-center gap-1">
          {email ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/assessment">Exercise</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/profile">Profile</Link>
              </Button>
              <form action={logout}>
                <Button variant="ghost" size="sm" type="submit">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
