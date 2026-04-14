'use client'

import { useState } from 'react'
import { User, Mail, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useI18n } from '@/components/LanguageProvider'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface ImmigrantRecord {
  id: string
  full_name: string
  email: string
  phone?: string | null
  nationality: string
  passport_number?: string | null
  date_of_birth?: string | null
  address_in_spain?: string | null
}

interface Props {
  immigrant: ImmigrantRecord
  userEmail: string
}

export default function ImmigrantSettingsClient({ immigrant, userEmail }: Props) {
  const supabase = createClient()
  const { messages } = useI18n()
  const t = messages.immigrantSettings

  const [fullName, setFullName] = useState(immigrant.full_name)
  const [phone, setPhone] = useState(immigrant.phone ?? '')
  const [nationality, setNationality] = useState(immigrant.nationality)
  const [passportNumber, setPassportNumber] = useState(immigrant.passport_number ?? '')
  const [dateOfBirth, setDateOfBirth] = useState(immigrant.date_of_birth ?? '')
  const [addressInSpain, setAddressInSpain] = useState(immigrant.address_in_spain ?? '')

  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setFeedback(null)

    const trimmed = {
      full_name: fullName.trim(),
      phone: phone.trim() || null,
      nationality: nationality.trim(),
      passport_number: passportNumber.trim() || null,
      date_of_birth: dateOfBirth.trim() || null,
      address_in_spain: addressInSpain.trim() || null,
    }

    const { error: immigrantError } = await supabase
      .from('immigrants')
      .update(trimmed)
      .eq('id', immigrant.id)

    if (immigrantError) {
      setFeedback({ type: 'error', message: t.errorMessage })
      setSaving(false)
      return
    }

    // Keep profiles table in sync for full_name
    await supabase
      .from('profiles')
      .update({ full_name: trimmed.full_name })
      .eq('user_id', immigrant.id)

    setFeedback({ type: 'success', message: t.successMessage })
    setSaving(false)
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t.title}</h1>
        <p className="text-slate-500 mt-1">{t.subtitle}</p>
      </div>

      {feedback && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            feedback.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal information */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <User className="w-4 h-4 text-brand-600" />
            <h2 className="font-semibold text-slate-900">{t.personalSection}</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label={t.fields.fullName}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t.placeholders.fullName}
              required
            />
            <Input
              label={t.fields.phone}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t.placeholders.phone}
              type="tel"
            />
            <Input
              label={t.fields.nationality}
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              placeholder={t.placeholders.nationality}
              required
            />
            <Input
              label={t.fields.passportNumber}
              value={passportNumber}
              onChange={(e) => setPassportNumber(e.target.value)}
              placeholder={t.placeholders.passportNumber}
            />
            <Input
              label={t.fields.dateOfBirth}
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              placeholder={t.placeholders.dateOfBirth}
              type="date"
            />
            <div className="sm:col-span-2">
              <Input
                label={t.fields.addressInSpain}
                value={addressInSpain}
                onChange={(e) => setAddressInSpain(e.target.value)}
                placeholder={t.placeholders.addressInSpain}
              />
            </div>
          </div>
        </div>

        {/* Account — read-only */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Mail className="w-4 h-4 text-brand-600" />
            <h2 className="font-semibold text-slate-900">{t.accountSection}</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {t.fields.email}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="email"
                value={userEmail}
                readOnly
                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500"
              />
              <Lock className="w-4 h-4 text-slate-300 flex-shrink-0" />
            </div>
            <p className="text-xs text-slate-400 mt-1.5">{t.emailNote}</p>
          </div>
        </div>

        <Button type="submit" loading={saving}>
          {saving ? t.saving : t.save}
        </Button>
      </form>
    </div>
  )
}
