'use client'

import { useState } from 'react'
import { Briefcase, Eye, Mail, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useI18n } from '@/components/LanguageProvider'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface LawyerRecord {
  id: string
  user_id: string
  full_name: string
  email: string
  phone?: string | null
  license_number: string
  specialization?: string | null
  bar_association?: string | null
  bio?: string | null
  is_active: boolean
}

interface Props {
  lawyer: LawyerRecord
  userEmail: string
}

export default function LawyerSettingsClient({ lawyer, userEmail }: Props) {
  const supabase = createClient()
  const { messages } = useI18n()
  const t = messages.lawyerSettings

  const [fullName, setFullName] = useState(lawyer.full_name)
  const [phone, setPhone] = useState(lawyer.phone ?? '')
  const [licenseNumber, setLicenseNumber] = useState(lawyer.license_number)
  const [specialization, setSpecialization] = useState(lawyer.specialization ?? '')
  const [barAssociation, setBarAssociation] = useState(lawyer.bar_association ?? '')
  const [bio, setBio] = useState(lawyer.bio ?? '')
  const [isActive, setIsActive] = useState(lawyer.is_active)

  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setFeedback(null)

    const trimmed = {
      full_name: fullName.trim(),
      phone: phone.trim() || null,
      license_number: licenseNumber.trim(),
      specialization: specialization.trim() || null,
      bar_association: barAssociation.trim() || null,
      bio: bio.trim() || null,
      is_active: isActive,
    }

    const { error: lawyerError } = await supabase
      .from('lawyers')
      .update(trimmed)
      .eq('id', lawyer.id)

    if (lawyerError) {
      setFeedback({ type: 'error', message: t.errorMessage })
      setSaving(false)
      return
    }

    // Keep profiles table in sync for full_name
    await supabase
      .from('profiles')
      .update({ full_name: trimmed.full_name })
      .eq('user_id', lawyer.user_id)

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
        {/* Professional profile */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Briefcase className="w-4 h-4 text-brand-600" />
            <h2 className="font-semibold text-slate-900">{t.professionalSection}</h2>
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
              label={t.fields.licenseNumber}
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              placeholder={t.placeholders.licenseNumber}
              required
            />
            <Input
              label={t.fields.specialization}
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder={t.placeholders.specialization}
            />
            <div className="sm:col-span-2">
              <Input
                label={t.fields.barAssociation}
                value={barAssociation}
                onChange={(e) => setBarAssociation(e.target.value)}
                placeholder={t.placeholders.barAssociation}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t.fields.bio}
              </label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={t.placeholders.bio}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Visibility */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Eye className="w-4 h-4 text-brand-600" />
            <h2 className="font-semibold text-slate-900">{t.visibilitySection}</h2>
          </div>

          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-11 h-6 rounded-full transition-colors ${
                  isActive ? 'bg-brand-600' : 'bg-slate-200'
                }`}
              />
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  isActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-900">{t.fields.isActive}</div>
              <div className="text-xs text-slate-400 mt-0.5">{t.isActiveNote}</div>
            </div>
          </label>
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
