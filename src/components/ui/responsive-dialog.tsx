"use client";

import * as ResponsiveDialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const ResponsiveDialog = ResponsiveDialogPrimitive.Root;

const ResponsiveDialogTrigger = ResponsiveDialogPrimitive.Trigger;

const ResponsiveDialogClose = ResponsiveDialogPrimitive.Close;

const ResponsiveDialogPortal = ResponsiveDialogPrimitive.Portal;

const ResponsiveDialogOverlay = React.forwardRef<
  React.ElementRef<typeof ResponsiveDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof ResponsiveDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <ResponsiveDialogPrimitive.Overlay
    className={cn(
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=closed]:animate-out data-[state=open]:animate-in",
      className,
    )}
    {...props}
    ref={ref}
  />
));
ResponsiveDialogOverlay.displayName =
  ResponsiveDialogPrimitive.Overlay.displayName;

const ResponsiveDialogVariants = cva(
  cn(
    "fixed z-50 gap-4 overflow-y-auto bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:duration-200 data-[state=open]:duration-300 lg:data-[state=open]:duration-200",
    "lg:data-[state=closed]:fade-out-0 lg:data-[state=open]:fade-in-0 lg:data-[state=closed]:zoom-out-95 lg:data-[state=open]:zoom-in-95 lg:top-[50%] lg:left-[50%] lg:grid lg:w-full lg:max-w-lg lg:translate-x-[-50%] lg:translate-y-[-50%] lg:rounded-xl lg:border lg:duration-200 lg:data-[state=closed]:animate-out lg:data-[state=open]:animate-in",
  ),
  {
    variants: {
      side: {
        top: "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 max-h-[80dvh] rounded-b-xl border-b lg:h-fit",
        bottom:
          "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 max-h-[80dvh] rounded-t-xl border-t lg:h-fit",
        left: "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 rounded-r-xl border-r sm:max-w-sm lg:h-fit",
        right:
          "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 rounded-l-xl border-l sm:max-w-sm lg:h-fit",
      },
    },
    defaultVariants: {
      side: "bottom",
    },
  },
);

interface ResponsiveDialogContentProps
  extends React.ComponentPropsWithoutRef<
      typeof ResponsiveDialogPrimitive.Content
    >,
    VariantProps<typeof ResponsiveDialogVariants> {}

const ResponsiveDialogContent = React.forwardRef<
  React.ElementRef<typeof ResponsiveDialogPrimitive.Content>,
  ResponsiveDialogContentProps
>(({ side = "bottom", className, children, ...props }, ref) => (
  <ResponsiveDialogPortal>
    <ResponsiveDialogOverlay />
    <ResponsiveDialogPrimitive.Content
      ref={ref}
      className={cn(
        ResponsiveDialogVariants({ side }),
        "space-y-2.5",
        className,
      )}
      {...props}
    >
      {children}
      <ResponsiveDialogClose className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </ResponsiveDialogClose>
    </ResponsiveDialogPrimitive.Content>
  </ResponsiveDialogPortal>
));
ResponsiveDialogContent.displayName =
  ResponsiveDialogPrimitive.Content.displayName;

const ResponsiveDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className,
    )}
    {...props}
  />
);
ResponsiveDialogHeader.displayName = "ResponsiveDialogHeader";

const ResponsiveDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className,
    )}
    {...props}
  />
);
ResponsiveDialogFooter.displayName = "ResponsiveDialogFooter";

const ResponsiveDialogTitle = React.forwardRef<
  React.ElementRef<typeof ResponsiveDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ResponsiveDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ResponsiveDialogPrimitive.Title
    ref={ref}
    className={cn("font-semibold text-foreground text-lg", className)}
    {...props}
  />
));
ResponsiveDialogTitle.displayName = ResponsiveDialogPrimitive.Title.displayName;

const ResponsiveDialogDescription = React.forwardRef<
  React.ElementRef<typeof ResponsiveDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ResponsiveDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ResponsiveDialogPrimitive.Description
    ref={ref}
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
));
ResponsiveDialogDescription.displayName =
  ResponsiveDialogPrimitive.Description.displayName;

export {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogOverlay,
  ResponsiveDialogPortal,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
};
