import { useAuth0 } from "@auth0/auth0-react";
import { Navigate } from "react-router-dom";
import AppLayout from "../../common/AppLayout";

const History: React.FC = () => {
  const { isAuthenticated } = useAuth0();
  if (!isAuthenticated) {
    return <Navigate to="/" replace={true} />;
  }

  return (
    <AppLayout>
      <div className="w-full flex flex-col gap-5 justify-center items-center">
        history

      </div>
    </AppLayout>
  );
};

export default History;
