import { useContext } from "react";
import { AuthContext } from "../components/context/AuthContext";

export const useAuth = () => {
	return useContext(AuthContext);
};
