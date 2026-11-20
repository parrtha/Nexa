import { ArrowUp, Search } from "lucide-react";
import { useState } from "react";

export default function CommandInput({
  onSubmit,
  onChange,
  disabled,
  suggestions = [],
}) {
  const [value, setValue] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);

  function handleChange(event) {
    const newValue = event.target.value;

    setValue(newValue);
    setSelectedIndex(-1);

    if (onChange) {
      onChange(newValue);
    }
  }

  function submitText(text) {
    const command = text.trim();

    if (!command || disabled) return;

    onSubmit(command);

    setValue("");
    setSelectedIndex(-1);

    if (onChange) {
      onChange("");
    }
  }

  function submit(event) {
    event.preventDefault();
    submitText(value);
  }

  function handleKeyDown(event) {
    // Arrow Down
    if (event.key === "ArrowDown" && suggestions.length > 0) {
      event.preventDefault();

      setSelectedIndex((current) => {
        if (current === -1) return 0;

        return current + 1 >= suggestions.length
          ? 0
          : current + 1;
      });

      return;
    }

    // Arrow Up
    if (event.key === "ArrowUp" && suggestions.length > 0) {
      event.preventDefault();

      setSelectedIndex((current) => {
        if (current === -1) {
          return suggestions.length - 1;
        }

        return current - 1 < 0
          ? suggestions.length - 1
          : current - 1;
      });

      return;
    }

    // Escape
    if (event.key === "Escape") {
      event.preventDefault();

      setSelectedIndex(-1);

      if (onChange) {
        onChange("");
      }

      return;
    }

    // Enter
    if (event.key === "Enter") {
      event.preventDefault();

      if (
        selectedIndex >= 0 &&
        selectedIndex < suggestions.length
      ) {
        submitText(suggestions[selectedIndex].text);
      } else {
        submitText(value);
      }

      return;
    }
  }

  return (
    <form className="command-input" onSubmit={submit}>
      <Search size={19} />

      <input
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder='Try "open calculator" or "increase volume"...'
        disabled={disabled}
      />

      <button
        type="submit"
        disabled={disabled || !value.trim()}
      >
        <ArrowUp size={18} />
      </button>
    </form>
  );
}