import { MdAdd } from "react-icons/md";
import { TbLoader2 } from "react-icons/tb";
import { IconContext } from "react-icons";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import React from "react";
import { useGetCategories } from "../../../../generated/api/dimewise";

const createExpenseSchema = z.object({
  title: z.string().min(1, {
    message: "Expense title must have at least 1 character.",
  }),
  description: z.string(),
  amount: z.coerce.number().min(1, "Expense amount must be a value larger than 0."),
  category: z.string().uuid(),
});

const QuickAccess: React.FC = () => {
  const [open, setOpen] = React.useState<boolean>(false);
  const { data: categories, isLoading: categoriesIsLoading, error: categoriesErr } = useGetCategories()
  const form = useForm<z.infer<typeof createExpenseSchema>>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: 0,
    }
  });

  function onSubmit(values: z.infer<typeof createExpenseSchema>) {
    setOpen(false);
  }

  console.log("loading", categoriesIsLoading)
  console.log("ca", categories)
  console.log(categoriesErr)

  if (categoriesErr) {
    return <div>Error getting categories</div>
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button disabled={categoriesIsLoading || !categories} className="fixed bottom-4 right-4 w-16 h-16 rounded-full">
          {categoriesIsLoading || !categories ?
            <IconContext.Provider value={{ className: "text-3xl animate-spin" }}>
              <TbLoader2 />
            </IconContext.Provider>
            :
            <IconContext.Provider value={{ className: "text-3xl" }}>
              <MdAdd />
            </IconContext.Provider>
          }
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[90%] overflow-x-auto">
        <SheetHeader>
          <SheetTitle>Create Expense</SheetTitle>
          <SheetDescription>
            Add a new expense to your list of transactions
          </SheetDescription>
        </SheetHeader>
        <div className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category for this expense" />
                        </SelectTrigger>
                      </FormControl>
                      {categoriesErr
                        ? <SelectContent>
                          <SelectItem value="test">
                            Error loading categories
                          </SelectItem>
                        </SelectContent>
                        : !categoriesIsLoading || !categories
                          ? <SelectContent>
                            {categories?.categories &&
                              categories.categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                          : <SelectContent>
                            <SelectItem value="test">
                              No categories available
                            </SelectItem>
                          </SelectContent>
                      }
                    </Select>
                    <FormDescription>
                      This will act as an identifier for this expense.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Wallet from Goyard" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is what you purchased.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Father's birthday present"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This is the reason for your purchase.
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
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="60000"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This is how much your expense cost.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Save Expense
              </Button>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet >
  );
};

export default QuickAccess;
