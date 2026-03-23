import { toast } from "sonner";

export function copyCustomerTrackingLink(
  token: string | undefined | null,
): void {
  if (!token) {
    toast.error("No tracking link available");
    return;
  }
  const url = `${window.location.origin}/track?token=${encodeURIComponent(token)}`;
  void navigator.clipboard.writeText(url).then(
    () => toast.success("Tracking link copied!"),
    () => toast.error("Could not copy"),
  );
}
