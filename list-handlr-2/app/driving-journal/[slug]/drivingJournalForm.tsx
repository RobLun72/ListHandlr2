import { NamedDateListData } from "@/DTO/oneDateListData";
import { DrivingJournalItemData } from "@/DTO/drivingJournalItemData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useForm, SubmitHandler } from "react-hook-form";
import { formatDate } from "@/Helpers/formatDate";

interface DrivingJournalFormValues {
  date: string;
  startOdometer: string;
  endOdometer: string;
  distance: string;
  notes: string;
}

export interface DrivingJournalFormProps {
  mode: "Edit" | "Add";
  item: NamedDateListData<DrivingJournalItemData>;
  onDone?: (values: NamedDateListData<DrivingJournalItemData>) => void;
  onClose?: () => void;
}

export function DrivingJournalForm({
  mode,
  item,
  onClose,
  onDone,
}: DrivingJournalFormProps) {
  const { theme } = useTheme();

  const formData: DrivingJournalFormValues = {
    date:
      item.date instanceof Date
        ? item.date.toISOString().split("T")[0]
        : formatDate(new Date()) || "",
    startOdometer: item.itemData.startOdometer || "",
    endOdometer: item.itemData.endOdometer || "",
    distance: item.itemData.distance.toString() || "",
    notes: item.itemData.notes || "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<DrivingJournalFormValues>({ defaultValues: formData });

  const watchStartOdometer = watch("startOdometer");
  const watchEndOdometer = watch("endOdometer");

  // Calculate distance if both odometer readings are provided
  const calculateDistance = () => {
    if (watchStartOdometer && watchEndOdometer) {
      const start = parseFloat(watchStartOdometer);
      const end = parseFloat(watchEndOdometer);
      if (!isNaN(start) && !isNaN(end)) {
        return Math.abs(end - start).toFixed(0);
      }
    }
    return item.itemData.distance.toString();
  };

  const onSubmit: SubmitHandler<DrivingJournalFormValues> = ({
    date,
    startOdometer,
    endOdometer,
    notes,
  }) => {
    if (onDone) {
      onDone({
        ...item,
        date: new Date(date),
        itemData: {
          startOdometer: startOdometer.trim(),
          endOdometer: endOdometer.trim(),
          distance: parseFloat(calculateDistance()) || 0,
          notes: notes.trim() || undefined,
        },
      });
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="text-xl text-neutral-700 p-2">{mode} Entry</div>

        {/* Row 1: Date — half width on sm+, full width on mobile */}
        <div className="w-full sm:w-1/2 mb-4">
          <Label htmlFor="date" className="text-neutral-700 py-2">
            Date
          </Label>
          <Input
            id="date"
            type="date"
            className="text-neutral-700 pt-2"
            defaultValue={formData.date}
            {...register("date", {
              required: "Date is required",
            })}
          />
          {errors.date && (
            <div className="text-red-700 text-sm italic pt-1 mb-2 text-left">
              {errors.date.message}
            </div>
          )}
        </div>

        {/* Row 2: Start / End odometer — stacked on mobile, side by side on sm+ */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
          <div className="flex-1">
            <Label htmlFor="startOdometer" className="text-neutral-700 py-2">
              Start Odometer
            </Label>
            <Input
              id="startOdometer"
              type="number"
              step="1"
              className="text-neutral-700 pt-2 text-right"
              {...register("startOdometer", {
                required: "Required",
              })}
              placeholder="Start"
            />
            {errors.startOdometer && (
              <div className="text-red-700 text-sm italic pt-1 text-left">
                {errors.startOdometer.message}
              </div>
            )}
          </div>
          <div className="flex-1">
            <Label htmlFor="endOdometer" className="text-neutral-700 py-2">
              End Odometer
            </Label>
            <Input
              id="endOdometer"
              type="number"
              step="1"
              className="text-neutral-700 pt-2 text-right"
              {...register("endOdometer", {
                required: "Required",
              })}
              placeholder="End"
            />
            {errors.endOdometer && (
              <div className="text-red-700 text-sm italic pt-1 text-left">
                {errors.endOdometer.message}
              </div>
            )}
          </div>
        </div>

        {/* Row 3: Distance (full width) */}
        <div className="w-full mb-4">
          <Label htmlFor="distance" className="text-neutral-700 py-2">
            Distance
          </Label>
          <Input
            id="distance"
            type="number"
            step="1"
            className="text-neutral-700 pt-2 bg-neutral-100 text-right"
            value={calculateDistance()}
            onChange={() => {}}
            placeholder="Distance"
            readOnly
          />
        </div>

        {/* Row 4: Notes (full width, multiline) */}
        <div className="w-full mb-6">
          <Label htmlFor="notes" className="text-neutral-700 py-2">
            Notes (Optional)
          </Label>
          <textarea
            id="notes"
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-neutral-700 shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            defaultValue={formData.notes}
            {...register("notes")}
            placeholder="Notes"
          />
        </div>

        <div className="w-full py-2 flex flex-row justify-between items-center">
          <Button
            className={cn(
              `text-white`,
              theme === "appBlue" ? "bg-appBlue" : "bg-appGreen",
            )}
            type="submit"
            disabled={
              errors.date !== undefined ||
              errors.startOdometer !== undefined ||
              errors.endOdometer !== undefined
            }
            variant="outline"
          >
            {mode === "Edit" ? "Update" : "Add"} Entry
          </Button>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </form>
    </div>
  );
}
