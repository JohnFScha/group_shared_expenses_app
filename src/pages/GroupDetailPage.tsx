import { useParams, useNavigate } from "react-router";
import { GroupView } from "../components/GroupView";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "../components/ui/button";
import { ArrowLeft } from "lucide-react";

export function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();

  if (!groupId) {
    return <div>Group not found</div>;
  }

  const handleBack = () => {
    void navigate("/groups");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Groups
        </Button>
      </div>
      <GroupView groupId={groupId as Id<"groups">} onBack={handleBack} />
    </div>
  );
}