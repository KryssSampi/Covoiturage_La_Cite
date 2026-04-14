/**
 * ProfileStatsSection - Section Statistiques
 * Anciennement dans [id]/page.tsx lignes 414-443
 */

"use client";

import { FaGauge, FaCar, FaStar, FaLeaf } from "react-icons/fa6";

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string | number;
}

function StatCard({ icon, iconBg, label, value }: StatCardProps) {
  return (
    <div className="flex items-center rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className={`flex h-18 w-24 items-center justify-center rounded-lg ${iconBg}`}>
        {icon}
      </div>
      <div className="flex flex-col gap-1 w-full justify-center items-center">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl text-center font-bold text-gray-800">
          {value}
        </p>
      </div>
    </div>
  );
}

interface ProfileStatsSectionProps {
  statisticsLabel: string;
  goScoreLabel: string;
  goScore: number;
  tripCountLabel: string;
  tripCount: number;
  globalRatingLabel: string;
  globalRating: string;
  co2SavingsLabel: string;
  co2Savings: string;
}

export function ProfileStatsSection({
  statisticsLabel,
  goScoreLabel,
  goScore,
  tripCountLabel,
  tripCount,
  globalRatingLabel,
  globalRating,
  co2SavingsLabel,
  co2Savings,
}: ProfileStatsSectionProps) {
  return (
    <section className="mb-6">
      <h2 className="mb-3 text-lg font-bold">{statisticsLabel}</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          icon={<FaGauge size={34} className="text-green-500" />}
          iconBg="bg-green-50"
          label={goScoreLabel}
          value={goScore}
        />
        <StatCard
          icon={<FaCar size={34} className="text-blue-500" />}
          iconBg="bg-blue-50"
          label={tripCountLabel}
          value={tripCount}
        />
        <StatCard
          icon={<FaStar size={34} className="text-purple-500" />}
          iconBg="bg-purple-50"
          label={globalRatingLabel}
          value={globalRating}
        />
        <StatCard
          icon={<FaLeaf size={34} className="text-green-500" />}
          iconBg="bg-green-50"
          label={co2SavingsLabel}
          value={co2Savings}
        />
      </div>
    </section>
  );
}
