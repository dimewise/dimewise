import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ListItemProps {
  id: string;
  title: string;
  category: string;
  amount: number;
}
const ListItem: React.FC<ListItemProps> = ({ id, title, category, amount }) => {
  const formattedAmount = amount.toLocaleString()
  const fallbackTitle = title.split(" ").map(word => word.charAt(0).toUpperCase()).join("").substring(0, 3)
  return (
    <div className="flex items-center" id={id}>
      <Avatar className="flex h-12 w-12 items-center justify-center space-y-0 border mr-5">
        <AvatarImage src="/avatars/02.png" alt="Avatar" />
        <AvatarFallback>{fallbackTitle}</AvatarFallback>
      </Avatar>
      <div className=" space-y-1 ">
        <div className="flex flex-col items-start space-y-2">
          <p className="text-sm font-semibold leading-none">{title}</p>
          <Badge>{category}</Badge>
        </div>
      </div>
      <div className="ml-auto font-semibold">{`-¥${formattedAmount}`}</div>
    </div>
  )
}

export default ListItem;

