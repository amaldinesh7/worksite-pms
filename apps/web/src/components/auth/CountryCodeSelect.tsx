import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const COUNTRY_CODES = [
  { code: '+91', label: 'India (+91)' },
  { code: '+1', label: 'USA (+1)' },
  { code: '+44', label: 'UK (+44)' },
  { code: '+971', label: 'UAE (+971)' },
];

interface CountryCodeSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function CountryCodeSelect({ value, onValueChange, disabled }: CountryCodeSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-24 rounded-r-none border-r-0 bg-neutral-50">
        <SelectValue placeholder="+91" />
      </SelectTrigger>
      <SelectContent>
        {COUNTRY_CODES.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            {country.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
