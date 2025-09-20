import { useNavigate } from "react-router";
import { GroupList } from "../components/GroupList";
import { Id } from "../../convex/_generated/dataModel";

export function GroupsPage() {
  const navigate = useNavigate();

  const handleSelectGroup = (groupId: Id<"groups">) => {
    void navigate(`/groups/${groupId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Groups</h1>
        <p className="text-muted-foreground">
          Manage your expense groups and track shared costs
        </p>
      </div>
      <GroupList onSelectGroup={handleSelectGroup} />
    </div>
  );
}