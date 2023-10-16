import { useAuth0 } from "@auth0/auth0-react";
import AppButton from "../../components/AppButton";
import { Navigate } from "react-router-dom";
import AppLayout from "../../components/AppLayout";

const Dashboard: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth0();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace={true} />;
  }

  return (
    <AppLayout>
      <div className="w-full flex flex-col gap-5 justify-center items-center">
        <div className="w-full flex flex-row justify-between items-center text-sm mt-5 mb-10">
          <p>October 2023</p>
          <div className="flex gap-2">
            <div>
              <span className="countdown font-mono ">
                <span style={{ "--value": 15 }}></span>
              </span>
              days
            </div>
            <div>remaining</div>
          </div>
        </div>
        <div className="radial-progress text-accent mb-10" style={{ "--value": "70", "--size": "12rem", "--thickness": "5px" }}>
          <div className="text-center text-neutral-content">
            <p>Total</p>
            <p className="font-bold text-2xl">¥130,000</p>
          </div>
        </div>
        <div className="collapse bg-base-200 ">
          <input type="radio" name="my-accordion-1" defaultChecked />
          <div className="collapse-title text-lg font-bold">
            Summary
          </div>
          <div className="collapse-content">
            <div className="flex flex-col mb-5">
              <div className="flex justify-between items-center mb-5">
                <p>Category 1</p>
                <p>¥1,500/¥50,000</p>
              </div>
              <progress className="progress progress-success w-full" value="10" max="100"></progress>
            </div>
            <div className="flex flex-col mb-5">
              <div className="flex justify-between items-center mb-5">
                <p>Category 2</p>
                <p>¥1,500/¥50,000</p>
              </div>
              <progress className="progress progress-warning w-full" value="45" max="100"></progress>
            </div>
            <div className="flex flex-col mb-2">
              <div className="flex justify-between items-center mb-5">
                <p>Category 3</p>
                <p>¥1,500/¥50,000</p>
              </div>
              <progress className="progress progress-error w-full" value="70" max="100"></progress>
            </div>
          </div>
        </div>
        <div className="collapse bg-base-200">
          <input type="radio" name="my-accordion-1" />
          <div className="collapse-title text-lg font-medium">
            Recent Transactions
          </div>
          <div className="collapse-content w-full items-center flex flex-col">
            <div className="overflow-x-auto w-full mb-5">
              <table className="table">
                {/* head */}
                <tbody>
                  {/* row 1 */}
                  <tr>
                    <th>3</th>
                    <td>Coco Curry</td>
                    <td>¥1,500</td>
                  </tr>
                  {/* row 2 */}
                  <tr>
                    <th>2</th>
                    <td>Uniqlo</td>
                    <td>¥3,200</td>
                  </tr>
                  {/* row 3 */}
                  <tr>
                    <th>1</th>
                    <td>Goemon</td>
                    <td>¥4,500</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button className="btn btn-md btn-secondary btn-wide ">View More</button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
