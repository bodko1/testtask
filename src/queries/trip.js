import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {doc, getDoc, updateDoc, arrayUnion, getDocs, query, where} from "firebase/firestore";
import { db } from "../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const useTrip = (tripId) =>
  useQuery({
    queryKey: ["trip", tripId],
    queryFn: async () => {
      const tripRef = doc(db, "trips", tripId);
      const snapshot = await getDoc(tripRef);
      if (!snapshot.exists()) throw new Error("Подорож не знайдена");
      return { id: snapshot.id, ...snapshot.data() };
    },
    enabled: !!tripId,
  });

export const useInviteCollaborator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tripId, email }) => {
      const tripRef = doc(db, "trips", tripId);
      await updateDoc(tripRef, {
        collaborators: arrayUnion(email),
      });
      return { tripId, email };
    },
    onSuccess: ({ tripId, email }) => {
      queryClient.setQueryData(["trip", tripId], (oldTrip) => ({
        ...oldTrip,
        collaborators: [...(oldTrip?.collaborators || []), email],
      }));
    },
  });
};
export const useUpdateTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (editingTrip) => {
      if (
        editingTrip.startDate &&
        editingTrip.endDate &&
        new Date(editingTrip.startDate) > new Date(editingTrip.endDate)
      ) {
        throw new Error("Дата виїзду не може бути пізнішою за дату приїзду");
      }

      const tripRef = doc(db, "trips", editingTrip.id);
      await updateDoc(tripRef, {
        title: editingTrip.title,
        startDate: editingTrip.startDate ? new Date(editingTrip.startDate) : null,
        endDate: editingTrip.endDate ? new Date(editingTrip.endDate) : null,
      });

      return editingTrip;
    },
    onSuccess: (updatedTrip) => {
      queryClient.setQueryData(["trip", updatedTrip.id], (oldTrip) => ({
        ...oldTrip,
        ...updatedTrip,
        startDate: updatedTrip.startDate ? new Date(updatedTrip.startDate) : null,
        endDate: updatedTrip.endDate ? new Date(updatedTrip.endDate) : null,
      }));
      alert("Збережено!");
    },
    onError: (err) => {
      console.error(err);
      alert(err?.message || "Помилка при збереженні");
    },
  });
};

export const useAddTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, startDate, endDate, ownerId }) => {
      if (!title) throw new Error("Вкажіть назву подорожі");
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        throw new Error("Дата початку не може бути пізнішою за дату завершення");
      }

      const docRef = await addDoc(collection(db, "trips"), {
        title,
        ownerId,
        collaborators: [],
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        createdAt: serverTimestamp(),
      });

      return { id: docRef.id, title, startDate, endDate, ownerId, collaborators: [] };
    },
    onSuccess: (newTrip) => {
      queryClient.setQueryData(["trips"], (oldTrips = []) => [...oldTrips, newTrip]);
    },
    onError: (err) => alert(err?.message || "Помилка при додаванні подорожі"),
  });
};

export const useUpdateTrips = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (editingTrip) => {
      if (
        editingTrip.startDate &&
        editingTrip.endDate &&
        new Date(editingTrip.startDate) > new Date(editingTrip.endDate)
      ) {
        throw new Error("Дата початку не може бути пізнішою за дату завершення");
      }

      const tripRef = doc(db, "trips", editingTrip.id);
      await updateDoc(tripRef, {
        title: editingTrip.title,
        startDate: editingTrip.startDate
          ? new Date(editingTrip.startDate)
          : null,
        endDate: editingTrip.endDate ? new Date(editingTrip.endDate) : null,
      });

      return editingTrip;
    },
    onSuccess: (updatedTrip) => {
      queryClient.setQueryData(["trips"], (oldTrips) =>
        oldTrips?.map((trip) =>
          trip.id === updatedTrip.id
            ? {
              ...trip,
              title: updatedTrip.title,
              startDate: updatedTrip.startDate
                ? { seconds: new Date(updatedTrip.startDate).getTime() / 1000 }
                : null,
              endDate: updatedTrip.endDate
                ? { seconds: new Date(updatedTrip.endDate).getTime() / 1000 }
                : null,
            }
            : trip
        )
      );
    },
    onError: (err) => {
      alert(err?.message || "Помилка при оновленні подорожі");
    },
  });
};

export const useTrips = (user) => {
  return useQuery({
    queryKey: ["trips", user?.uid],
    queryFn: async () => {
      if (!user) return [];

      const tripsRef = collection(db, "trips");

      // Подорожі власника
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

      return [...owned, ...collaborated];
    },
    enabled: !!user, // запит виконується тільки якщо користувач є
    staleTime: 1000 * 60, // кеш на 1 хвилину
  });
};
