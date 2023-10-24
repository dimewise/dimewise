import React from "react";
import { Pie, PieChart, Cell, ResponsiveContainer, Label, Legend } from "recharts";

const data = [
  { name: 'Category 1', value: 1000 },
  { name: 'Category 2', value: 200 },
  { name: 'Category 3', value: 300 },
  { name: 'Unused Budget', value: 200 },
];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const CurrentMonthSummary: React.FC = () => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart >
        <Pie
          data={data}
          innerRadius={80}
          outerRadius={100}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${String(index)}`} fill={COLORS[index % COLORS.length]} />
          ))}

          <Label
            value="¥30,000" position="centerBottom" className="font-semibold text-2xl" />
          <Label
            value="/¥50,000" position="centerTop" className='translate-y-2'
          />
        </Pie>
        <Legend verticalAlign="bottom" />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CurrentMonthSummary;

