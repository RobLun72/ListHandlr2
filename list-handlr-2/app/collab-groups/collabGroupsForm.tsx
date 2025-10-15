import { CollabGroupData } from "@/DTO/collabGroupsData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useForm, SubmitHandler } from "react-hook-form";

interface CollabGroupsFormValues {
  groupName: string;
  description: string;
}

export interface CollabGroupsFormProps {
  mode: "Edit" | "Add";
  item: CollabGroupData;
  onDone?: (values: CollabGroupData) => void;
  onClose?: () => void;
}

export function CollabGroupsForm({
  mode,
  item,
  onClose,
  onDone,
}: CollabGroupsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CollabGroupsFormValues>();

  const { theme } = useTheme();

  const onSubmit: SubmitHandler<CollabGroupsFormValues> = ({
    groupName,
    description,
  }) => {
    if (onDone) {
      onDone({ ...item, name: groupName, description: description || null });
    }
  };

  const formData: CollabGroupsFormValues = {
    groupName: item.name || "",
    description: item.description || "",
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="w-full">
          <div className="text-xl text-neutral-700 p-2">
            {mode + " Collaboration Group"}
          </div>
          <Label htmlFor="groupName" className="text-neutral-700 py-2">
            Group Name
          </Label>
          <Input
            id="groupName"
            type="text"
            className={cn(
              "text-neutral-700 pt-2 mb-4",
              errors.groupName && "mb-0"
            )}
            defaultValue={formData.groupName}
            {...register("groupName", {
              required: "Group name is required",
            })}
            placeholder="Group name"
          />
          {errors.groupName && (
            <div className="text-red-700 text-sm italic pt-1 mb-2 text-left">
              {errors.groupName.message}
            </div>
          )}

          <Label htmlFor="description" className="text-neutral-700 py-2">
            Description (optional)
          </Label>
          <Input
            id="description"
            type="text"
            className="text-neutral-700 pt-2 mb-8"
            defaultValue={formData.description}
            {...register("description")}
            placeholder="Group description"
          />
        </div>
        <div className="w-full py-2 flex flex-row justify-between items-center">
          <Button
            className={cn(
              `text-white`,
              theme === "appBlue" ? "bg-appBlue" : "bg-appGreen"
            )}
            type="submit"
            disabled={errors.groupName !== undefined}
            variant="outline"
          >
            {mode === "Edit" ? "Update" : "Create"} Group
          </Button>
          <Button onClick={onClose} variant="outline">
            close
          </Button>
        </div>
      </form>
    </div>
  );
}
