import { AuthGuard } from "@/components/auth-guard";

export default function GymLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard allowedRoles={["gym_owner"]}>{children}</AuthGuard>;
}
