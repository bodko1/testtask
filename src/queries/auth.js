import {useMutation, useQueryClient} from "@tanstack/react-query";
import { loginUser } from "@/api/auth";
import {useNavigate} from "react-router-dom";
import {signOut} from "firebase/auth";
import { auth } from "../services/firebase";



export function useLogin(onSuccess) {
  return useMutation({
    mutationFn: ({ email, password }) => loginUser(email, password),
    onSuccess,
  });
}
export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      await signOut(auth);
    },
    onSuccess: () => {
      queryClient.clear();
      navigate("/login");
    },
    onError: (err) => {
      alert(err?.message || "Помилка при виході");
    },
  });
};