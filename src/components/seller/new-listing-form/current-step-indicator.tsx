import { cn } from "@/lib/utils";
import { steps } from "./form-defaults";

export function CurrentStepIndicator({ step, currentStep, setCurrentStep, index }: { step: { number: number, title: string, icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }, currentStep: number, setCurrentStep: (step: number) => void, index: number }) {
  return (
    <button
      key={step.number}
      type="submit"
      // disabled={currentStep < step.number}
      className="flex cursor-pointer items-center"
      onClick={() => {
        setCurrentStep(index + 1);
      }}
    >
      <div
        className={cn("flex h-10 w-10 items-center justify-center rounded-full border-2", currentStep >= step.number
          ? "border-accent bg-accent text-accent-foreground"
          : "border-border bg-background text-muted-foreground")}
      >
        <step.icon className="h-5 w-5" />
      </div>
      <div className="ml-3">
        <p
          className={cn("font-medium text-sm", currentStep >= step.number ? "text-foreground" : "text-muted-foreground")}
        >
          Step {step.number}
        </p>
        <p className={cn("text-xs", currentStep >= step.number ? "text-foreground" : "text-muted-foreground")}>
          {step.title}
        </p>
      </div>
      {index < steps.length - 1 && (
        <div className={cn("mx-4 h-0.5 flex-1", currentStep > step.number ? "bg-accent" : "bg-border")} />
      )}
    </button>
  )
}
