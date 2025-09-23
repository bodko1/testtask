import {createUserWithEmailAndPassword, signInWithEmailAndPassword} from "firebase/auth";
import { auth } from "@/services/firebase";
import {useMutation} from "@tanstack/react-query";

export async function loginUser(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}

export const useRegister = () =>
  useMutation({
    mutationFn: ({ email, password }) =>
      createUserWithEmailAndPassword(auth, email, password),
  });