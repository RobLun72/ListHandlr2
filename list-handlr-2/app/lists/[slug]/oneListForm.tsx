import { NamedListData } from "@/app/DTO/oneListData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
        <div>
          <div className="text-xl text-neutral-700 p-2">{mode + " Item"}</div>
          <Label htmlFor="itemName">Item</Label>
          <Input
            id="itemName"
            type="text"
            defaultValue={formData.itemName}
            {...register("itemName", {
              required: "Item name is required",
            })}
            placeholder="itemName"
          />
          {errors.itemName && <span>{errors.itemName.message}</span>}
        </div>
        <div>
          <Label htmlFor="itemLink">Link</Label>
          <Input
            id="itemLink"
            type="text"
            defaultValue={formData.itemLink}
            {...register("itemLink")}
            placeholder="itemLink"
          />
        </div>
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
      </form>
    </div>
  );
}
