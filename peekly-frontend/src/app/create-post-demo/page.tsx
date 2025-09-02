import CreatePostDemo from "../../components/create-post-demo";

export default function CreatePostDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Post Demo
          </h1>
          <p className="text-gray-600">
            Test the complete post creation flow with file upload, description,
            and pricing
          </p>
        </div>

        <CreatePostDemo />
      </div>
    </div>
  );
}
