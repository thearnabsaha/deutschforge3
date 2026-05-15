import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { api } from "../lib/api";
import { Layout } from "../components/layout";
import { useAuth } from "../hooks/use-auth";

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const statsQuery = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await api.stats.$get();
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const reviewCountQuery = useQuery({
    queryKey: ["review-count"],
    queryFn: async () => {
      const res = await api.review.count.$get();
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const stats = statsQuery.data;
  const dueCount = reviewCountQuery.data?.count ?? 0;

  const xpProgress = stats
    ? Math.round(
        (((stats.xp ?? 0) - (stats.xpForCurrentLevel ?? 0)) /
          ((stats.xpForNextLevel ?? 1) - (stats.xpForCurrentLevel ?? 0))) *
          100
      )
    : 0;

  return (
    <Layout>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">Keep forging your German skills</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Level" value={stats?.level ?? 1} icon="⭐" color="yellow" />
          <StatCard label="Streak" value={`${stats?.streak ?? 0}d`} icon="🔥" color="orange" />
          <StatCard label="Words" value={stats?.wordCount ?? 0} icon="📚" color="blue" />
          <StatCard label="Reviews" value={stats?.totalReviews ?? 0} icon="🔄" color="green" />
        </div>

        {/* XP Progress */}
        {stats && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Level {stats.level ?? 1} Progress
              </span>
              <span className="text-sm text-gray-500">
                {(stats.xp ?? 0) - (stats.xpForCurrentLevel ?? 0)} /{" "}
                {(stats.xpForNextLevel ?? 0) - (stats.xpForCurrentLevel ?? 0)} XP
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className="bg-indigo-600 h-3 rounded-full transition-all"
                style={{ width: `${Math.min(xpProgress, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Daily Goal */}
        {stats && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Daily Goal</span>
              <span className="text-sm text-gray-500">
                {stats.todayReviews} / {stats.dailyGoal} reviews
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  stats.dailyGoalCompleted ? "bg-green-500" : "bg-indigo-600"
                }`}
                style={{
                  width: `${Math.min(((stats.todayReviews ?? 0) / (stats.dailyGoal ?? 1)) * 100, 100)}%`,
                }}
              />
            </div>
            {stats.dailyGoalCompleted && (
              <p className="text-green-600 text-sm mt-2 font-medium">
                ✅ Daily goal completed!
              </p>
            )}
          </div>
        )}

        {/* Study CTA */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                {dueCount > 0 ? `${dueCount} cards due` : "All caught up!"}
              </h2>
              <p className="text-indigo-100 mt-1">
                {dueCount > 0
                  ? "Review your vocabulary now"
                  : "No cards due — add more words to study"}
              </p>
            </div>
            <button
              onClick={() => navigate(dueCount > 0 ? "/study" : "/words")}
              className="bg-white text-indigo-700 font-semibold px-6 py-2.5 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              {dueCount > 0 ? "Study Now" : "Add Words"}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: "yellow" | "orange" | "blue" | "green";
}) {
  const colors = {
    yellow: "bg-yellow-50 text-yellow-700",
    orange: "bg-orange-50 text-orange-700",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center text-xl mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
