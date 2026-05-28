'use client'

import * as React from 'react'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@workspace/ui/components/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@workspace/ui/components/field'
import { Input } from '@workspace/ui/components/input'

import { authClient } from '@workspace/auth/client'
import { ErrorToast, SuccessToast } from '@/lib/toast'

const formSchema = z.object({
  email: z.string().email('Email must be valid.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(32, 'Description must be at most 32 characters.'),
})

export const LoginForm = () => {
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
          callbackURL: '/',
          rememberMe: false,
        },
        {
          onError: (ctx) => {
            console.log(ctx)
            ErrorToast(ctx.error.message)
          },
          onSuccess: () => {
            SuccessToast('Successfully signed in.')
          },
        }
      )
    },
  })

  return (
    <div className="w-full">
      <form
        id="login-form"
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <FieldGroup>
          <form.Field name="email">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="john@doe.com"
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          </form.Field>
          <form.Field name="password">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    type="password"
                    placeholder="Most secure password..."
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
        <Button type="submit" form="login-form" size="lg" className="mt-6 w-full">
          Submit
        </Button>
      </Field>
    </div>
  )
}
