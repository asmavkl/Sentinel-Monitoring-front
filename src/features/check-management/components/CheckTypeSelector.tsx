import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';
import { CheckType } from '@/types/enums';

interface CheckTypeSelectorProps {
  value: CheckType | null;
  disabled?: boolean;
  onChange: (value: CheckType) => void;
}

export function CheckTypeSelector({ value, disabled = false, onChange }: CheckTypeSelectorProps) {
  return (
    <FormControl>
      <FormLabel id="check-type-label">نوع شاخص</FormLabel>
      <RadioGroup
        aria-labelledby="check-type-label"
        value={value ?? ''}
        onChange={(event) => onChange(Number(event.target.value) as CheckType)}
      >
        <FormControlLabel
          value={1} // HttpRequest or Http (both have value 1)
          disabled={disabled}
          control={<Radio />}
          label="شاخص HTTP"
        />
        <FormControlLabel
          value={2} // SqlQuery or DatabaseQuery (both have value 2)
          disabled={disabled}
          control={<Radio />}
          label="شاخص Database"
        />
        <FormControlLabel
          value={CheckType.Redis}
          disabled={disabled}
          control={<Radio />}
          label="شاخص Redis"
        />
        <FormControlLabel
          value={CheckType.MongoDb}
          disabled={disabled}
          control={<Radio />}
          label="شاخص MongoDB"
        />
      </RadioGroup>
    </FormControl>
  );
}
