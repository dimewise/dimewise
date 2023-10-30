import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import CategoryListItem from "../CategoryListItem";
import { Button } from "@/components/ui/button";

const data = [
  {
    id: "1",
    name: "Groceries",
  },
  {
    id: "2",
    name: "Entertainment",
  },
  {
    id: "3",
    name: "Utilities",
  },
  {
    id: "4",
    name: "Dining",
  },
  {
    id: "5",
    name: "Transportation",
  },
  {
    id: "6",
    name: "Healthcare",
  },
];

const AccordionCategory: React.FC = () => {
  return (
    <AccordionItem value="category">
      <AccordionTrigger>Manage Category</AccordionTrigger>
      <AccordionContent>
        <div className="flex flex-col space-y-5">
          <div className="grid gap-5 grid-cols-7 border-y py-5">
            <p className="text-sm col-span-5 flex items-center">Name</p>
            <p className="col-span-2">Action</p>
          </div>
          {data.map((category, index) => (
            <CategoryListItem
              key={index}
              id={category.id}
              name={category.name}
            />
          ))}
          <Sheet>
            <SheetTrigger asChild>
              <Button>Create</Button>
            </SheetTrigger>
            <SheetContent side={"bottom"}>
              <SheetHeader>
                <SheetTitle>Are you sure absolutely sure?</SheetTitle>
                <SheetDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove your data from our servers.
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export default AccordionCategory;
