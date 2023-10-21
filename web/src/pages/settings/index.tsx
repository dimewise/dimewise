import { useAuth0 } from "@auth0/auth0-react";
import { Navigate } from "react-router-dom";
import AppLayout from "../../components/AppLayout";
import { IconContext } from "react-icons";
import { MdAdd, MdClose } from "react-icons/md";

const Settings: React.FC = () => {
  const { isAuthenticated } = useAuth0();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace={true} />;
  }
  // what should i put here ? 
  // i want users to be able to set categories 
  // users can log out 
  // users can see their current list of categories
  return (
    <AppLayout>
      <div className="w-full flex flex-col justify-start items-center">
        <h1 className="mt-3 mb-8 font-bold text-2xl">Settings</h1>
        <div className="w-full flex flex-row justify-between items-center mb-5">
          <h1 className="font-bold text-lg">Categories</h1>
          <button className="btn btn-primary text-sm">
            <IconContext.Provider value={{ size: "20" }}>
              <MdAdd />
            </IconContext.Provider>
            create
          </button>
        </div>
        <div className="w-full">
          <table className="table text-base">
            <tbody>
              {/* row 1 */}
              <tr>
                <th>1</th>
                <td>Category 1</td>
                <td className="flex flex-row items-center justify-end w-full">
                  <button className="btn btn-outline btn-error">
                    <IconContext.Provider value={{ size: "20" }}>
                      <MdClose />
                    </IconContext.Provider>
                  </button>
                </td>
              </tr>
              {/* row 2 */}
              <tr>
                <th>2</th>
                <td>Category 2</td>
                <td className="flex flex-row items-center justify-end w-full">
                  <button className="btn btn-outline btn-error">
                    <IconContext.Provider value={{ size: "20" }}>
                      <MdClose />
                    </IconContext.Provider>
                  </button>
                </td>
              </tr>
              {/* row 3 */}
              <tr>
                <th>3</th>
                <td>Category 3</td>
                <td className="flex flex-row items-center justify-end gap-5 w-full">
                  <button className="btn btn-outline btn-error">
                    <IconContext.Provider value={{ size: "20" }}>
                      <MdClose />
                    </IconContext.Provider>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex flex-col w-full items-center justify-center">
          <h3 className="font-bold text-lg text-left w-full mb-5">Account</h3>
          <button className="btn btn-wide btn-primary">logout</button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
