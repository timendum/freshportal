export interface HoverableComponent {
  handleKeyboardEvent: (event: KeyboardEvent) => void;
}

export interface HoverContextType {
  setHoveredComponent: (comp: HoverableComponent | null) => void;
}
