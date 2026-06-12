"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon as CancelIconRaw } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"

// Custom Modal Variants
const customModalVariants = cva(
  "fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-2xl border bg-card text-card-foreground shadow-xl",
  {
    variants: {
      size: {
        sm: "max-w-sm",
        md: "max-w-lg", 
        lg: "max-w-2xl",
        xl: "max-w-4xl",
        full: "max-w-[95vw] w-[95vw]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

// Modal Props Interface
interface CustomModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title?: string
  description?: string
  children?: React.ReactNode
  showCloseButton?: boolean
  size?: VariantProps<typeof customModalVariants>["size"]
  footer?: React.ReactNode
  className?: string
}

// Custom Modal Component
const CustomModal = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  CustomModalProps
>(({
  open,
  onOpenChange,
  title,
  description,
  children,
  showCloseButton = true,
  size = "md",
  footer,
  className,
  ...props
}, ref) => {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Custom Overlay with backdrop blur effect */}
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/20 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          )}
        />
        
        {/* Custom Modal Content */}
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            customModalVariants({ size }),
            "p-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            "bg-gradient-to-br from-card via-card to-card/95 border-border/50 shadow-2xl",
            className
          )}
          {...props}
        >
          {/* Header with gradient background */}
          {(title || description || showCloseButton) && (
            <div className="relative flex items-start justify-between p-6 border-b border-border/30 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
              <div className="flex-1 pr-8">
                {title && (
                  <DialogPrimitive.Title className="text-xl font-semibold text-foreground mb-2">
                    {title}
                  </DialogPrimitive.Title>
                )}
                {description && (
                  <DialogPrimitive.Description className="text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </DialogPrimitive.Description>
                )}
              </div>
              
              {showCloseButton && (
                <DialogPrimitive.Close className="absolute right-4 top-4 rounded-lg opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none hover:bg-accent/50">
                  <HugeiconsIcon icon={CancelIconRaw} className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
              )}
            </div>
          )}

          {/* Content Area */}
          <div className="p-6">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end p-6 pt-0 border-t border-border/30">
              {footer}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
})
CustomModal.displayName = "CustomModal"

// Modal Trigger Component
const CustomModalTrigger = DialogPrimitive.Trigger

// Modal Close Component  
const CustomModalClose = DialogPrimitive.Close

// Modal Header Component (for custom content)
const CustomModalHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col gap-2 p-6 border-b border-border/30 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5",
      className
    )}
    {...props}
  />
))
CustomModalHeader.displayName = "CustomModalHeader"

// Modal Footer Component
const CustomModalFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col-reverse gap-3 sm:flex-row sm:justify-end p-6 pt-0 border-t border-border/30",
      className
    )}
    {...props}
  />
))
CustomModalFooter.displayName = "CustomModalFooter"

// Modal Title Component
const CustomModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-xl font-semibold text-foreground", className)}
    {...props}
  />
))
CustomModalTitle.displayName = "CustomModalTitle"

// Modal Description Component
const CustomModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground leading-relaxed", className)}
    {...props}
  />
))
CustomModalDescription.displayName = "CustomModalDescription"

export {
  CustomModal,
  CustomModalTrigger,
  CustomModalClose,
  CustomModalHeader,
  CustomModalFooter,
  CustomModalTitle,
  CustomModalDescription,
  type CustomModalProps
}

/*
 * USAGE EXAMPLES:
 * 
 * 1. Basic Modal:
 * 
 * <CustomModal
 *   title="Confirm Action"
 *   description="Are you sure you want to proceed with this action?"
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   footer={
 *     <>
 *       <CustomModalClose asChild>
 *         <Button variant="outline">Cancel</Button>
 *       </CustomModalClose>
 *       <CustomModalClose asChild>
 *         <Button>Confirm</Button>
 *       </CustomModalClose>
 *     </>
 *   }
 * >
 *   <p>This is the modal content area.</p>
 * </CustomModal>
 * 
 * 2. Modal with Custom Content:
 * 
 * <CustomModal size="lg" open={isOpen} onOpenChange={setIsOpen}>
 *   <CustomModalHeader>
 *     <CustomModalTitle>Custom Header</CustomModalTitle>
 *     <CustomModalDescription>
 *       This modal has a custom header layout
 *     </CustomModalDescription>
 *   </CustomModalHeader>
 *   
 *   <div className="p-6">
 *     <YourCustomComponent />
 *   </div>
 *   
 *   <CustomModalFooter>
 *     <Button variant="outline">Close</Button>
 *     <Button>Save Changes</Button>
 *   </CustomModalFooter>
 * </CustomModal>
 * 
 * 3. Trigger-based Modal:
 * 
 * <CustomModal>
 *   <CustomModalTrigger asChild>
 *     <Button>Open Modal</Button>
 *   </CustomModalTrigger>
 *   
 *   <CustomModalContent>
 *     <CustomModalHeader>
 *       <CustomModalTitle>Modal Title</CustomModalTitle>
 *     </CustomModalHeader>
 *     <div className="p-6">
 *       Modal content here
 *     </div>
 *   </CustomModalContent>
 * </CustomModal>
 * 
 * 4. Different Sizes:
 * 
 * <CustomModal size="sm">Small modal</CustomModal>
 * <CustomModal size="lg">Large modal</CustomModal>
 * <CustomModal size="full">Full width modal</CustomModal>
 * 
 * 5. Modal without close button:
 * 
 * <CustomModal 
 *   showCloseButton={false}
 *   title="No Close Button"
 *   description="User must use footer buttons to close"
 * >
 *   Content here
 * </CustomModal>
 */
