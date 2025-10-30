import { UserContext } from "@/lib/contexts/user-context";
import { useContext } from "react";

export const useUser = () => {
  const user = useContext(UserContext);
  return user;
};
