import { useAuth0 } from "@auth0/auth0-react";
import { Navigate } from "react-router-dom";
import AppLayout from "../../components/AppLayout";

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth0();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace={true} />;
  }

  return (
    <AppLayout>
      <div className="w-full h-full flex flex-col items-center justify-center">
        <h1 className="scroll-m-20 text-9xl font-extrabold tracking-tight lg:text-9xl">Dimewise</h1>
        <p>Start taking control of your budget in a systematic manner</p>
      </div>
    </AppLayout>
  );
};

export default HomePage;
