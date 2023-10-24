import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CategoryCardProps {
  id: string;
  name: string;
  currentAmount: number;
  budgetAmount: number;
  delta: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ id, name, currentAmount, budgetAmount, delta }) => {
  const formattedCurrentAmount = currentAmount.toLocaleString();
  const formattedBudgetAmount = budgetAmount.toLocaleString();
  const isPositiveDelta = delta >= 0;
  const deltaArrow = isPositiveDelta ? "↑" : "↓";
  const deltaColor = isPositiveDelta ? "text-green-500" : "text-red-500";
  const currentPercentage = (currentAmount / budgetAmount) * 100
  console.log(currentPercentage)

  return (
    <Card id={id}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold">
          {name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">
          {`¥ ${formattedCurrentAmount}/`}
          <span className="text-base">{formattedBudgetAmount}</span>
        </div>
        <Progress value={currentPercentage} className="w-full" />
        <p className={`text-xs ${deltaColor} mt-5`}>
          <span className={deltaColor}>{`${deltaArrow} ${Math.abs(delta)}%`}</span> from last month
        </p>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;

