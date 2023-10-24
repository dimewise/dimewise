import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ExpenseTimelineChart from "./components/ExpenseTimelineChart";
import CurrentMonthSummary from "./components/CurrentMonthSummary";

const Overview: React.FC = () => {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
        <Card className="md:col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>October 2023</CardTitle>
            <CardDescription>
              You've spent ~60% of your monthly budget.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CurrentMonthSummary />
          </CardContent>
        </Card>
        <Card className="md:col-span-1 lg:col-span-5">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              You have spent on 200 expenses this month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExpenseTimelineChart />
          </CardContent>
        </Card>
      </div>
    </>
  )
}


export default Overview;
