import { Dropdown } from "react-bootstrap";

const Dropdowns = ({ className, trigger, type = "button", children, align = "end", ...props }) => {
  return (
    <Dropdown align={align}>
      <Dropdown.Toggle className={"cursor-pointer " + className} {...props} type={type}>
        {trigger}
      </Dropdown.Toggle>

      <Dropdown.Menu>{children}</Dropdown.Menu>
    </Dropdown>
  );
};

const DropdownItem = ({ href, className = "", children, ...props }) => {
  return (
    <Dropdown.Item href={href} className={className} {...props}>
      {children}
    </Dropdown.Item>
  );
};

Dropdowns.Item = DropdownItem;

export default Dropdowns;
