import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useEffect, useState } from "react";
import { db } from "../services/firebase.js";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Button } from "../components/ui/button.jsx";

export default function TripDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [trip, setTrip] = useState(null);
  const [editingTrip, setEditingTrip] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const tripDoc = await getDoc(doc(db, "trips", id));
        if (tripDoc.exists()) {
          setTrip({ id: tripDoc.id, ...tripDoc.data() });
        }
      } catch (err) {
        console.error("Помилка при завантаженні подорожі:", err);
      }
    };
    fetchTrip();
  }, [id]);

  if (!trip) return <p>Подорож не знайдена</p>;

  const isOwner = trip.ownerId === user.uid;

  // Допоміжна функція для конвертації дати у формат YYYY-MM-DD для інпуту
  const formatForInput = (date) => {
    if (!date) return "";
    if (date.toDate) date = date.toDate(); // якщо Firebase Timestamp
    return new Date(date).toISOString().slice(0, 10);
  };

  // Допоміжна функція для відображення дати
  const formatForDisplay = (date) => {
    if (!date) return "";
    if (date.toDate) date = date.toDate(); // якщо Firebase Timestamp
    return new Date(date).toLocaleDateString();
  };

  const startEdit = (trip) => {
    setEditingTrip({
      id: trip.id,
      title: trip.title,
      startDate: formatForInput(trip.startDate),
      endDate: formatForInput(trip.endDate),
    });
  };

  const saveEdit = async () => {
    if (
      editingTrip.startDate &&
      editingTrip.endDate &&
      new Date(editingTrip.startDate) > new Date(editingTrip.endDate)
    ) {
      return alert("Дата виїзду не може бути пізнішою за дату приїзду");
    }

    try {
      await updateDoc(doc(db, "trips", editingTrip.id), {
        title: editingTrip.title,
        startDate: editingTrip.startDate ? new Date(editingTrip.startDate) : null,
        endDate: editingTrip.endDate ? new Date(editingTrip.endDate) : null,
      });

      setTrip({
        ...trip,
        title: editingTrip.title,
        startDate: editingTrip.startDate ? new Date(editingTrip.startDate) : null,
        endDate: editingTrip.endDate ? new Date(editingTrip.endDate) : null,
      });

      setEditingTrip(null);
      alert("Збережено!");
    } catch (err) {
      console.error(err);
      alert("Помилка при збереженні");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h2>Деталі подорожі</h2>

      {editingTrip ? (
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={editingTrip.title}
            onChange={(e) => setEditingTrip({ ...editingTrip, title: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="date"
            value={editingTrip.startDate}
            onChange={(e) => setEditingTrip({ ...editingTrip, startDate: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="date"
            value={editingTrip.endDate}
            onChange={(e) => setEditingTrip({ ...editingTrip, endDate: e.target.value })}
            className="border p-2 rounded"
          />
          <Button onClick={saveEdit}>Зберегти</Button>
          <Button variant="ghost" onClick={() => setEditingTrip(null)}>
            Скасувати
          </Button>
        </div>
      ) : (
        <div>
          <p><strong>Назва:</strong> {trip.title}</p>
          <p><strong>Дата виїзду:</strong> {formatForDisplay(trip.startDate)}</p>
          <p><strong>Дата приїзду:</strong> {formatForDisplay(trip.endDate)}</p>
          <p><strong>Власник:</strong> {trip.ownerId}</p>

          {isOwner && (
            <Button
              onClick={() => startEdit(trip)}
              className="!p-3 hover:bg-gray-200 !mr-2 !ml-2"

            >Редагувати</Button>
          )}

          {isOwner && (
            <Link to={`/trips/${id}/access`}>
              <Button
                variant="outline"
                className="!p-3 hover:bg-gray-200 !mr-2"

              >Доступи</Button>
            </Link>
          )}

          <Button
            variant="outline"
            onClick={() => navigate("/trips")}
            className="!p-3 hover:bg-gray-200"
          >
            Назад
          </Button>
        </div>
      )}
    </div>
  );
}
