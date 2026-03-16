import { AuthProvider, ToastProvider } from './context';
import { AppRoutes } from './routes';
import './App.css';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
