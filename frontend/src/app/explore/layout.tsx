import { AuthGuard } from "@/components/auth-guard";

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard allowedRoles={["student"]}>{children}</AuthGuard>;
}
