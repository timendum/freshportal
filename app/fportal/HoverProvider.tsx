import { createContext } from "react";
import { HoverContextType } from "./HoverContext";

export const HoverContext = createContext<HoverContextType>({ setHoveredComponent: () => {} });
