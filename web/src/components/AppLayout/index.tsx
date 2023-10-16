import { useAuth0 } from "@auth0/auth0-react";
import { IconContext } from "react-icons";
import { MdAdd, MdBarChart, MdCategory, MdHistory, MdHome, MdSettings } from "react-icons/md";
import LinkButton from "./components/LinkButton";
import CreateTransactionModal from "./components/CreateTransactionModal";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }: AppLayoutProps) => {
  const { logout } = useAuth0();

  return (
    <div className="w-full">
      <div className="w-full px-5 py-3">{children}</div>
      {/* for mobile/tablet */}
      <div className="btm-nav">
        <LinkButton to={"/dashboard"}>
          <IconContext.Provider value={{ size: "25" }}>
            <MdHome />
          </IconContext.Provider>
        </LinkButton>
        <LinkButton to={"/statistics"}>
          <IconContext.Provider value={{ size: "25" }}>
            <MdBarChart />
          </IconContext.Provider>
        </LinkButton>
        <div
          onClick={() => {
            if (document) {
              (document.getElementById("create_transaction_modal") as HTMLFormElement).showModal();
            }
          }}
        >
          <IconContext.Provider value={{ size: "25" }}>
            <MdAdd />
          </IconContext.Provider>
          <CreateTransactionModal />
        </div>
        <LinkButton to={"/history"}>
          <IconContext.Provider value={{ size: "25" }}>
            <MdHistory />
          </IconContext.Provider>
        </LinkButton>
        <LinkButton to={"/settings"}>
          <IconContext.Provider value={{ size: "25" }}>
            <MdSettings />
          </IconContext.Provider>
        </LinkButton>
      </div>
    </div>
  );
};

export default AppLayout;
