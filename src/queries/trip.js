import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {doc, getDoc, updateDoc, arrayUnion, getDocs, } from "firebase/firestore";
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

      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      if (start && end && start > end) throw new Error("Дата початку не може бути пізнішою за дату завершення");

      const docRef = await addDoc(collection(db, "trips"), {
        title,
        ownerId,
        collaborators: [],
        startDate: start,
        endDate: end,
        createdAt: serverTimestamp(),
      });

      return { id: docRef.id, title, startDate: start, endDate: end, ownerId, collaborators: [] };
    },
    onSuccess: (newTrip) => {
      queryClient.setQueryData(["trips", newTrip.ownerId], old => [...(old || []), newTrip]);
    },
  });
};


export const useTrips = (user) => {
  return useQuery({
    queryKey: ["trips", user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const snapshot = await getDocs(collection(db, "trips"));
      return snapshot.docs
        .map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            startDate: data.startDate?.toDate?.(),
            endDate: data.endDate?.toDate?.(),
          };
        })
        .filter(trip =>
          trip.ownerId === user.uid ||
          (trip.collaborators || []).includes(user.email)
        );
    },
  });
};