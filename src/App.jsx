import {AuthProvider, useAuth} from "./context/AuthContext.jsx";
import {BrowserRouter, Navigate, Route, Router, Routes} from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import TripsPage from "./pages/TripsPage.jsx";
import TripAccessPage from "./pages/TripAccessPage.jsx";
import TripDetailsPage from "@/pages/TripDetailsPage.jsx";

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
          <Route path="/trips/:id" element={
            <PrivateRoute>
              <TripDetailsPage/>
            </PrivateRoute>
          }></Route>

          <Route path="/trips/:id/access" element={
            <PrivateRoute>
              <TripAccessPage />
            </PrivateRoute>
          }/>


          <Route path="*" element={<Navigate to="/trips"/>}/>


        </Routes>
      </BrowserRouter>

    </AuthProvider>
  )
}

export default App
