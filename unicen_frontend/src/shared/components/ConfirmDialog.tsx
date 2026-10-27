import { LoaderCircle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import { Button } from '@/shared/components/ui/button'

interface ConfirmDialogProps {
  /** Whether the dialog is open. */
  isOpen: boolean
  /** Spanish title of the confirmation. */
  title: string
  /** Spanish explanation of what will happen. */
  description: string
  /** Label of the confirm button. */
  confirmLabel: string
  /** Disables the buttons while the action runs. */
  isPending: boolean
  /** Called when the user confirms. */
  onConfirm: () => void
  /** Called when the dialog should close. */
  onClose: () => void
}

/**
 * Confirmation dialog for destructive actions such as deleting a record.
 */
export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  isPending,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <Button variant="destructive" disabled={isPending} onClick={onConfirm}>
            {isPending && <LoaderCircle className="animate-spin" aria-hidden="true" />}
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
