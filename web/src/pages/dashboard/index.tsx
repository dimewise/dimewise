import { useAuth0 } from "@auth0/auth0-react";
import { Navigate } from "react-router-dom";
import AppLayout from "../../components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import RecentExpenses from "./components/RecentExpenses";
import Overview from "./components/Overview";
import CategoryList from "./components/CategoryList";

const Dashboard: React.FC = () => {
  const { isAuthenticated } = useAuth0();
  if (!isAuthenticated) {
    return <Navigate to="/" replace={true} />;
  }

  return (
    <AppLayout>
      <div className="flex-1 space-y-4 md:p-8 md:pt-6">
        <div className="flex items-center justify-between space-y-2 mb-5">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <Overview />
        <CategoryList />
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
          <Card className="col-span-7">
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
              <CardDescription>
                You have spent on 200 expenses this month.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentExpenses />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
