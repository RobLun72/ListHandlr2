"use client";
import { User } from "@/DTO/userData";
import { PlusCircleIcon, MinusCircleIcon } from "@heroicons/react/24/outline";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface GroupMembersTableProps {
  availableUsers: User[];
  groupMembers: User[];
  onSelect: (user: User) => void;
  onDeselect: (user: User) => void;
}

export function GroupMembersTable({
  availableUsers,
  groupMembers,
  onSelect,
  onDeselect,
}: GroupMembersTableProps) {
  const { theme } = useTheme();

  const getUserDisplay = (user: User) => {
    return user.email || user.username || user.id || "Unknown";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Available Users */}
      <div className="w-full border border-clay rounded-sm p-5">
        <h3 className="text-lg font-semibold mb-4 text-neutral-700">
          Available Users ({availableUsers.length})
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {availableUsers.length === 0 ? (
            <div className="text-neutral-500 italic text-sm">
              No available users
            </div>
          ) : (
            availableUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-2 border border-neutral-200 rounded hover:bg-neutral-50"
              >
                <span className="text-sm text-neutral-700">
                  {getUserDisplay(user)}
                </span>
                <button
                  onClick={() => onSelect(user)}
                  className="focus:outline-none"
                  title="Add to group"
                >
                  <PlusCircleIcon
                    className={cn(
                      `h-6 w-6 cursor-pointer`,
                      theme === "appBlue" ? "text-appBlue" : "text-appGreen"
                    )}
                  />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Current Members */}
      <div className="w-full border border-clay rounded-sm p-5">
        <h3 className="text-lg font-semibold mb-4 text-neutral-700">
          Current Members ({groupMembers.length})
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {groupMembers.length === 0 ? (
            <div className="text-neutral-500 italic text-sm">
              No members in group
            </div>
          ) : (
            groupMembers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-2 border border-neutral-200 rounded hover:bg-neutral-50"
              >
                <span className="text-sm text-neutral-700">
                  {getUserDisplay(user)}
                </span>
                <button
                  onClick={() => onDeselect(user)}
                  className="focus:outline-none"
                  title="Remove from group"
                >
                  <MinusCircleIcon
                    className={cn(
                      `h-6 w-6 cursor-pointer`,
                      theme === "appBlue" ? "text-appBlue" : "text-appGreen"
                    )}
                  />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
