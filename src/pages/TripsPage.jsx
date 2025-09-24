import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";
import { useTrips, useAddTrip } from "@/queries/trip.js";
import { useLogout } from "@/queries/auth.js";

export default function TripsPage() {
  const { user } = useAuth();
  const logoutMutation = useLogout();
  const addTripMutation = useAddTrip();
  const { data: trips = [], isLoading } = useTrips(user);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");


  const handleAddTrip = (e) => {
    e.preventDefault();
    addTripMutation.mutate(
      { title, startDate, endDate, ownerId: user.uid },
      {
        onSuccess: () => {
          setTitle("");
          setStartDate("");
          setEndDate("");
        },
      }
    );
  };

  const handleLogout = () => logoutMutation.mutate();

  const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : "");

  if (isLoading) return <p>Завантаження...</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="flex justify-between items-center mb-4 w-full px-4">
        <h2 className="!text-3xl !font-bold">Мої подорожі</h2>
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="!p-3 absolute top-2 right-4 bg-red-400 hover:bg-red-500"
        >
          Вийти
        </Button>
      </div>

      <form
        onSubmit={handleAddTrip}
        className="flex flex-col gap-2 mb-4 w-full px-4 max-w-md"
      >
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          type="text"
          placeholder="Введіть назву подорожі:"
          className="!p-3 border rounded !mb-3"
        />
        <div className="flex gap-2 !mb-3">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="!border !p-2 rounded flex-1"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="!border !p-2 rounded flex-1"
          />
        </div>
        <Button type="submit" className="hover:bg-gray-200">
          Додати
        </Button>
      </form>

      <ul className="flex flex-col gap-4 !p-5 w-full max-w-md">
        {trips.map((trip) => (
          <li key={trip.id} className="!border rounded !p-2 w-full">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{trip.title}</div>
                {(trip.startDate || trip.endDate) && (
                  <div className="text-sm text-gray-500">
                    {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/trips/${trip.id}`}
                  className="text-blue-400 hover:text-blue-600"
                >
                  Open
                </Link>

              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
