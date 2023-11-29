import { Button } from "@/components/ui/button";
import { useGetCategories, useGetExpensesOverview } from "../../generated/api/dimewise";

const History: React.FC = () => {
  const { data } = useGetExpensesOverview()

  console.log(data);

  return (
    <>
      <div className="w-full flex flex-col gap-5 justify-center items-center">
        history
      </div>
      <Button>Test</Button>
    </>
  );
};

export default History;
