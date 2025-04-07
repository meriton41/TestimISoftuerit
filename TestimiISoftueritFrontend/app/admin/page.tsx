import AdminLayout from "@/components/admin-layout"
import DashboardOverview from "@/components/dashboard-overview"

export default function AdminDashboard() {
  // In a real app, this data would come from the API
  const userData = {
    name: "admin",
    role: "Admin",
    isOnline: true,
  }

  return (
    <AdminLayout user={userData}>
      <div className="p-6">
        <DashboardOverview />
      </div>
    </AdminLayout>
  )
}

