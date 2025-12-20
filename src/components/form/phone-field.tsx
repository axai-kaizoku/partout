import { Label } from "../ui/label";
import { PhoneInput } from "../ui/phone-input";
import { useFieldContext } from ".";
import { FieldErrors } from "./field-errors";

type PhoneFieldProps = {
  label: string;
} & React.ComponentProps<typeof PhoneInput>;

export const PhoneField = ({ label, ...phoneInputProps }: PhoneFieldProps) => {
  const field = useFieldContext<string>();

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        <Label htmlFor={field.name}>{label}</Label>
        <PhoneInput
          id={field.name}
          defaultCountry="US"
          onChange={(value) => field.handleChange(value)}
          {...field.state}
          {...phoneInputProps}
        />
      </div>
      <FieldErrors meta={field.state.meta} />
    </div>
  );
};
