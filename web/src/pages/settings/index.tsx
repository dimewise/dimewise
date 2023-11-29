import { Accordion } from "@/components/ui/accordion";
import AccordionCategory from "./components/AccordionCategory";
import AccordionAccount from "./components/AccordionAccount";


const Settings: React.FC = () => {
  return (
    <>
      <div className="w-full flex flex-col justify-start items-start">
        <h1 className="mt-3 mb-8 font-bold text-3xl">Settings</h1>
        <Accordion className="w-full" type="single" collapsible defaultValue="category">
          <AccordionCategory />
          <AccordionAccount />
        </Accordion>
      </div>
    </>
  );
};

export default Settings;
