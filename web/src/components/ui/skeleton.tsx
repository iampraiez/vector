import { cn } from "../../lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="skeleton"
      className={cn("bg-gray-100 animate-pulse rounded-md block", className)}
      {...props}
    />
  );
}

export { Skeleton };
