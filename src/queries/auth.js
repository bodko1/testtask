import { useMutation } from "@tanstack/react-query";
import { loginUser } from "@/api/auth";

export function useLogin(onSuccess) {
  return useMutation({
    mutationFn: ({ email, password }) => loginUser(email, password),
    onSuccess,
  });
}
