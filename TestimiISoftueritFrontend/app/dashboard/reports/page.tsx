"use client";

import ReportsOverview from "@/components/reports-overview";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Analyze your financial data and track your spending patterns
        </p>
      </div>
      <ReportsOverview />
    </div>
  );
}
