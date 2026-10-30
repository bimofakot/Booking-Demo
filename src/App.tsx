import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import BookingSuccessPage from '@/pages/BookingSuccessPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import MyBookingsPage from '@/pages/MyBookingsPage';
import NotFoundPage from '@/pages/NotFoundPage';
import OwnerDashboardPage from '@/pages/OwnerDashboardPage';
import RegisterPage from '@/pages/RegisterPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="daftar" element={<RegisterPage />} />
              <Route path="lupa-password" element={<ForgotPasswordPage />} />
              <Route
                path="booking-saya"
                element={
                  <RequireAuth>
                    <MyBookingsPage />
                  </RequireAuth>
                }
              />
              <Route
                path="booking/sukses/:id"
                element={
                  <RequireAuth>
                    <BookingSuccessPage />
                  </RequireAuth>
                }
              />
              <Route
                path="owner"
                element={
                  <RequireAuth role="owner">
                    <OwnerDashboardPage />
                  </RequireAuth>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
