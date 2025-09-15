import {useState} from "react";
import {auth} from "../services/firebase";
import {signInWithEmailAndPassword} from "firebase/auth";
import {useNavigate} from "react-router-dom";
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Button} from "@/components/ui/button.js";


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
    <form onSubmit={handleLogin} className="flex flex-col items-center justify-center h-screen gap-4">
      <h2 className="!text-3xl">Login</h2>
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

      <div className="flex flex-wrap items-center gap-2 md:flex-row">
        <Button className="!p-3   hover:bg-gray-200">
          Login
        </Button>
      </div>
      <p className="">
        Немає акаунту?{" "}
        <Button type="button" onClick={() => navigate("/register")} variant="link" className="text-blue-600">Зареєструватися</Button>
      </p>
    </form>
  );
}
