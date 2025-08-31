import AllPostsDisplay from "../../components/all-posts-display";

export default function AllPostsPage() {
  // For now, we'll pass undefined as currentUserId
  // In a real app, you'd get this from your auth context
  const currentUserId = undefined; // TODO: Get from auth context

  return (
    <div className="min-h-screen bg-gray-50">
      <AllPostsDisplay currentUserId={currentUserId} />
    </div>
  );
}
