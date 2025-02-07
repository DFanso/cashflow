import { useState } from "react"

interface DateFilterProps {
  onFilterChange: (year: number, month: number) => void
}

export function DateFilter({ onFilterChange }: DateFilterProps) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())

  const handleYearChange = (year: number) => {
    setSelectedYear(year)
    onFilterChange(year, selectedMonth)
  }

  const handleMonthChange = (month: number) => {
    setSelectedMonth(month)
    onFilterChange(selectedYear, month)
  }

  return (
    <div className="flex gap-4 items-center">
      <div>
        <label htmlFor="year" className="block text-sm font-medium text-muted-foreground mb-1">
          Year
        </label>
        <select
          id="year"
          value={selectedYear}
          onChange={(e) => handleYearChange(Number(e.target.value))}
          className="w-32 rounded-md border border-input bg-background px-3 py-2"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="month" className="block text-sm font-medium text-muted-foreground mb-1">
          Month
        </label>
        <select
          id="month"
          value={selectedMonth}
          onChange={(e) => handleMonthChange(Number(e.target.value))}
          className="w-40 rounded-md border border-input bg-background px-3 py-2"
        >
          {months.map((month, index) => (
            <option key={month} value={index}>
              {month}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
} 