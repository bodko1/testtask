import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {doc, getDoc, updateDoc,arrayUnion} from "firebase/firestore";
import {db} from "@/services/firebase.js";

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

