import React from "react"
import ListItem from "./components/ListItem";

const data = [
  {
    id: "1",
    title: "Din Tai Fung",
    category: "Category 1",
    amount: 4200
  },
  {
    id: "2",
    title: "Gucci",
    category: "Category 2",
    amount: 320000
  },
  {
    id: "3",
    title: "Arcade",
    category: "Category 2",
    amount: 1000
  },
  {
    id: "4",
    title: "Macarons",
    category: "Category 1",
    amount: 2300
  },
  {
    id: "5",
    title: "Suica",
    category: "Category 3",
    amount: 3000
  }
];

const RecentExpenses: React.FC = () => {
  return (
    <div className="w-full flex flex-col space-y-4">
      {data.map((expense) => (
        <ListItem
          key={expense.id}
          id={expense.id}
          title={expense.title}
          category={expense.category}
          amount={expense.amount}
        />
      ))}
    </div>
  )
}


export default RecentExpenses;
