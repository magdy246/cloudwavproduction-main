import { createContext } from "react";
import { TAuthContext } from "../Providers/AuthContext";
const AuthContext = createContext<TAuthContext | null>(null);

export { AuthContext };
