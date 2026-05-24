"use client";

import { useEffect, useState } from "react";

type P = [number, number];
type Pose = {
  head: P;
  body: P[];
  armL: P[];
  armR: P[];
  legL: P[];
  legR: P[];
  extra?: P[][];   // extra polylines (bars, ground, etc.)
};

function pts(arr: P[]) {
  return arr.map(([x, y]) => `${x},${y}`).join(" ");
}

function Fig({ pose, vb }: { pose: Pose; vb: string }) {
  return (
    <svg viewBox={vb} className="w-full h-full" aria-hidden>
      <g stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {pose.extra?.map((line, i) => (
          <polyline key={i} points={pts(line)} opacity={0.35} />
        ))}
        <circle cx={pose.head[0]} cy={pose.head[1]} r={9} fill="currentColor" stroke="none" />
        <polyline points={pts(pose.body)} />
        <polyline points={pts(pose.armL)} />
        <polyline points={pts(pose.armR)} />
        <polyline points={pts(pose.legL)} />
        <polyline points={pts(pose.legR)} />
      </g>
    </svg>
  );
}

// ─── Pose library ───────────────────────────────────────────────────────────

const VB_STAND = "0 0 100 185";
const VB_HORIZ = "0 0 210 120";
const VB_HANG  = "0 0 100 200";
const VB_LYING = "0 0 210 120";

// Standing — upright
const STAND: Pose = {
  head: [50, 13],
  body: [[50,22],[50,90]],
  armL: [[30,40],[12,65],[8,88]],
  armR: [[70,40],[88,65],[92,88]],
  legL: [[42,90],[32,135],[32,170]],
  legR: [[58,90],[68,135],[68,170]],
};

// Squat — hips down, knees wide
const SQUAT: Pose = {
  head: [50, 58],
  body: [[50,67],[52,112]],
  armL: [[34,82],[8,100],[4,118]],
  armR: [[68,82],[94,100],[98,118]],
  legL: [[42,112],[10,144],[28,172]],
  legR: [[62,112],[92,144],[74,172]],
};

// Jump — body in air, arms up
const JUMP: Pose = {
  head: [50, 6],
  body: [[50,15],[50,72]],
  armL: [[30,32],[10,22],[4,10]],
  armR: [[70,32],[90,22],[96,10]],
  legL: [[42,72],[36,108],[38,135]],
  legR: [[58,72],[64,108],[62,135]],
};

// Lunge — right leg forward
const LUNGE_DOWN: Pose = {
  head: [50, 28],
  body: [[50,37],[48,105]],
  armL: [[32,52],[14,76],[10,96]],
  armR: [[68,52],[86,76],[90,96]],
  legL: [[40,105],[28,148],[56,172]], // back leg, knee near ground
  legR: [[58,105],[76,148],[60,172]], // front leg, foot forward
};

// Push-up — side view, horizontal, UP position (VB_HORIZ)
const PUSHUP_UP: Pose = {
  head: [20, 35],
  body: [[20,48],[162,50]],
  armL: [[78,49],[78,108]],
  armR: [[78,49],[78,108]],  // same arm (side view)
  legL: [[162,50],[192,108]],
  legR: [[162,50],[192,108]],
  extra: [[[0,110],[210,110]]],
};

// Push-up DOWN position
const PUSHUP_DOWN: Pose = {
  head: [20, 65],
  body: [[20,78],[162,80]],
  armL: [[78,80],[88,96],[78,108]],
  armR: [[78,80],[88,96],[78,108]],
  legL: [[162,80],[192,108]],
  legR: [[162,80],[192,108]],
  extra: [[[0,110],[210,110]]],
};

// Pike push-up — inverted V, head down
const PIKE_UP: Pose = {
  head: [50, 42],
  body: [[42,50],[50,42],[58,50]], // shoulders area
  armL: [[42,50],[15,105],[15,112]],
  armR: [[58,50],[85,105],[85,112]],
  legL: [[50,42],[50,112]],   // vertical legs
  legR: [[50,42],[50,112]],
  extra: [[[0,115],[100,115]]],
};

const PIKE_DOWN: Pose = {
  head: [50, 90],
  body: [[42,105],[50,95],[58,105]], // low position
  armL: [[42,105],[18,115],[15,112]],
  armR: [[58,105],[82,115],[85,112]],
  legL: [[50,95],[50,115]],
  legR: [[50,95],[50,115]],
  extra: [[[0,115],[100,115]]],
};

// Pull-up — hanging from bar, arms extended (VB_HANG)
const PULLUP_DOWN: Pose = {
  head: [50, 58],
  body: [[50,67],[50,122]],
  armL: [[50,47],[42,14]],
  armR: [[50,47],[58,14]],
  legL: [[44,122],[34,160],[34,190]],
  legR: [[56,122],[66,160],[66,190]],
  extra: [[[10,12],[90,12]]],
};

// Pull-up — chin over bar
const PULLUP_UP: Pose = {
  head: [50, 22],
  body: [[50,32],[50,92]],
  armL: [[50,32],[36,22],[42,12]],
  armR: [[50,32],[64,22],[58,12]],
  legL: [[44,92],[34,130],[34,162]],
  legR: [[56,92],[66,130],[66,162]],
  extra: [[[10,12],[90,12]]],
};

// Inverted row — extended away from bar (VB_HORIZ, bar at top)
const ROW_EXTENDED: Pose = {
  head: [188, 100],
  body: [[175,105],[110,95]],
  armL: [[110,95],[85,30]],
  armR: [[110,95],[95,30]],
  legL: [[175,105],[155,112],[130,112]],
  legR: [[175,105],[155,112],[130,112]],
  extra: [[[70,28],[120,28]],[[ 0,115],[210,115]]],
};

// Inverted row — pulled up to bar
const ROW_UP: Pose = {
  head: [105, 50],
  body: [[105,58],[165,95]],
  armL: [[105,58],[90,36],[88,28]],
  armR: [[105,58],[100,36],[98,28]],
  legL: [[165,95],[155,112],[130,112]],
  legR: [[165,95],[155,112],[130,112]],
  extra: [[[70,28],[120,28]],[[0,115],[210,115]]],
};

// Dip — arms extended up (VB_STAND, bars at y=140)
const DIP_UP: Pose = {
  head: [50, 13],
  body: [[50,22],[50,85]],
  armL: [[30,40],[18,140]],
  armR: [[70,40],[82,140]],
  legL: [[42,85],[42,125],[42,162]],
  legR: [[58,85],[58,125],[58,162]],
  extra: [[[8,142],[46,142]],[[54,142],[92,142]]],
};

// Dip — arms bent, body lowered
const DIP_DOWN: Pose = {
  head: [50, 42],
  body: [[50,51],[50,118]],
  armL: [[30,68],[18,115],[18,140]],
  armR: [[70,68],[82,115],[82,140]],
  legL: [[42,118],[42,155],[42,180]],
  legR: [[58,118],[58,155],[58,180]],
  extra: [[[8,142],[46,142]],[[54,142],[92,142]]],
};

// Glute bridge — flat (VB_LYING, ground y=110)
const BRIDGE_DOWN: Pose = {
  head: [192, 96],
  body: [[178,106],[100,106]],
  armL: [[155,108],[140,110]],
  armR: [[155,108],[140,110]],
  legL: [[100,106],[72,72],[50,110]],
  legR: [[100,106],[82,68],[60,110]],
  extra: [[[0,112],[210,112]]],
};

// Glute bridge — hips raised
const BRIDGE_UP: Pose = {
  head: [192, 96],
  body: [[178,106],[100,72]],
  armL: [[155,108],[140,110]],
  armR: [[155,108],[140,110]],
  legL: [[100,72],[58,110]],
  legR: [[100,72],[68,110]],
  extra: [[[0,112],[210,112]]],
};

// Plank — static (VB_HORIZ)
const PLANK: Pose = {
  head: [20, 35],
  body: [[20,48],[162,50]],
  armL: [[80,49],[80,110]],
  armR: [[80,49],[80,110]],
  legL: [[162,50],[192,110]],
  legR: [[162,50],[192,110]],
  extra: [[[0,112],[210,112]]],
};

// Plank subtle variation (forearm plank)
const PLANK2: Pose = {
  head: [20, 38],
  body: [[20,50],[162,52]],
  armL: [[55,51],[55,110],[80,110]],   // forearm
  armR: [[55,51],[55,110],[80,110]],
  legL: [[162,52],[192,110]],
  legR: [[162,52],[192,110]],
  extra: [[[0,112],[210,112]]],
};

// Hollow body — banana shape on back (VB_LYING)
const HOLLOW: Pose = {
  head: [22, 58],
  body: [[35,65],[105,62],[145,68]],
  armL: [[35,65],[8,55]],
  armR: [[35,65],[8,55]],
  legL: [[145,68],[188,78]],
  legR: [[145,68],[188,78]],
  extra: [[[0,112],[210,112]]],
};

const HOLLOW2: Pose = {
  head: [22, 62],
  body: [[35,68],[105,65],[145,70]],
  armL: [[35,68],[8,60]],
  armR: [[35,68],[8,60]],
  legL: [[145,70],[188,82]],
  legR: [[145,70],[188,82]],
  extra: [[[0,112],[210,112]]],
};

// Leg raises — flat (VB_LYING)
const LEGS_DOWN: Pose = {
  head: [192, 96],
  body: [[178,106],[90,106]],
  armL: [[155,108],[140,110]],
  armR: [[155,108],[140,110]],
  legL: [[90,106],[48,108]],
  legR: [[90,106],[48,108]],
  extra: [[[0,112],[210,112]]],
};

// Leg raises — legs up 90°
const LEGS_UP: Pose = {
  head: [192, 96],
  body: [[178,106],[90,106]],
  armL: [[155,108],[140,110]],
  armR: [[155,108],[140,110]],
  legL: [[90,106],[90,55]],
  legR: [[90,106],[90,55]],
  extra: [[[0,112],[210,112]]],
};

// Mountain climber — plank, right knee in (VB_HORIZ)
const MC_R: Pose = {
  head: [20, 35],
  body: [[20,48],[162,50]],
  armL: [[80,49],[80,110]],
  armR: [[80,49],[80,110]],
  legL: [[162,50],[192,110]],
  legR: [[162,50],[130,82],[128,110]],
  extra: [[[0,112],[210,112]]],
};

// Mountain climber — left knee in
const MC_L: Pose = {
  head: [20, 35],
  body: [[20,48],[162,50]],
  armL: [[80,49],[80,110]],
  armR: [[80,49],[80,110]],
  legL: [[162,50],[145,80],[142,110]],
  legR: [[162,50],[192,110]],
  extra: [[[0,112],[210,112]]],
};

// Burpee — 3 frames: stand → squat → jump
const BURPEE_JUMP: Pose = {
  head: [50, 6],
  body: [[50,15],[50,72]],
  armL: [[30,32],[8,18],[4,8]],
  armR: [[70,32],[92,18],[96,8]],
  legL: [[42,72],[36,108],[36,138]],
  legR: [[58,72],[64,108],[64,138]],
};

// Superman — face down, limbs up (VB_LYING)
const SUPER_UP: Pose = {
  head: [175, 60],
  body: [[162,68],[60,68]],
  armL: [[162,68],[188,55]],
  armR: [[162,68],[188,55]],
  legL: [[60,68],[20,55]],
  legR: [[60,68],[20,55]],
  extra: [[[0,112],[210,112]]],
};

const SUPER_DOWN: Pose = {
  head: [175, 80],
  body: [[162,86],[60,86]],
  armL: [[162,86],[192,88]],
  armR: [[162,86],[192,88]],
  legL: [[60,86],[20,88]],
  legR: [[60,86],[20,88]],
  extra: [[[0,112],[210,112]]],
};

// ─── Animation map ───────────────────────────────────────────────────────────

type AnimDef = { vb: string; frames: Pose[] };

const ANIMS: Record<string, AnimDef> = {
  pushup:           { vb: VB_HORIZ, frames: [PUSHUP_UP, PUSHUP_DOWN] },
  pike_pushup:      { vb: "0 0 100 125", frames: [PIKE_UP, PIKE_DOWN] },
  pullup:           { vb: VB_HANG,  frames: [PULLUP_DOWN, PULLUP_UP] },
  inverted_row:     { vb: VB_HORIZ, frames: [ROW_EXTENDED, ROW_UP] },
  dip:              { vb: VB_STAND, frames: [DIP_UP, DIP_DOWN] },
  squat:            { vb: VB_STAND, frames: [STAND, SQUAT] },
  jump_squat:       { vb: VB_STAND, frames: [JUMP, SQUAT] },
  lunge:            { vb: VB_STAND, frames: [STAND, LUNGE_DOWN] },
  glute_bridge:     { vb: VB_LYING, frames: [BRIDGE_DOWN, BRIDGE_UP] },
  plank:            { vb: VB_HORIZ, frames: [PLANK, PLANK2] },
  hollow_body:      { vb: VB_LYING, frames: [HOLLOW, HOLLOW2] },
  leg_raise:        { vb: VB_LYING, frames: [LEGS_DOWN, LEGS_UP] },
  mountain_climber: { vb: VB_HORIZ, frames: [MC_R, MC_L] },
  burpee:           { vb: VB_STAND, frames: [STAND, SQUAT, BURPEE_JUMP] },
  superman:         { vb: VB_LYING, frames: [SUPER_DOWN, SUPER_UP] },
};

const EXERCISE_ANIM: Record<string, string> = {
  pushups:          "pushup",
  wide_pushups:     "pushup",
  diamond_pushups:  "pushup",
  decline_pushups:  "pushup",
  pike_pushups:     "pike_pushup",
  pullups:          "pullup",
  chinups:          "pullup",
  inverted_rows:    "inverted_row",
  dips:             "dip",
  squats:           "squat",
  jump_squats:      "jump_squat",
  lunges:           "lunge",
  reverse_lunges:   "lunge",
  glute_bridges:    "glute_bridge",
  plank:            "plank",
  side_plank_left:  "plank",
  side_plank_right: "plank",
  hollow_body:      "hollow_body",
  leg_raises:       "leg_raise",
  mountain_climbers:"mountain_climber",
  burpees:          "burpee",
  superman:         "superman",
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function ExerciseAnimation({ exerciseId }: { exerciseId: string }) {
  const animKey = EXERCISE_ANIM[exerciseId] ?? "squat";
  const anim = ANIMS[animKey];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
    const interval = setInterval(
      () => setIdx((i) => (i + 1) % anim.frames.length),
      1200
    );
    return () => clearInterval(interval);
  }, [animKey, anim.frames.length]);

  return (
    <div className="w-32 h-32 flex items-center justify-center text-foreground opacity-90">
      <Fig pose={anim.frames[idx]} vb={anim.vb} />
    </div>
  );
}
