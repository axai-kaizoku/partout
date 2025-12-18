import { useContext } from "react";
import { UserContext } from "@/lib/contexts/user-context";

export const useUser = () => {
  const user = useContext(UserContext);
  return user;
};
