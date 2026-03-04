import { getDashboardData } from "@/actions/admin";
import { Dashboard } from "./_components/dashboard";


export const metadata = {
  title: "Dashboard | Carked Admin",
  description: "Admin dashboard for Carked - view key metrics and manage the platform",
};

export default async function AdminDashboardPage() {
  // Fetch dashboard data
  const dashboardData = await getDashboardData();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <Dashboard initialData={dashboardData} />
    </div>
  );
}