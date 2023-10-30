import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import React from "react"

interface CategoryListItemProps {
  id: string;
  name: string;
}

const CategoryListItem: React.FC<CategoryListItemProps> = ({ id, name }) => {
  return (
    <div className="" id={id}>
      <div className="grid gap-5 grid-cols-7">
        <p className="text-sm font-semibold leading-none col-span-5 flex items-center">{name}</p>
        <Sheet>
          <SheetTrigger asChild>
            <Button className="col-span-2">Delete</Button>
          </SheetTrigger>
          <SheetContent side={"bottom"}>
            <SheetHeader className="mb-5">
              <SheetTitle>Are you sure absolutely sure?</SheetTitle>
              <SheetDescription>
                This action cannot be undone. This will permanently delete this category from your account.
              </SheetDescription>
            </SheetHeader>
            <SheetFooter className="flex flex-row w-full items-center justify-center gap-5">
              <SheetClose asChild>
                <Button type="button" variant={"outline"}>Cancel</Button>
              </SheetClose>
              <SheetClose asChild>
                <Button type="submit">Continue</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div >
  )
}


export default CategoryListItem;
