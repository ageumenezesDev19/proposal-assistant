import { AppHeader } from "@/components/app-header";
import { getProfile } from "@/lib/actions/profile";
import { exampleProfile } from "@/lib/demo-data";
import { getCurrentUser } from "@/lib/actions/auth";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const profile = await getProfile();

  return (
    <>
      <AppHeader current="/profile" userEmail={user?.email ?? null} />

      <main className="mx-auto w-full max-w-3xl px-4 pt-10 pb-28 sm:px-6 sm:pb-20">
        <div className="mb-7">
          <p className="eyebrow mb-2.5">Profile</p>
          <h1 className="font-serif text-xl leading-tight font-medium tracking-tight sm:text-2xl">
            How your drafts should sound
          </h1>
          <p className="mt-2 max-w-xl text-sm text-ink-soft">
            This is the voice every proposal borrows. Write it the way you would talk to a client on a
            first call.
          </p>
        </div>

        <ProfileClient profile={profile} example={exampleProfile} signedIn={Boolean(user)} />
      </main>
    </>
  );
}
