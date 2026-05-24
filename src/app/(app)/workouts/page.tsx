import { WORKOUT_TEMPLATES } from "@/lib/workouts";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";

export default function WorkoutsPage() {
  return (
    <div className="min-h-screen p-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-6">אימונים</h1>
      <div className="space-y-3">
        {WORKOUT_TEMPLATES.map((w) => (
          <Link key={w.id} href={`/workout/${w.id}`}>
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{w.nameHe}</h3>
                  <p className="text-muted-foreground text-sm">{w.nameEn}</p>
                  <p className="text-muted-foreground text-sm mt-1">{w.descriptionHe}</p>
                  <p className="text-muted-foreground text-xs mt-2">{w.focus}</p>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-sm shrink-0 mr-4">
                  <Clock className="w-4 h-4" />
                  {w.durationMinutes} דק&apos;
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
