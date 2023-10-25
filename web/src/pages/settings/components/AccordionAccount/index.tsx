import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth0 } from "@auth0/auth0-react";

const AccordionAccount: React.FC = () => {
  const { logout } = useAuth0();

  return (
    <AccordionItem value="account">
      <AccordionTrigger>Manage Account</AccordionTrigger>
      <AccordionContent>
        <Sheet>
          <SheetTrigger asChild>
            <Button className="w-full">Logout</Button>
          </SheetTrigger>
          <SheetContent side={"bottom"}>
            <SheetHeader className="mb-5">
              <SheetTitle>Are you sure you want to logout?</SheetTitle>
              <SheetDescription>
                You will be required to sign back in the next time you visit. Click "Confirm" to continue, or "Cancel" to return back to the Settings page.
              </SheetDescription>
            </SheetHeader>
            <SheetFooter className="flex flex-row w-full items-center justify-center gap-5">
              <SheetClose asChild>
                <Button type="button" variant={"outline"}>Cancel</Button>
              </SheetClose>
              <SheetClose asChild>
                <Button type="submit" onClick={() => logout({ logoutParams: { returnTo: "/" } })}>Confirm</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </AccordionContent>
    </AccordionItem>
  )
}

export default AccordionAccount;
