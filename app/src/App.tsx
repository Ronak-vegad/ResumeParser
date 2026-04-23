import { Route, Routes } from 'react-router';
import MainLayout from '@/components/MainLayout';
import ResumeParserApp from '@/components/ResumeParserApp';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import VerifyOtpPage from '@/pages/VerifyOtpPage';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<ResumeParserApp />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
      </Route>
    </Routes>
  );
}
