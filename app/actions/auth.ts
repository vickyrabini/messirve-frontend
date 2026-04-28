'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type AuthState = { error: string | null; success?: boolean }

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidEmail(email: string): boolean {
  return emailRegex.test(email)
}

export async function login(_state: AuthState, formData: FormData): Promise<AuthState> {
  const email = (formData.get('email') as string).trim()
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email y contraseña son requeridos' }
  }

  if (!isValidEmail(email)) {
    return { error: 'El formato del email es inválido' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message === 'Email not confirmed') {
      return { error: 'Debes confirmar tu email antes de iniciar sesión' }
    }
    return { error: 'Email o contraseña incorrectos' }
  }

  redirect('/dashboard')
}

export async function register(_state: AuthState, formData: FormData): Promise<AuthState> {
  const email = (formData.get('email') as string).trim()
  const password = formData.get('password') as string
  const fullName = (formData.get('fullName') as string).trim()

  if (!email || !password || !fullName) {
    return { error: 'Todos los campos son requeridos' }
  }

  if (!isValidEmail(email)) {
    return { error: 'El formato del email es inválido' }
  }

  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Este email ya está registrado' }
    }
    if (error.message.toLowerCase().includes('rate limit') || error.message.includes('over_email_send_rate_limit')) {
      return { error: 'Demasiados intentos de registro. Espera unos minutos e intenta de nuevo.' }
    }
    return { error: 'No se pudo completar el registro. Intentá de nuevo.' }
  }

  // Sign out immediately — user must confirm their email before logging in
  await supabase.auth.signOut()

  return { error: null, success: true }
}

export async function forgotPassword(_state: AuthState, formData: FormData): Promise<AuthState> {
  const email = (formData.get('email') as string).trim()

  if (!email) {
    return { error: 'El email es requerido' }
  }

  if (!isValidEmail(email)) {
    return { error: 'El formato del email es inválido' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
  })

  if (error) {
    return { error: 'No se pudo enviar el email. Intentá de nuevo.' }
  }

  return { error: null, success: true }
}

export async function resetPassword(_state: AuthState, formData: FormData): Promise<AuthState> {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || !confirmPassword) {
    return { error: 'Todos los campos son requeridos' }
  }

  if (password !== confirmPassword) {
    return { error: 'Las contraseñas no coinciden' }
  }

  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: 'No se pudo actualizar la contraseña. El enlace puede haber expirado.' }
  }

  redirect('/dashboard')
}

export async function logout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
