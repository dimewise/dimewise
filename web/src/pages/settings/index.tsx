import { useAuth0 } from "@auth0/auth0-react";
import { Navigate } from "react-router-dom";
import AppLayout from "../../common/AppLayout";
import { Accordion } from "@/components/ui/accordion";
import AccordionCategory from "./components/AccordionCategory";
import AccordionAccount from "./components/AccordionAccount";


const Settings: React.FC = () => {
  const { isAuthenticated } = useAuth0();
  if (!isAuthenticated) {
    return <Navigate to="/" replace={true} />;
  }
  return (
    <AppLayout>
      <div className="w-full flex flex-col justify-start items-start">
        <h1 className="mt-3 mb-8 font-bold text-3xl">Settings</h1>
        <Accordion className="w-full" type="single" collapsible>
          <AccordionCategory />
          <AccordionAccount />
        </Accordion>
      </div>
    </AppLayout>
  );
};

export default Settings;
