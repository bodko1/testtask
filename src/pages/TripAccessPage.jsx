import { useState } from "react";
import {useNavigate, useParams} from "react-router-dom";
import { Button } from "../components/ui/button.tsx";
import { Input } from "../components/ui/input.tsx";
import { useTrip, useInviteCollaborator } from "../queries/trip.js";

export default function TripAccessPage() {
  const { id } = useParams();
  const [email, setEmail] = useState("");
  const navigate=useNavigate();
  const { data: trip, isLoading, isError } = useTrip(id);

  const inviteMutation = useInviteCollaborator();

  const handleInvite = (e) => {
    e.preventDefault();
    if (!email.trim()) return alert("Вкажіть email");

    inviteMutation.mutate(
      { tripId: id, email: email.trim() },
      {
        onSuccess: () => setEmail(""),
        onError: (err) => alert(err?.message || "Помилка при додаванні колаборатора"),
      }
    );
  };

  if (isLoading)
    return <div className="flex justify-center items-center h-screen">Завантаження...</div>;
  if (isError || !trip)
    return <div className="flex justify-center items-center h-screen">Помилка при завантаженні подорожі</div>;

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800">{trip.title}</h2>

      <form onSubmit={handleInvite} className="flex gap-2 mt-2">
        <Input
          type="email"
          placeholder="Email колаборатора"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 p-3 border rounded-lg focus:ring focus:ring-blue-200 focus:border-blue-400"
        />
        <Button
          type="submit"
          disabled={inviteMutation.isLoading}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
        >
          {inviteMutation.isLoading ? "Додаю..." : "Додати"}
        </Button>
      </form>

      <h3 className="text-xl font-semibold mt-4 text-gray-700">Колаборатори:</h3>
      <ul className="list-disc pl-5 text-gray-600">
        {trip.collaborators?.map((collab) => (
          <li key={collab}>{collab}</li>
        ))}
      </ul>
      <Button variant="ghost" onClick={()=> navigate(`/trips/${id}`)}> Назад</Button>
    </div>
  );
}
