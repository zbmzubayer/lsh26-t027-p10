import { MainNav } from "@/components/meter/main-nav";
import { getSession } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <>
      <MainNav isAuthenticated={!!session} />
      <main className="flex-1">{children}</main>
    </>
  );
}
