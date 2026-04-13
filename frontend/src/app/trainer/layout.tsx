import { AuthGuard } from "@/components/auth-guard";

export default function TrainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard allowedRoles={["trainer"]}>{children}</AuthGuard>;
}
