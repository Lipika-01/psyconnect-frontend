import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudentDashboard from "./pages/StudentDashboard";
import MentorDashboard from "./pages/MentorDashboard";
import PsychologistDashboard from "./pages/PsychologistDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/student/:id" element={<StudentDashboard />} />
        <Route path="/mentor/:id" element={<MentorDashboard />} />
        <Route path="/psychologist/:id" element={<PsychologistDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;