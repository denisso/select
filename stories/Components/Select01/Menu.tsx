import React from "react";
import useContext from "./Context/useContext";
import Portal from "./Portal";
import throttle from "../utils/throttle";
import { addHandler, delHandler } from "../utils/posChange";
import classNames from "classnames";
import css from "./Menu.module.css";

const updateBox = throttle<
  (
    target: HTMLElement,
    setAttrs: React.Dispatch<
      React.SetStateAction<React.HTMLAttributes<HTMLElement>>
    >
  ) => void
>((target, setAttrs) => {
  if (!open || !(target instanceof HTMLElement)) return;
  const rect = target.getBoundingClientRect();

  setAttrs({
    style: {
      top: rect.top + rect.height + "px",
      left: rect.left + "px",
      width: rect.width + "px",
    },
    ...aria,
  });
}, 100);

type Props = {
  className: string;
  children: React.ReactNode;
  emptyValue: string;
  styles?: Partial<{ open: string; portal: string }>;
  onOpen?: (focus: boolean) => void;
  manualOpenClose?: boolean;
  portal?: boolean;
};

const aria = { role: "listbox" };

const Menu = ({
  className,
  children,
  styles,
  emptyValue,
  portal = false,
}: Props) => {
  const c = useContext();
  const [attrs, setAttrs] = React.useState<React.HTMLAttributes<HTMLElement>>({
    ...aria,
  });
  const menuRef = React.useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      menuRef.current &&
      c.boxRef.current &&
      !menuRef.current.contains(event.target as Node) &&
      !c.boxRef.current.contains(event.target as Node)
    ) {
      c.setOpen(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  React.useEffect(() => {
    if (!c.open || !portal) return;
    if (!(c.boxRef.current instanceof HTMLElement)) {
      throw Error("Target element not valid");
    }

    const $target = c.boxRef.current;

    updateBox($target, setAttrs);
    const h = () => updateBox($target, setAttrs);
    addHandler("resize", h);
    addHandler("scroll", h);
    return () => {
      delHandler("resize", h);
      delHandler("scroll", h);
    };
  }, [c]);
  c.emptyOptionRef.current = emptyValue;
  if (!c.open) return null;
  if (!portal)
    return (
      <div className={className} ref={menuRef}>
        {children}
      </div>
    );
  return (
    <Portal>
      <div
        {...attrs}
        ref={menuRef}
        className={classNames(
          css.portal,
          c.open ? styles?.open : "",
          className
        )}
      >
        {children}
      </div>
    </Portal>
  );
};

export default Menu;
