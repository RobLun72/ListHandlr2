import { NamedListData } from "@/DTO/oneListData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useForm, SubmitHandler } from "react-hook-form";

interface OneListFormValues {
  itemName: string;
  itemLink: string;
}

export interface OneListFormProps {
  mode: "Edit" | "Add";
  item: NamedListData;
  onDone?: (values: NamedListData) => void;
  onClose?: () => void;
}

export function OneListForm({ mode, item, onClose, onDone }: OneListFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OneListFormValues>();

  const onSubmit: SubmitHandler<OneListFormValues> = ({
    itemName,
    itemLink,
  }) => {
    if (onDone) {
      onDone({ ...item, text: itemName, link: itemLink });
    }
  };

  const formData: OneListFormValues = {
    itemName: item.text || "",
    itemLink: item.link || "",
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="w-full">
          <div className="text-xl text-neutral-700 p-2">{mode + " Item"}</div>
          <Label htmlFor="itemName" className="text-neutral-700 py-2">
            Item
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
              required: "Item name is required",
            })}
            placeholder="itemName"
          />
          {errors.itemName && (
            <div className="text-red-700 text-sm italic pt-1 mb-2 text-left">
              {errors.itemName.message}
            </div>
          )}
        </div>
        <div className="w-full">
          <Label htmlFor="itemLink" className="text-neutral-700 py-2">
            Link
          </Label>
          <Input
            id="itemLink"
            type="text"
            className="text-neutral-700 pt-2 mb-8"
            defaultValue={formData.itemLink}
            {...register("itemLink")}
            placeholder="itemLink"
          />
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
