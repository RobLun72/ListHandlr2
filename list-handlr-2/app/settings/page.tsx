"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Page() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  return (
    <div>
      <div className="px-1 py-8 text-xl w-full text-center">Settings</div>
      <div className="flex justify-center">
        <div className="px-1 py-2 border border-neutral-300 rounded-sm w-3/6">
          <RadioGroup defaultValue="option-one">
            <div className="flex items-center space-x-2 pl-4">
              <RadioGroupItem
                value="appBlue"
                id="option-one"
                className="cursor-pointer"
                checked={theme === "appBlue"}
                onClick={() => setTheme("appBlue")}
              />
              <Label
                className={`text-appBlue text-lg cursor-pointer`}
                htmlFor="option-one"
              >
                Use the blue theme
              </Label>
            </div>
            <div className="flex items-center space-x-2 pl-4">
              <RadioGroupItem
                value="appGreen"
                id="option-two"
                className="cursor-pointer"
                checked={theme === "appGreen"}
                onClick={() => setTheme("appGreen")}
              />
              <Label
                className={`text-appGreen text-lg cursor-pointer`}
                htmlFor="option-two"
              >
                Use the green theme
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <div className="w-3/6">
          <Button
            onClick={() => router.push("/collab-groups")}
            className={`bg-${theme} hover:bg-${theme}/90 text-white w-full`}
          >
            Manage Collaboration Groups
          </Button>
        </div>
      </div>
    </div>
  );
}
