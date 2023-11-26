import { MdAdd } from "react-icons/md";
import { IconContext } from "react-icons";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
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
  const form = useForm<z.infer<typeof createExpenseSchema>>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      amount: 0,
    }
  });

  function onSubmit(values: z.infer<typeof createExpenseSchema>) {
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="fixed bottom-4 right-4 w-16 h-16 rounded-full">
          <IconContext.Provider value={{ className: "text-3xl" }}>
            <MdAdd />
          </IconContext.Provider>
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
                      <SelectContent>
                        <SelectItem value="abcdddd8-b0c5-4af5-b129-e9ff01c47f59">
                          Category 1
                        </SelectItem>
                        <SelectItem value="c2a4d8c7-cd05-4c8b-9110-e0e6791d1ef4">
                          Category 2
                        </SelectItem>
                        <SelectItem value="a1880890-a9e6-4017-85ba-64d3c215ede7">
                          Category 3
                        </SelectItem>
                      </SelectContent>
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
    </Sheet>
  );
};

export default QuickAccess;
