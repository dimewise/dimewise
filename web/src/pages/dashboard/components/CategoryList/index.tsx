import CategoryCard from "./components/CategoryCard";

const data = [
  {
    id: "1",
    name: "Groceries",
    currentAmount: 250000, // 2500 * 100
    budgetAmount: 300000,  // 3000 * 100
    delta: -10,
  },
  {
    id: "2",
    name: "Entertainment",
    currentAmount: 80000,  // 800 * 100
    budgetAmount: 100000,  // 1000 * 100
    delta: 15,  // Positive delta
  },
  {
    id: "3",
    name: "Utilities",
    currentAmount: 7000,  // 120 * 100
    budgetAmount: 15000,  // 150 * 100
    delta: -25,
  },
  {
    id: "4",
    name: "Dining",
    currentAmount: 24000,  // 400 * 100
    budgetAmount: 50000,  // 500 * 100
    delta: 8,  // Positive delta
  },
  {
    id: "5",
    name: "Transportation",
    currentAmount: 14300,  // 200 * 100
    budgetAmount: 25000,  // 250 * 100
    delta: -12,
  },
  {
    id: "6",
    name: "Healthcare",
    currentAmount: 28000,  // 300 * 100
    budgetAmount: 35000,  // 350 * 100
    delta: 20,  // Positive delta
  },
];

const CategoryList: React.FC = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {data.map((category) => (
        <CategoryCard
          key={category.id}
          id={category.id}
          name={category.name}
          currentAmount={category.currentAmount}
          budgetAmount={category.budgetAmount}
          delta={category.delta}
        />
      ))}
    </div>
  )
}

export default CategoryList; 
