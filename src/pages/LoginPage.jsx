import { useState } from "react";
import { auth } from "../services/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import {useNavigate} from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    try {
      if (!email || !password) return alert("Заповніть email і пароль");
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/trips");
    } catch (error) {
      console.error(error.message);
      alert(error.message); // показуємо помилку, якщо щось пішло не так
    }
  }


  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"/>
      <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password"/>
      <button type="submit">Login</button>
      <p>
        Немає акаунту?{" "}
        <button onClick={() => navigate("/register")}>Зареєструватися</button>
      </p>
    </form>
  );
}
