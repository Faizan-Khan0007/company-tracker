import React from "react";
import { Briefcase, Send, Flame, Users, CalendarCheck, CheckCircle2 } from "lucide-react";

export function DashboardStats({ companies, onQuickFilter }) {
  const total = companies.length;
  const appliedCount = companies.filter((c) => c.applied === "applied").length;
  const toApplyCount = companies.filter((c) => c.applied === "to_apply").length;
  const highPriorityCount = companies.filter((c) => c.priority === "high").length;

  // Active pipeline: OA or Interview active
  const activePipeline = companies.filter(
    (c) =>
      (c.oa && c.oa !== "-" && c.oa !== "Not Required") ||
      (c.interview && c.interview !== "-") ||
      (c.status && (c.status.toLowerCase().includes("interview") || c.status.toLowerCase().includes("shortlisted") || c.status.toLowerCase().includes("oa")))
  );

  // POC & Outreach metrics
  const allPocs = companies.flatMap((c) => c.pocs || []);
  const totalPocsCount = allPocs.length;
  const totalContacted = companies.reduce((acc, c) => acc + (Number(c.contacted) || 0), 0);
  const totalReplies = companies.reduce((acc, c) => acc + (Number(c.replies) || 0), 0);
  const responseRate = totalContacted > 0 ? Math.round((totalReplies / totalContacted) * 100) : 0;

  const stats = [
    {
      id: "total",
      label: "Total Applications",
      value: total,
      subtext: `${appliedCount} Applied · ${toApplyCount} To Apply`,
      icon: Briefcase,
      color: "from-blue-500/20 to-indigo-500/10 text-indigo-400 border-indigo-500/20",
      filterTag: "all",
    },
    {
      id: "active",
      label: "Active Pipeline",
      value: activePipeline.length,
      subtext: "OAs & Interviews in progress",
      icon: CalendarCheck,
      color: "from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/20",
      filterTag: "active",
      badge: "In Motion",
    },
    {
      id: "priority",
      label: "High Priority Targets",
      value: highPriorityCount,
      subtext: `${Math.round((highPriorityCount / (total || 1)) * 100)}% of pipeline`,
      icon: Flame,
      color: "from-red-500/20 to-orange-500/10 text-rose-400 border-red-500/20",
      filterTag: "high_priority",
    },
    {
      id: "networking",
      label: "Outreach & POCs",
      value: totalPocsCount,
      subtext: `${totalContacted} contacted · ${totalReplies} replies (${responseRate}%)`,
      icon: Users,
      color: "from-purple-500/20 to-fuchsia-500/10 text-purple-400 border-purple-500/20",
      filterTag: "has_pocs",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <button
            key={stat.id}
            onClick={() => onQuickFilter && onQuickFilter(stat.filterTag)}
            className="group text-left p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-all duration-200 shadow-sm relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${stat.color} rounded-bl-full pointer-events-none opacity-40 group-hover:opacity-60 transition`} />
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-300 transition">
                {stat.label}
              </span>
              <div className={`p-2 rounded-xl bg-slate-800/80 border ${stat.color} group-hover:scale-110 transition-transform`}>
                <IconComponent className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {stat.value}
              </span>
              {stat.badge && (
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 rounded-md border border-emerald-500/30">
                  {stat.badge}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 mt-1 truncate">
              {stat.subtext}
            </p>
          </button>
        );
      })}
    </div>
  );
}
