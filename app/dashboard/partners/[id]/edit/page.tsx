"use client"

import { useState, useEffect, use } from "react"
import { useAuth } from "@/frontend/hooks/use-auth"
import { PartnerForm } from "@/frontend/components/dashboard/partner-form"
import { Spinner } from "@/frontend/components/ui/spinner"

export default function EditPartnerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const [partner, setPartner] = useState<Record<string, string | number | null> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPartner() {
      try {
        const res = await fetch(`/api/partners/manage/${id}`)
        const data = await res.json()
        if (res.ok) {
          setPartner(data.partner)
        }
      } catch {
        // handled by form
      } finally {
        setLoading(false)
      }
    }
    fetchPartner()
  }, [id])

  if (!user) return null

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  if (!partner) {
    return <div className="text-center py-12 text-muted-foreground">Partenaire non trouvé</div>
  }

  return <PartnerForm initialData={partner} isEdit />
}
