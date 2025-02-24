"use client";

import MainLayout from "@/components/layout/main-layout";
import { PuzzleCreator } from "@/components/puzzle/PuzzleCreator";

export default function CreatePuzzlePage() {
  return (
    <MainLayout>
      <PuzzleCreator />
    </MainLayout>
  );
}
