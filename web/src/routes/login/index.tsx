import { useAuth0 } from "@auth0/auth0-react";
import { AppButton } from "../../components/AppButton";

export function LoginPage() {
  const { loginWithRedirect } = useAuth0();
  return (
    <div className="w-full h-screen flex flex-col justify-center items-center font-go bg-background text-secondary">
      <h1 className="text-6xl pb-4">Dimewise</h1>
      <p className="pb-12">Take control of your budget</p>
      <AppButton label="Login" onClick={() => loginWithRedirect()} />
    </div>
  );
}
