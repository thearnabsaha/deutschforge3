import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Layout } from "../components/layout";
import { useAuth } from "../hooks/use-auth";
import { BADGE_DEFS } from "./badge-defs";

export default function ProfilePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [goalInput, setGoalInput] = useState("");
  const [goalMsg, setGoalMsg] = useState("");

  const statsQuery = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await api.stats.$get();
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const badgesQuery = useQuery({
    queryKey: ["badges"],
    queryFn: async () => {
      const res = await fetch("/api/stats/badges", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ badges: Array<{ key: string; earned: boolean; earnedAt: string | null }> }>;
    },
  });

  const goalMutation = useMutation({
    mutationFn: async (dailyGoal: number) => {
      const res = await fetch("/api/stats/goal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ dailyGoal }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stats"] });
      setGoalMsg("Goal updated!");
      setGoalInput("");
      setTimeout(() => setGoalMsg(""), 3000);
    },
  });

  const stats = statsQuery.data;
  const badges = badgesQuery.data?.badges ?? [];

  const xpProgress = stats
    ? Math.round(
        (((stats.xp ?? 0) - (stats.xpForCurrentLevel ?? 0)) /
          ((stats.xpForNextLevel ?? 1) - (stats.xpForCurrentLevel ?? 0))) *
          100
      )
    : 0;

  return (
    <Layout>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

        {/* User card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-2xl font-bold text-indigo-700">
              {user?.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">Your Stats</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Level</p>
                <p className="text-2xl font-bold text-gray-900">{stats.level}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total XP</p>
                <p className="text-2xl font-bold text-gray-900">{stats.xp}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Streak</p>
                <p className="text-2xl font-bold text-gray-900">{stats.streak} days 🔥</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Longest Streak</p>
                <p className="text-2xl font-bold text-gray-900">{stats.longestStreak} days</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Words Learned</p>
                <p className="text-2xl font-bold text-gray-900">{stats.wordCount}</p>
              </div>
            </div>

            {/* XP bar */}
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Level {stats.level ?? 1}</span>
                <span>
                  {(stats.xp ?? 0) - (stats.xpForCurrentLevel ?? 0)} /{" "}
                  {(stats.xpForNextLevel ?? 0) - (stats.xpForCurrentLevel ?? 0)} XP to Level{" "}
                  {(stats.level ?? 1) + 1}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${Math.min(xpProgress, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Daily Goal */}
        {stats && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Daily Goal</h3>
            <p className="text-gray-500 text-sm mb-3">
              Current: <strong>{stats.dailyGoal} reviews/day</strong>
            </p>
            <div className="flex gap-3">
              <input
                type="number"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="New goal (5-200)"
                min={5}
                max={200}
                className="w-40 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => {
                  const n = parseInt(goalInput);
                  if (n >= 5 && n <= 200) goalMutation.mutate(n);
                }}
                disabled={!goalInput || goalMutation.isPending}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
              >
                Update
              </button>
            </div>
            {goalMsg && <p className="text-green-600 text-sm mt-2">{goalMsg}</p>}
          </div>
        )}

        {/* Badges */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            Badges ({badges.filter((b) => b.earned).length}/{badges.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {badges.map((badge) => {
              const def = BADGE_DEFS[badge.key] ?? { icon: "🏅", name: badge.key, desc: "" };
              return (
                <div
                  key={badge.key}
                  className={`p-4 rounded-xl border text-center ${
                    badge.earned
                      ? "border-yellow-200 bg-yellow-50"
                      : "border-gray-200 bg-gray-50 opacity-50"
                  }`}
                >
                  <div className="text-3xl mb-2">{def.icon}</div>
                  <p className="text-sm font-medium text-gray-800">{def.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{def.desc}</p>
                  {badge.earned && badge.earnedAt && (
                    <p className="text-xs text-yellow-600 mt-1">
                      {new Date(badge.earnedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
