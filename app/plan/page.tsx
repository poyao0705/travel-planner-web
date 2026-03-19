export default async function PlanPage() {
  const response = await fetch(`${process.env.BACKEND_URL}/api/v1/plan`);

  const data = await response.json();
  console.log("Plan data:", data);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">Plan Page</h1>
      <p className="text-lg text-gray-600">This is the plan page content.</p>
      <p>{JSON.stringify(data)}</p>
    </div>
  );
}
