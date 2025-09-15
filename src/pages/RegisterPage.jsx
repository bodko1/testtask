import { useState } from "react";
import { auth } from "../services/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {useNavigate} from "react-router-dom";

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
    }
  }
  return (
    <form onSubmit={handleRegister}>
      <h2>Register</h2>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"/>
      <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password"/>
      <button type="submit">Sign up</button>
      <p>
        Вже є акаунт?{" "}
        <button onClick={() => navigate ("/login")}>Увійти</button>
      </p>
    </form>
  );
}
