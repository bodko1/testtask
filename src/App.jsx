import {AuthProvider, useAuth} from "./context/AuthContext.jsx";
import {BrowserRouter, Navigate, Route, Router, Routes} from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import TripsPage from "./pages/TripsPage.jsx";
function PrivateRoute({children}) {
  const {user} = useAuth();
  return user ? children : <Navigate to="/login"/>
}


function App() {


  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/register" element={<RegisterPage/>}/>
            <Route path="/trips" element={
              <PrivateRoute>
                <TripsPage/>
                </PrivateRoute>
                 }
                />
                <Route path="*" element={<Navigate to="/trips" />} />


        </Routes>
      </BrowserRouter>


            </AuthProvider>
            )
          }

            export default App
