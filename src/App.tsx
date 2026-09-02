import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import Login from "./Pages/Auth/Login.tsx";
import Signup from "./Pages/Auth/Signup.tsx";
import Dashboard from "./Pages/Customer/Dashboard.tsx";
import BrowseFreelancers from "./Pages/Customer/BrowseFreelancers.tsx";
import Profile from "./Pages/Customer/Profile.tsx";
import ProfileSetup from "./Pages/Freelancer/ProfileSetup.tsx";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/services" element={<BrowseFreelancers />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/freelancer/profile-setup" element={<ProfileSetup />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
