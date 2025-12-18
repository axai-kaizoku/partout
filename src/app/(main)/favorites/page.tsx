"use client";

import { FavoritesList } from "../profile/_components/profile-tabs/favorites-list";

export default function FavoritesPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <h1 className="mb-6 font-bold font-playfair text-2xl text-foreground md:text-3xl">
            Favorites
          </h1>
          <FavoritesList />
        </div>
      </main>
    </div>
  );
}
