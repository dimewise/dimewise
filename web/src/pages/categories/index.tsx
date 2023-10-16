import { useAuth0 } from "@auth0/auth0-react";
import { Navigate } from "react-router-dom";
import AppLayout from "../../components/AppLayout";

const Categories: React.FC = () => {
  const { isAuthenticated } = useAuth0();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace={true} />;
  }

  return (
    <AppLayout>
      <div className="w-full h-screen flex flex-col justify-center items-center font-go">
        Categories
      </div>
    </AppLayout>
  );
};

export default Categories;
