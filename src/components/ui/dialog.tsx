import * as React from "react"
import { cn } from "@/lib/utils"

const Dialog = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { open?: boolean; onOpenChange?: (open: boolean) => void }>(
  ({ className, children, open, onOpenChange, ...props }, ref) => {
    if (!open) return null
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" {...props}>
        <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange?.(false)} />
        <div ref={ref} className={cn("relative bg-white rounded-lg shadow-lg max-w-lg w-full mx-4 p-6", className)}>
          {children}
        </div>
      </div>
    )
  }
)
Dialog.displayName = "Dialog"

const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props}>
      {children}
    </div>
  )
)
DialogContent.displayName = "DialogContent"

const DialogHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 mb-4", className)} {...props} />
  )
)
DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
  )
)
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-slate-500", className)} {...props} />
  )
)
DialogDescription.displayName = "DialogDescription"

const DialogFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex justify-end gap-2 mt-6", className)} {...props} />
  )
)
DialogFooter.displayName = "DialogFooter"

// AlertDialog aliases (same implementation as Dialog)
const AlertDialog = Dialog
const AlertDialogContent = DialogContent
const AlertDialogHeader = DialogHeader
const AlertDialogTitle = DialogTitle
const AlertDialogDescription = DialogDescription
const AlertDialogFooter = DialogFooter
const AlertDialogAction = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button ref={ref} className={cn("bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700", className)} {...props} />
  )
)
AlertDialogAction.displayName = "AlertDialogAction"
const AlertDialogCancel = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button ref={ref} className={cn("bg-slate-100 px-4 py-2 rounded-lg hover:bg-slate-200", className)} {...props} />
  )
)
AlertDialogCancel.displayName = "AlertDialogCancel"

export {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel
}
