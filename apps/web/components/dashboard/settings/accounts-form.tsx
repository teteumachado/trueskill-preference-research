'use client'

import * as React from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'

import { Button } from '@workspace/ui/components/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@workspace/ui/components/field'
import { Input } from '@workspace/ui/components/input'

import { authClient } from '@workspace/auth/client'
import { ErrorToast, SuccessToast } from '@/lib/toast'

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Name must be at least 3 characters')
    .max(60, 'Name must be at most 60 characters'),
})

export const UpdateUserForm = () => {
  const { data: session } = authClient.useSession()

  const form = useForm({
    defaultValues: {
      name: session?.user.name || '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      await authClient.updateUser(
        {
          name: value.name,
        },
        {
          onError: (ctx) => {
            ErrorToast(ctx.error.message)
          },
          onSuccess: () => {
            SuccessToast('Profile edited.')
          },
        }
      )
    },
  })

  return (
    <div className="w-full">
      <form
        id="update-user-form"
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <FieldGroup>
          <form.Field name="name">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Nome</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="John Doe"
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          </form.Field>

        </FieldGroup>
      </form>
      <Field orientation="horizontal">
        <Button type="submit" form="update-user-form" size="lg" className="mt-6 w-full">
          Edit profile
        </Button>
      </Field>
    </div>
  )
}
