import { toast } from 'sonner'

export const SuccessToast = (message: string) => {
  return toast.success(message, {
    style: {
      '--normal-bg':
        'color-mix(in oklab, light-dark(var(--color-green-600), var(--color-green-400)) 10%, var(--background))',
      '--normal-text': 'light-dark(var(--color-green-600), var(--color-green-400))',
      '--normal-border': 'light-dark(var(--color-green-600), var(--color-green-400))',
    } as React.CSSProperties,
  })
}

export const InfoToast = (message: string) => {
  return toast.info(message, {
    style: {
      '--normal-bg':
        'color-mix(in oklab, light-dark(var(--color-sky-600), var(--color-sky-400)) 10%, var(--background))',
      '--normal-text': 'light-dark(var(--color-sky-600), var(--color-sky-400))',
      '--normal-border': 'light-dark(var(--color-sky-600), var(--color-sky-400))',
    } as React.CSSProperties,
  })
}

export const WarningToast = (message: string) => {
  return toast.warning(message, {
    style: {
      '--normal-bg':
        'color-mix(in oklab, light-dark(var(--color-amber-600), var(--color-amber-400)) 10%, var(--background))',
      '--normal-text': 'light-dark(var(--color-amber-600), var(--color-amber-400))',
      '--normal-border': 'light-dark(var(--color-amber-600), var(--color-amber-400))',
    } as React.CSSProperties,
  })
}

export const ErrorToast = (message: string) => {
  return toast.error(message, {
    style: {
      '--normal-bg': 'color-mix(in oklab, var(--destructive) 10%, var(--background))',
      '--normal-text': 'var(--destructive)',
      '--normal-border': 'var(--destructive)',
    } as React.CSSProperties,
  })
}
