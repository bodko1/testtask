import { useState, useEffect } from "react";
import { db } from "../services/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export default function TripsPage() {
  const { user, logout } = useAuth();
  const [trips, setTrips] = useState([]);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();

  // Один state для редагування
  const [editingTrip, setEditingTrip] = useState({
    id: null,
    title: "",
    startDate: "",
    endDate: "",
  });



  const saveEdit = async () => {
    if (
      editingTrip.startDate &&
      editingTrip.endDate &&
      new Date(editingTrip.startDate) > new Date(editingTrip.endDate)
    ) {
      return alert("Дата початку не може бути пізнішою за дату завершення");
    }

    try {
      const tripRef = doc(db, "trips", editingTrip.id);
      await updateDoc(tripRef, {
        title: editingTrip.title,
        startDate: editingTrip.startDate
          ? new Date(editingTrip.startDate)
          : null,
        endDate: editingTrip.endDate ? new Date(editingTrip.endDate) : null,
      });

      setTrips((prev) =>
        prev.map((trip) =>
          trip.id === editingTrip.id
            ? {
              ...trip,
              title: editingTrip.title,
              startDate: editingTrip.startDate
                ? { seconds: new Date(editingTrip.startDate).getTime() / 1000 }
                : null,
              endDate: editingTrip.endDate
                ? { seconds: new Date(editingTrip.endDate).getTime() / 1000 }
                : null,
            }
            : trip
        )
      );

      setEditingTrip({ id: null, title: "", startDate: "", endDate: "" });
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // завантаження подорожей
  const fetchTrips = async () => {
    if (!user) return;

    try {
      const tripsRef = collection(db, "trips");

      const ownedSnapshot = await getDocs(
        query(tripsRef, where("ownerId", "==", user.uid))
      );
      const owned = ownedSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const allSnapshot = await getDocs(tripsRef);
      const collaborated = allSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((trip) => (trip.collaborators || []).includes(user.email));

      setTrips([...owned, ...collaborated]);

    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [user]);

  // Додаємо нову подорож
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
        createdAt: serverTimestamp(),
      });

      setTitle("");
      setStartDate("");
      setEndDate("");

      await fetchTrips(); // одразу оновлюємо
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert("Помилка при виході");
    }
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="!text-3xl !font-bold">Мої подорожі</h2>
        <Button variant="destructive" onClick={handleLogout} className="!p-3 absolute top-2 right-4 bg-red-400 hover:bg-red-500">
          Вийти
        </Button>
      </div>

      <form onSubmit={handleAddTrip} className="flex flex-col gap-2 mb-4">
        <Input value={title}
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
        <Button type="submit" className="hover:bg-gray-200">Додати</Button>
      </form>

      <ul className="flex flex-col gap-4 !p-5">
        {trips.map((trip) => {
          // const isOwner = trip.ownerId === user.uid;
          return (
            <li key={trip.id} className="!border rounded !p-2 w-100">
              {editingTrip.id === trip.id ? (
                <div className="flex flex-col gap-2">
                  <input
                    value={editingTrip.title}
                    onChange={(e) =>
                      setEditingTrip((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="border p-1 rounded"
                  />
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={editingTrip.startDate}
                      onChange={(e) =>
                        setEditingTrip((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                      className="border p-1 rounded flex-1"
                    />
                    <input
                      type="date"
                      value={editingTrip.endDate}
                      onChange={(e) =>
                        setEditingTrip((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                      className="border p-1 rounded flex-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={saveEdit}>Зберегти</Button>
                    <Button
                      variant="destructive"
                      onClick={() =>
                        setEditingTrip({
                          id: null,
                          title: "",
                          startDate: "",
                          endDate: "",
                        })
                      }
                    >
                      Скасувати
                    </Button>
                  </div>
                </div>
              ) : (
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
                      className="text-blue-400 hover:text-blue-600 "
                    >
                      Open
                    </Link>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
