import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../services/firebase";
import {signOut} from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

const logout=async()=>{
  try{
    await signOut(auth)
    setUser(null);
  }
  catch(error){
    console.error(error.message);
  }
}

  return (
    <AuthContext.Provider value={{ user ,logout}}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
