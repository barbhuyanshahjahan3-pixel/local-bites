import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  const { token, mustChangePassword } = useAuth();

  if (!token) return <LoginPage />;
  if (mustChangePassword) return <ChangePasswordPage />;
  return <DashboardPage />;
}
