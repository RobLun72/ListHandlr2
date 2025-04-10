import { ListData } from "@/DTO/listsData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useForm, SubmitHandler } from "react-hook-form";

interface ListsFormValues {
  itemName: string;
}

export interface ListsFormProps {
  mode: "Edit" | "Add";
  item: ListData;
  onDone?: (values: ListData) => void;
  onClose?: () => void;
}

export function ListsForm({ mode, item, onClose, onDone }: ListsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ListsFormValues>();

  const onSubmit: SubmitHandler<ListsFormValues> = ({ itemName }) => {
    if (onDone) {
      onDone({ ...item, listName: itemName });
    }
  };

  const formData: ListsFormValues = {
    itemName: item.listName || "",
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="w-full">
          <div className="text-xl text-neutral-700 p-2">{mode + " List"}</div>
          <Label htmlFor="itemName" className="text-neutral-700 py-2">
            List
          </Label>
          <Input
            id="itemName"
            type="text"
            className={cn(
              "text-neutral-700 pt-2 mb-8",
              errors.itemName && "mb-0"
            )}
            defaultValue={formData.itemName}
            {...register("itemName", {
              required: "List name is required",
            })}
            placeholder="List name"
          />
          {errors.itemName && (
            <div className="text-red-700 text-sm italic pt-1 mb-2 text-left">
              {errors.itemName.message}
            </div>
          )}
        </div>
        <div className="w-full py-2 flex flex-row justify-between items-center">
          <Button
            className="bg-appBlue text-white"
            type="submit"
            disabled={errors.itemName !== undefined}
            variant="outline"
          >
            {mode === "Edit" ? "Update" : "Create"} Item
          </Button>
          <Button onClick={onClose} variant="outline">
            close
          </Button>
        </div>
      </form>
    </div>
  );
}
