import DashboardLayout from "./DashboardLayout";

export const metadata = {
  title: "Dashboard | Transaction",
  description: "Tableau de bord des transactions",
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
