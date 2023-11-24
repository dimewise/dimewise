import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import React from "react";
import { getGetCategoriesKey, postCategory } from "../../../../../../generated/api/dimewise";
import { mutate } from "swr";

const createCategorySchema = z.object({
  name: z.string().min(1, {
    message: "Category name must have at least 1 character.",
  }),
  amount: z.coerce.number().min(1, "Category budget must be a value larger than 0."),
});

const CreateCategoryButton: React.FC = () => {
  const [open, setOpen] = React.useState<boolean>(false);
  const form = useForm<z.infer<typeof createCategorySchema>>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: "",
      amount: 0,
    }
  });

  function onSubmit(values: z.infer<typeof createCategorySchema>) {
    postCategory({
      budget: values.amount,
      name: values.name,
    }).then((res) => {
      console.log(res);
      form.reset({ name: "", amount: 0 })
      mutate(getGetCategoriesKey);
      setOpen(false);
    }).catch((err) => {
      console.log(err);
    })
  }
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="w-full mt-5">Create</Button>
      </SheetTrigger>
      <SheetContent side={"bottom"}>
        <SheetHeader>
          <SheetTitle>Create Category</SheetTitle>
          <SheetDescription>
            Create a new category for your expenses
          </SheetDescription>
        </SheetHeader>
        <div className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Groceries" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the category name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Budget</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="60000"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This is the budget you set for this category.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Save Category
              </Button>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default CreateCategoryButton;

