import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { VALUE_COUNT } from "@/lib/values";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <>
      <SiteNav email={user?.email} />
      <main className="flex flex-1 items-center">
        <div className="mx-auto w-full max-w-3xl px-4 py-20 text-center sm:px-6">
          <p className="text-sm font-medium tracking-wide text-primary uppercase">
            A guided values exercise
          </p>
          <h1 className="font-display mx-auto mt-4 max-w-2xl text-5xl leading-tight tracking-tight text-balance sm:text-6xl">
            What matters most to you?
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            {`Work through ${VALUE_COUNT} values in a series of simple choices and surface the ten that matter most — then reflect on how fully you're living them. Your progress is saved as you go, so you can pause anytime and pick up where you left off.`}
          </p>
          <div className="mt-10 flex justify-center gap-3">
            <Button size="lg" asChild>
              <Link href={user ? "/assessment" : "/signup"}>
                {user ? "Continue your exercise" : "Begin"}
              </Link>
            </Button>
            {!user && (
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">I have an account</Link>
              </Button>
            )}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            About 15–20 minutes · free
          </p>
        </div>
      </main>
    </>
  );
}
