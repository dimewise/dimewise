import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import CategoryListItem from "../CategoryListItem";
import CreateCategoryButton from "./components/CreateCategoryButton";
import { useGetCategories } from "../../../../generated/api/dimewise";
import { BaseCategoryDto } from "src/generated/dto";

const AccordionCategory: React.FC = () => {
  const { data, isLoading, error } = useGetCategories();

  // Destructure data.categories here
  const { categories } = data || {};

  return (
    <AccordionItem value="category">
      <AccordionTrigger>Manage Category</AccordionTrigger>
      <AccordionContent>
        <div className="flex flex-col space-y-5">
          <div className="grid gap-5 grid-cols-7 border-y py-5">
            <p className="text-sm col-span-5 flex items-center">Name</p>
            <p className="col-span-2">Action</p>
          </div>
          {error ? (
            <div>Error</div>
          ) : isLoading ? (
            <div>Loading</div>
          ) : !categories || categories.length === 0 ? (
            <div>No categories available</div>
          ) : (
            categories.map((category: BaseCategoryDto, index: number) => (
              <CategoryListItem
                key={index}
                id={category.id}
                name={category.name}
              />
            ))
          )}
        </div>
        <CreateCategoryButton />
      </AccordionContent>
    </AccordionItem>
  );
}

export default AccordionCategory;
