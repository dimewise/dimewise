import { useAuth0 } from "@auth0/auth0-react";
import { Navigate } from "react-router-dom";
import AppLayout from "../../common/AppLayout";
import { Button } from "@/components/ui/button";
import { useGetCategories } from "../../generated/api/dimewise";

const History: React.FC = () => {
  const { isAuthenticated } = useAuth0();
  const { data } = useGetCategories()
  if (!isAuthenticated) {
    return <Navigate to="/" replace={true} />;
  }

  console.log(data);


  return (
    <AppLayout>
      <div className="w-full flex flex-col gap-5 justify-center items-center">
        history
      </div>
      <Button>Test</Button>
    </AppLayout>
  );
};

export default History;
