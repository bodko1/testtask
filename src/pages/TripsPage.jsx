import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

export default function TripsPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "trips"), where("ownerId", "==", user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      setTrips(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [user]);

  const createTrip = async () => {
    if (!title) return;
    await addDoc(collection(db, "trips"), {
      title,
      ownerId: user.uid,
      createdAt: serverTimestamp(),
    });
    setTitle("");
  };

  return (
    <div>
      <h2>Мої подорожі</h2>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Назва подорожі"
      />
      <button onClick={createTrip}>Додати подорож</button>

      <ul>
        {trips.map(trip => (
          <li key={trip.id}>{trip.title}</li>
        ))}
      </ul>
    </div>
  );
}
