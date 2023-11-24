import AppLayout from "../../common/AppLayout";
import { Button } from "@/components/ui/button";
import { useGetCategories } from "../../generated/api/dimewise";

const History: React.FC = () => {
  const { data } = useGetCategories()

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
