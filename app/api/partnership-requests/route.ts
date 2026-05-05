import { NextRequest, NextResponse } from "next/server"
import { db } from "@/backend/db/config"
import { partnershipRequests } from "@/backend/db/schema"
import { getSessionUser, isAdminOrManager } from "@/backend/auth/session"
import { sendEmail } from "@/backend/services/email"
import { desc } from "drizzle-orm"

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user || user.userType !== "employee") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!isAdminOrManager(user.role)) {
    return NextResponse.json({ error: "Accès réservé aux managers et administrateurs" }, { status: 403 })
  }

  try {
    const requests = await db
      .select()
      .from(partnershipRequests)
      .orderBy(desc(partnershipRequests.createdAt))
    return NextResponse.json({ requests })
  } catch (error) {
    console.error("Error fetching partnership requests:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.companyName || !body.contactFirstName || !body.contactLastName || !body.contactEmail || !body.category) {
      return NextResponse.json(
        { error: "Les champs nom entreprise, prénom, nom, email et catégorie sont requis" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.contactEmail)) {
      return NextResponse.json({ error: "Format d'email invalide" }, { status: 400 })
    }

    // Validate category
    const validCategories = ["customer", "marketing", "supplier", "university"]
    if (!validCategories.includes(body.category)) {
      return NextResponse.json({ error: "Catégorie invalide" }, { status: 400 })
    }

    const [result] = await db
      .insert(partnershipRequests)
      .values({
        companyName: body.companyName,
        legalName: body.legalName || null,
        contactFirstName: body.contactFirstName,
        contactLastName: body.contactLastName,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone || null,
        contactRole: body.contactRole || null,
        website: body.website || null,
        description: body.description || null,
        country: body.country || null,
        address: body.address || null,
        numEmployees: body.numEmployees ? Number(body.numEmployees) : null,
        annualRevenue: body.annualRevenue || null,
        category: body.category,
        partnerSubcategory: body.partnerSubcategory || null,
        partnershipLevel: body.partnershipLevel || null,
        motivations: body.motivations || null,
        universityData: body.universityData || null,
        technologyData: body.technologyData || null,
        status: "en_attente",
      })
      .returning()

    // Send notification email to admin
    const categoryLabels: Record<string, string> = {
      customer: "Client",
      marketing: "Marketing",
      supplier: "Fournisseur Technologique",
      university: "Universitaire",
    }

    await sendEmail({
      subject: `🤝 Nouvelle demande de partenariat - ${body.companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0070AD 0%, #00A3E0 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Nouvelle Demande de Partenariat</h1>
          </div>
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e9ecef;">
            <h2 style="color: #0070AD; margin-top: 0;">📋 Détails de la demande</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #666;">Entreprise :</td><td style="padding: 8px 0; font-weight: bold;">${body.companyName}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Contact :</td><td style="padding: 8px 0;">${body.contactFirstName} ${body.contactLastName}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Email :</td><td style="padding: 8px 0;"><a href="mailto:${body.contactEmail}">${body.contactEmail}</a></td></tr>
              ${body.contactPhone ? `<tr><td style="padding: 8px 0; color: #666;">Téléphone :</td><td style="padding: 8px 0;">${body.contactPhone}</td></tr>` : ""}
              <tr><td style="padding: 8px 0; color: #666;">Catégorie :</td><td style="padding: 8px 0;"><span style="background: #0070AD; color: white; padding: 4px 12px; border-radius: 20px; font-size: 13px;">${categoryLabels[body.category] || body.category}</span></td></tr>
              ${body.country ? `<tr><td style="padding: 8px 0; color: #666;">Pays :</td><td style="padding: 8px 0;">${body.country}</td></tr>` : ""}
              ${body.numEmployees ? `<tr><td style="padding: 8px 0; color: #666;">Employés :</td><td style="padding: 8px 0;">${body.numEmployees}</td></tr>` : ""}
            </table>

            ${body.motivations ? `<div style="margin-top: 20px; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #0070AD;"><strong>Motivations :</strong><br/>${body.motivations}</div>` : ""}

            <div style="margin-top: 24px; text-align: center;">
              <a href="http://localhost:3000/dashboard/partnership-requests" style="display: inline-block; background: #0070AD; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                Voir la demande dans le dashboard
              </a>
            </div>

            <p style="margin-top: 20px; color: #999; font-size: 12px; text-align: center;">
              Cet email a été envoyé automatiquement par la plateforme IntelliConnect — Capgemini Tunisie
            </p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ request: result }, { status: 201 })
  } catch (error) {
    console.error("Error creating partnership request:", error)
    return NextResponse.json({ error: "Erreur lors de la soumission" }, { status: 500 })
  }
}
