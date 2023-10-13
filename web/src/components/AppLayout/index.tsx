import { useAuth0 } from "@auth0/auth0-react";
import { IconContext } from "react-icons";
import { BiLogOut, BiSolidHome } from "react-icons/bi";
import { MdCategory, MdHistory } from "react-icons/md";
import LinkButton from "./components/LinkButton";

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
            <BiSolidHome />
          </IconContext.Provider>
        </LinkButton>
        <LinkButton to={"/categories"}>
          <IconContext.Provider value={{ size: "25" }}>
            <MdCategory />
          </IconContext.Provider>
        </LinkButton>
        <LinkButton to={"/history"}>
          <IconContext.Provider value={{ size: "25" }}>
            <MdHistory />
          </IconContext.Provider>
        </LinkButton>
      </div>
    </div>
  );
};

export default AppLayout;
