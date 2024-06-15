import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../../lib/supabase";

export const Login = () => {
  // const navigate = useNavigate();
  // const location = useLocation();
  //
  // const from = location.state?.from?.pathname || "/";
  //
  // const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  //   event.preventDefault();
  //
  //   const formData = new FormData(event.currentTarget);
  //   const email = formData.get("email");
  //   const password = formData.get("password");
  //   if (email && password) {
  //     await signIn(email.toString(), password.toString());
  //     navigate(from, { replace: true });
  //   }
  // };

  return (
    <div>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
      />
    </div>
  );
};
