"use client"

import { useState, useEffect } from "react"
import { Check } from "lucide-react"
import { Label } from "@/components/ui/label"
import { groupColors } from "@/utils/Helpers"

interface ColorSelectorProps {
  value?: string
  onChange?: (color: string) => void
  label?: string
}

export default function ColorSelector({ 
  value, 
  onChange, 
  label = "Selecione uma cor" 
}: ColorSelectorProps) {
  const [selectedColor, setSelectedColor] = useState<string>(value || "")

  useEffect(() => {
    if (value !== undefined) {
      setSelectedColor(value)
    }
  }, [value])

  const handleColorSelect = (colorName: string) => {
    setSelectedColor(colorName)
    if (onChange) {
      onChange(colorName)
    }
  }

  return (
    <div className="space-y-2">
      {label && <Label className="text-sm font-medium">{label}</Label>}

      <div className="grid grid-cols-6 gap-4">
        {groupColors.map((color: any) => (
          <button
            key={color.name}
            type="button"
            className={`
              relative h-8 w-8 rounded-full border-2 transition-all duration-200
              ${selectedColor === color.name 
                ? "border-gray-800 scale-110" 
                : "border-gray-200"
              }
            `}
            onClick={() => handleColorSelect(color.name)}
            aria-label={`Cor ${color.name}`}
          >
            <div className={`w-full h-full rounded-full ${color.darkerBgClass}`}>
              {selectedColor === color.name && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check className="w-4 h-4 text-gray-800 drop-shadow" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
