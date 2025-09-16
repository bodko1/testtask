import { useState, useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { db } from "../services/firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import {Input} from "@/components/ui/input.js";

export default function TripAccessPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchTrip = async () => {
      try {
        const tripRef = doc(db, "trips", id);
        const tripDoc = await getDoc(tripRef);
        if (tripDoc.exists()) {
          setTrip({ id: tripDoc.id, ...tripDoc.data() });
        }
      } catch (error) {
        console.error("Помилка при отриманні подорожі:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id, user]);

  if (!user) return <Navigate to="/login" replace />;
  if (loading) return <div>Завантаження...</div>;
  if (!trip) return <div>Подорож не знайдена</div>;

  // права доступу
  const isOwner = trip.ownerId === user.uid;
  const hasAccess = isOwner || (trip.collaborators || []).includes(user.email);

  if (!hasAccess) {
    return <Navigate to="/trips" replace />;
  }

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return alert("Вкажіть email");

    try {
      const tripRef = doc(db, "trips", id);
      await updateDoc(tripRef, {
        collaborators: arrayUnion(email.trim())
      });

      setTrip((prev) => ({
        ...prev,
        collaborators: [...(prev.collaborators || []), email.trim()]
      }));
      setEmail("");
    } catch (error) {
      console.error("Помилка при додаванні доступу:", error);
      alert(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h2 className="text-2xl font-bold mb-4">
        {trip.title} — доступ
      </h2>

      <Button variant="outline" className="!p-3 hover:bg-gray-200 " onClick={() => navigate(`/trips/${id}`)}>
        Назад
      </Button>

      {isOwner && (
        <form onSubmit={handleInvite} className="flex gap-2 my-4">
          <Input
                value={email}
                 type="email"
                placeholder="Email для інвайту"
                 onChange={(e) => setEmail(e.target.value)}
                 className="!p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"

          />

          <Button
            type="submit"
            className="!p-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Додати
          </Button>
        </form>
      )}

      <h3 className="font-semibold mb-2">Користувачі з доступом:</h3>
      <ul>
        {(trip.collaborators || []).map((c, idx) => (
          <li key={idx} className="border-b py-1">{c}</li>
        ))}
      </ul>
    </div>
  );
}
