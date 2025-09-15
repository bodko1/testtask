import { useState } from "react";
import { auth } from "../services/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {useNavigate} from "react-router-dom";
import {Label} from "@/components/ui/label.js";
import {Input} from "@/components/ui/input.js";
import {Button} from "@/components/ui/button.js";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate=useNavigate();



  async function handleRegister(e) {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/trips");
    } catch (error) {
      console.error(error.message);
      alert(error.message);
    }
  }
  return (
    <form onSubmit={handleRegister} className="flex flex-col items-center justify-center h-screen gap-4">
      <h2 className="!text-3xl">Register</h2>
      <div className="">
        <Label htmlFor="email">Email</Label>
        <Input
          value={email}
          type="email"
          id="email"
          placeholder="Email"
          onChange={e => setEmail(e.target.value)}
          className="!p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 "

        />
      </div>
      <div className="">
        <Label htmlFor="password">Password</Label>
        <Input value={password}
               type="password"
               id="password"
               placeholder="Password"
               onChange={e => setPassword(e.target.value)}
               className="!p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"

        />
      </div>

      <Button className="!p-3   hover:bg-gray-200">
        Sign up
      </Button>
      <p>
        Вже є акаунт?{" "}
        <Button type="button" onClick={() => navigate("/login")} variant="link" className="text-blue-600">Увійти</Button>
      </p>
    </form>
  );
}
