import { cn } from "@/lib/utils";

export function OverlayWithCenteredInput({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed bg-black/20 flex z-50 items-center justify-center inset-0">
      <div
        className={cn(
          "w-10/12 max-w-3xl max-h-[70vh] rounded-sm border-clay border overscroll-contain overflow-auto p-8 bg-white",
          !className ? "" : className
        )}
      >
        <div className="w-full flex justify-between">{children}</div>
      </div>
    </div>
  );
}
