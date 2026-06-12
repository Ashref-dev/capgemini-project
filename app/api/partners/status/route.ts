import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/server/db/config"
import { partners, partnerStatusHistory } from "@/lib/server/db/schema"
import { getSessionUser, isAdminOrManager } from "@/lib/server/auth/session"
import { eq } from "drizzle-orm"
import { sendEmail } from "@/lib/server/services/email"

// POST /api/partners/status — Change partner status (suspend/reactivate)
export async function POST(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user || user.userType !== "employee") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!isAdminOrManager(user.role)) {
    return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { partnerId, action, reason } = body as {
      partnerId: number
      action: "suspend" | "reactivate"
      reason: string
    }

    if (!partnerId || !action || !reason) {
      return NextResponse.json(
        { error: "partnerId, action et reason sont requis" },
        { status: 400 }
      )
    }

    if (!["suspend", "reactivate"].includes(action)) {
      return NextResponse.json(
        { error: "Action invalide. Utilisez 'suspend' ou 'reactivate'" },
        { status: 400 }
      )
    }

    // Fetch the partner
    const partner = await db.query.partners.findFirst({
      where: eq(partners.id, partnerId),
    })

    if (!partner) {
      return NextResponse.json({ error: "Partenaire introuvable" }, { status: 404 })
    }

    const oldStatus = partner.partnershipStatus || "actif"
    const newStatus = action === "suspend" ? "inactif" : "actif"

    if (action === "suspend" && oldStatus === "inactif") {
      return NextResponse.json(
        { error: "Ce partenaire est déjà suspendu" },
        { status: 400 }
      )
    }
    if (action === "reactivate" && oldStatus === "actif") {
      return NextResponse.json(
        { error: "Ce partenaire est déjà actif" },
        { status: 400 }
      )
    }

    // Update partner status
    await db
      .update(partners)
      .set({
        partnershipStatus: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(partners.id, partnerId))

    // Insert history record
    await db.insert(partnerStatusHistory).values({
      partnerId,
      oldStatus,
      newStatus,
      changeReason: reason,
      changedBy: user.name || user.email,
      changedAt: new Date(),
    })

    // Send email notification to partner
    const actionLabel = action === "suspend" ? "Suspension" : "Réactivation"
    const statusLabel = action === "suspend" ? "suspendu" : "réactivé"

    const emailHtml = action === "suspend"
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ ${actionLabel} de partenariat</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Capgemini Tunisie — IntelliConnect</p>
          </div>
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e9ecef;">
            <p style="font-size: 16px; color: #333;">Cher partenaire <strong>${partner.name}</strong>,</p>
            
            <p style="color: #555;">Nous vous informons que votre partenariat avec Capgemini Tunisie a été <strong style="color: #dc3545;">temporairement suspendu</strong>.</p>

            <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
              <strong>Motif de la suspension :</strong><br/>
              <span style="color: #666;">${reason}</span>
            </div>

            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <strong>📅 Prochaines étapes :</strong>
              <p style="color: #555; margin: 8px 0 0 0;">Une réunion sera planifiée dans les prochains jours pour discuter des conditions de réactivation de votre partenariat. Notre équipe vous contactera pour convenir d'une date.</p>
            </div>

            <p style="color: #555;">
              Pour toute question, n'hésitez pas à contacter notre équipe partenariats.<br/>
              <strong>L'équipe Capgemini Tunisie</strong>
            </p>

            <p style="margin-top: 20px; color: #999; font-size: 12px; text-align: center; border-top: 1px solid #e9ecef; padding-top: 15px;">
              Cet email a été envoyé automatiquement par la plateforme IntelliConnect
            </p>
          </div>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">✅ ${actionLabel} de partenariat</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Capgemini Tunisie — IntelliConnect</p>
          </div>
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e9ecef;">
            <p style="font-size: 16px; color: #333;">Cher partenaire <strong>${partner.name}</strong>,</p>
            
            <p style="color: #555;">Nous avons le plaisir de vous informer que votre partenariat avec Capgemini Tunisie a été <strong style="color: #28a745;">réactivé</strong>.</p>

            <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <strong>Motif de la réactivation :</strong><br/>
              <span style="color: #666;">${reason}</span>
            </div>

            <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <strong>📅 Prochaines étapes :</strong>
              <p style="color: #555; margin: 8px 0 0 0;">Une réunion de reprise sera planifiée pour vous présenter les évolutions récentes et redéfinir les objectifs de notre partenariat. Notre équipe vous contactera sous 48h.</p>
            </div>

            <div style="text-align: center; margin-top: 24px;">
              <a href="http://localhost:3000/auth/sign-in" style="display: inline-block; background: #28a745; color: white; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                Accéder à mon espace partenaire
              </a>
            </div>

            <p style="margin-top: 20px; color: #555;">
              Nous sommes ravis de poursuivre notre collaboration !<br/>
              <strong>L'équipe Capgemini Tunisie</strong>
            </p>

            <p style="margin-top: 20px; color: #999; font-size: 12px; text-align: center; border-top: 1px solid #e9ecef; padding-top: 15px;">
              Cet email a été envoyé automatiquement par la plateforme IntelliConnect
            </p>
          </div>
        </div>
      `

    await sendEmail({
      to: partner.email || undefined,
      subject: `Capgemini Tunisie — ${actionLabel} de votre partenariat`,
      html: emailHtml,
    })

    return NextResponse.json({
      message: `Partenaire ${statusLabel} avec succès`,
      partner: { id: partner.id, name: partner.name, status: newStatus },
    })
  } catch (error) {
    console.error("Error changing partner status:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
