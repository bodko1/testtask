import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useState } from "react";
import { Button } from "../components/ui/button.jsx";
import {Input} from "@/components/ui/input.js";
import {useTrip, useUpdateTrip} from "@/queries/trip.js";

export default function TripDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [editingTrip, setEditingTrip] = useState(null);
  const navigate = useNavigate();
  const updateTripMutation = useUpdateTrip();
  const { data: trip, isLoading, isError } = useTrip(id);

  if (isLoading) return <div>Завантаження...</div>;
  if (isError || !trip) return <div>Помилка при завантаженні подорожі</div>;

  if (!trip) return <p>Подорож не знайдена</p>;

  const isOwner = trip.ownerId === user.uid;

  // Допоміжна функція для конвертації дати у формат YYYY-MM-DD для інпуту
  const formatForInput = (date) => {
    if (!date) return "";
    if (date.toDate) date = date.toDate(); // якщо Firebase Timestamp
    return new Date(date).toISOString().slice(0, 10);
  };

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


  const saveEdit = () => {
    if (!editingTrip) return;
    updateTripMutation.mutate(editingTrip);
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h2>Деталі подорожі</h2>

      {editingTrip ? (
        <div className="flex flex-col gap-2">
          <Input
            type="text"
            value={editingTrip.title}
            onChange={(e) => setEditingTrip({ ...editingTrip, title: e.target.value })}
            className="!p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"

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
          <Button onClick={saveEdit} className=" hover:bg-gray-200 ">Зберегти</Button>
          <Button variant="outline" className="bg-red-400 hover:bg-red-500" onClick={() => setEditingTrip(null)}>
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
