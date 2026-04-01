import { MapComponent } from "@/components/gen-ui/map";
export function GenerativeUIViewer() {
  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-muted/20">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
        <div className="flex flex-col items-center gap-4">
          {/* <p className="text-muted-foreground">
          UI components will be generated here
        </p> */}
          <MapComponent />
        </div>
      </div>
    </div>
  );
}
