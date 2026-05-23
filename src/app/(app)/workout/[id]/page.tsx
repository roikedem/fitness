import { createClient } from "@/lib/supabase/server";
import { WORKOUT_TEMPLATES } from "@/lib/workouts";
import { notFound } from "next/navigation";
import WorkoutClient from "./WorkoutClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function WorkoutPage({ params }: Props) {
  const { id } = await params;
  const template = WORKOUT_TEMPLATES.find((w) => w.id === id);
  if (!template) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <WorkoutClient workoutId={id} userId={user!.id} />;
}
