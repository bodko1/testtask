import { useState, useEffect } from "react";
import { db } from "../services/firebase";
import { collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";


export default function TripsPage() {
  const { user, logout } = useAuth(); // беремо logout
  const [trips, setTrips] = useState([]);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();


  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert("Помилка при виході");
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchTrips = async () => {
      try {
        const tripsRef = collection(db, "trips");
        const q = query(tripsRef, where("ownerId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        setTrips(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error(error);
        alert(error.message);
      }
    };

    fetchTrips();
  }, [user]);

  const handleAddTrip = async (e) => {
    e.preventDefault();
    if (!title) return alert("Вкажіть назву подорожі");

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return alert("Дата початку не може бути пізнішою за дату завершення");
    }

    try {
      await addDoc(collection(db, "trips"), {
        title,
        ownerId: user.uid,
        collaborators: [],
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        createdAt: serverTimestamp()
      });

      setTitle("");
      setStartDate("");
      setEndDate("");

      const tripsRef = collection(db, "trips");
      const q = query(tripsRef, where("ownerId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      setTrips(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Мої подорожі</h2>
        <Button
          onClick={handleLogout}
          variant="destructive"        >
          Вийти
        </Button>
      </div>

      <form onSubmit={handleAddTrip} className="flex flex-col gap-2 mb-4">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Нова подорож"
          className="border p-2 rounded"
        />
        <div className="flex gap-2">
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="border p-2 rounded flex-1"
          />
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="border p-2 rounded flex-1"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Додати
        </button>
      </form>

      <ul>
        {trips.map(trip => (
          <li key={trip.id} className="border-b py-2">
            <div className="font-medium">{trip.title}</div>
            {(trip.startDate || trip.endDate) && (
              <div className="text-sm text-gray-500">
                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
