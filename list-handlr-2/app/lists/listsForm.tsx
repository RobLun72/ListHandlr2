import { ListData } from "@/DTO/listsData";
import { ListType } from "@/DTO/listTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useForm, SubmitHandler } from "react-hook-form";
import { useState } from "react";

interface ListsFormValues {
  itemName: string;
  listType?: ListType;
}

export interface ListsFormProps {
  mode: "Edit" | "Add";
  item: ListData;
  onDone?: (values: ListData) => void;
  onClose?: () => void;
}

export function ListsForm({ mode, item, onClose, onDone }: ListsFormProps) {
  const [selectedListType, setSelectedListType] = useState<ListType>(
    item.listType || ListType.SortableList,
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ListsFormValues>();

  const { theme } = useTheme();

  const onSubmit: SubmitHandler<ListsFormValues> = ({ itemName }) => {
    if (onDone) {
      const itemNameTrimmed = itemName.trim();
      onDone({
        ...item,
        listName: itemNameTrimmed,
        listType: selectedListType,
      });
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
            List Name
          </Label>
          <Input
            id="itemName"
            type="text"
            className={cn(
              "text-neutral-700 pt-2 mb-8",
              errors.itemName && "mb-0",
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

        {mode === "Add" && (
          <div className="w-full mb-8">
            <Label htmlFor="listType" className="text-neutral-700 py-2">
              List Type
            </Label>
            <Select
              value={selectedListType}
              onValueChange={(value) => setSelectedListType(value as ListType)}
            >
              <SelectTrigger className="text-neutral-700">
                <SelectValue placeholder="Select list type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ListType.SortableList}>
                  Sortable List
                </SelectItem>
                <SelectItem value={ListType.DrivingJournal}>
                  Driving Journal
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="w-full py-2 flex flex-row justify-between items-center">
          <Button
            className={cn(
              `text-white`,
              theme === "appBlue" ? "bg-appBlue" : "bg-appGreen",
            )}
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
