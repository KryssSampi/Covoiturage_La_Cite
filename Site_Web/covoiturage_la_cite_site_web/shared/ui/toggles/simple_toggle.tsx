"use client";

interface ToggleProps {
  bindValue: boolean; // Obligatoire pour éviter les comportements erratiques
  onToggle: (value: boolean) => void;
  activeColor?: string;
}

export default function CustomToggle({
  bindValue,
  onToggle,
  activeColor = "bg-green-500",
}: ToggleProps) {
  
  // Plus besoin de useState interne ici si on veut un "Controlled Component" pur.
  // C'est bindValue qui pilote tout.

  return (
    <label className="relative inline-flex items-center cursor-pointer w-full max-w-xs">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={bindValue}
        onChange={() => {onToggle(!bindValue); console.log("Toggle changed", !bindValue);}}
      />
      <div
        className={`w-14 min-h-[28px] max-w-full rounded-full transition-all duration-300 ${
          bindValue ? activeColor : "bg-gray-300"
        } peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-gray-400`}
      ></div>
      <div
        className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out ${
          bindValue ? "translate-x-7" : "translate-x-0"
        }`}
      ></div>
    </label>
  );
}