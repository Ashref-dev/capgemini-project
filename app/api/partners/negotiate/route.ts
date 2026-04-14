import { NextRequest, NextResponse } from "next/server"
import { db } from "@/backend/db/config"
import { partners, partnerStatusHistory } from "@/backend/db/schema"
import { getSessionUser } from "@/backend/auth/session"
import { eq } from "drizzle-orm"
import { sendEmail } from "@/backend/services/email"

// GET /api/partners/negotiate — List partners in negotiation
export async function GET(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user || user.userType !== "employee") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const negotiating = await db
      .select()
      .from(partners)
      .where(eq(partners.partnershipStatus, "en_negociation"))

    return NextResponse.json({ partners: negotiating })
  } catch (error) {
    console.error("Error fetching negotiation partners:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST /api/partners/negotiate — Commercial decides on partner
export async function POST(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user || user.userType !== "employee") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const allowedRoles = ["commercial", "admin", "manager"]
  if (!allowedRoles.includes(user.role || "")) {
    return NextResponse.json(
      { error: "Accès réservé aux commerciaux" },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { partnerId, action, reason } = body

    if (!partnerId || !action || !["activate", "terminate"].includes(action)) {
      return NextResponse.json(
        { error: "partnerId et action (activate/terminate) sont requis" },
        { status: 400 }
      )
    }

    // Fetch the partner
    const [partner] = await db
      .select()
      .from(partners)
      .where(eq(partners.id, Number(partnerId)))

    if (!partner) {
      return NextResponse.json({ error: "Partenaire introuvable" }, { status: 404 })
    }

    if (partner.partnershipStatus !== "en_negociation") {
      return NextResponse.json(
        { error: "Ce partenaire n'est pas en phase de négociation" },
        { status: 400 }
      )
    }

    const newStatus = action === "activate" ? "actif" : "termine"

    // Update partner status
    const [updatedPartner] = await db
      .update(partners)
      .set({
        partnershipStatus: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(partners.id, Number(partnerId)))
      .returning()

    // Record status change
    await db.insert(partnerStatusHistory).values({
      partnerId: Number(partnerId),
      oldStatus: "en_negociation",
      newStatus,
      changeReason: reason || (action === "activate"
        ? "Négociation commerciale réussie"
        : "Négociation commerciale non aboutie"),
      changedBy: user.name || user.email,
    })

    const categoryLabels: Record<string, string> = {
      customer: "Client",
      marketing: "Marketing",
      supplier: "Fournisseur Technologique",
      university: "Universitaire",
    }

    // Send email to partner
    if (action === "activate") {
      await sendEmail({
        to: partner.email || undefined,
        subject: `🎉 Bienvenue chez Capgemini Tunisie — Partenariat activé !`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #0070AD 0%, #00A3E0 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Félicitations !</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Votre partenariat est maintenant actif</p>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e9ecef;">
              <p style="font-size: 16px; color: #333;">Cher partenaire,</p>
              
              <p style="color: #555;">Nous avons le plaisir de vous confirmer que la négociation commerciale pour <strong>${partner.name}</strong> (${categoryLabels[partner.categories || ""] || partner.categories}) a abouti avec succès.</p>

              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
                <h3 style="color: #22c55e; margin: 0 0 15px 0;">✅ Partenariat activé</h3>
                <p style="color: #555;">Votre partenariat avec Capgemini Tunisie est désormais <strong>pleinement actif</strong>. Vous avez accès à toutes les fonctionnalités de votre espace partenaire.</p>
              </div>

              <div style="text-align: center; margin-top: 24px;">
                <a href="http://localhost:3000/auth/sign-in" style="display: inline-block; background: #0070AD; color: white; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                  Accéder à mon espace partenaire
                </a>
              </div>

              <p style="margin-top: 30px; color: #555;">
                Bienvenue dans l'écosystème Capgemini Tunisie !<br/>
                <strong>L'équipe Capgemini Tunisie</strong>
              </p>

              <p style="margin-top: 20px; color: #999; font-size: 12px; text-align: center; border-top: 1px solid #e9ecef; padding-top: 15px;">
                Cet email a été envoyé automatiquement par la plateforme IntelliConnect — Capgemini Tunisie
              </p>
            </div>
          </div>
        `,
      })
    } else {
      await sendEmail({
        to: partner.email || undefined,
        subject: `Capgemini Tunisie — Résultat de la négociation`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #0070AD 0%, #00A3E0 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Capgemini Tunisie</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Résultat de la négociation commerciale</p>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e9ecef;">
              <p style="font-size: 16px; color: #333;">Cher partenaire,</p>
              
              <p style="color: #555;">Nous vous remercions pour le temps consacré aux discussions concernant le partenariat <strong>${partner.name}</strong>.</p>

              <p style="color: #555;">Après examen, la négociation commerciale <strong>n'a pas abouti</strong> pour le moment.</p>

              ${reason ? `
              <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
                <strong>Note :</strong><br/>
                <span style="color: #666;">${reason}</span>
              </div>
              ` : ""}

              <p style="color: #555;">Cette décision ne remet pas en cause la qualité de votre entreprise. N'hésitez pas à nous recontacter à l'avenir.</p>

              <p style="margin-top: 20px; color: #555;">
                Cordialement,<br/>
                <strong>L'équipe Partenariats — Capgemini Tunisie</strong>
              </p>

              <p style="margin-top: 20px; color: #999; font-size: 12px; text-align: center; border-top: 1px solid #e9ecef; padding-top: 15px;">
                Cet email a été envoyé automatiquement par la plateforme IntelliConnect — Capgemini Tunisie
              </p>
            </div>
          </div>
        `,
      })
    }

    return NextResponse.json({
      partner: updatedPartner,
      message: action === "activate"
        ? "Partenariat activé avec succès"
        : "Négociation terminée",
    })
  } catch (error) {
    console.error("Error processing negotiation:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
