import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const CustomSelect = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  const selectedOption = options.find((option) => option.value === value);

  const handleOptionClick = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="custom-select" ref={selectRef}>
      <div className="select-selected" onClick={() => setIsOpen(!isOpen)}>
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown size={20} className={`arrow ${isOpen ? "open" : ""}`} />
      </div>
      {isOpen && (
        <div className="select-options">
          {options.map((option) => (
            <div
              key={option.value}
              className="select-option"
              onClick={() => handleOptionClick(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
