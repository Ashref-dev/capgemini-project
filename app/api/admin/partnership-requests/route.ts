import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/server/db/config"
import {
  partnershipRequests,
  partners,
  universityPartners,
  technologyPartners,
  partnerStatusHistory,
  capgeminiEmployees,
} from "@/lib/server/db/schema"
import { analyzePartnershipRequest, type PartnershipRequestScoringInput } from "@/lib/server/ai/partnership-request-scoring"
import { getSessionUser, isAdminOrManager } from "@/lib/server/auth/session"
import { eq, desc, sql } from "drizzle-orm"
import { sendEmail } from "@/lib/server/services/email"
import bcrypt from "bcryptjs"

// GET /api/admin/partnership-requests — List all partnership requests (admin only)
export async function GET(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user || user.userType !== "employee") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!isAdminOrManager(user.role)) {
    return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get("status")

    let requests
    if (statusFilter && ["en_attente", "acceptee", "refusee"].includes(statusFilter)) {
      requests = await db
        .select()
        .from(partnershipRequests)
        .where(eq(partnershipRequests.status, statusFilter as "en_attente" | "acceptee" | "refusee"))
        .orderBy(desc(partnershipRequests.createdAt))
    } else {
      requests = await db
        .select()
        .from(partnershipRequests)
        .orderBy(desc(partnershipRequests.createdAt))
    }

    // Counts
    const [counts] = await db
      .select({
        total: sql<number>`count(*)::int`,
        pending: sql<number>`count(*) filter (where status = 'en_attente')::int`,
        accepted: sql<number>`count(*) filter (where status = 'acceptee')::int`,
        rejected: sql<number>`count(*) filter (where status = 'refusee')::int`,
      })
      .from(partnershipRequests)

    const requestsWithAnalysis = requests.map((partnershipRequest) => {
      const scoringInput: PartnershipRequestScoringInput = {
        companyName: partnershipRequest.companyName,
        legalName: partnershipRequest.legalName,
        contactEmail: partnershipRequest.contactEmail,
        contactPhone: partnershipRequest.contactPhone,
        contactRole: partnershipRequest.contactRole,
        website: partnershipRequest.website,
        description: partnershipRequest.description,
        country: partnershipRequest.country,
        address: partnershipRequest.address,
        numEmployees: partnershipRequest.numEmployees,
        annualRevenue: partnershipRequest.annualRevenue,
        category: partnershipRequest.category,
        partnerSubcategory: partnershipRequest.partnerSubcategory,
        partnershipLevel: partnershipRequest.partnershipLevel,
        motivations: partnershipRequest.motivations,
        universityData: (partnershipRequest.universityData as Record<string, unknown> | null) || null,
        technologyData: (partnershipRequest.technologyData as Record<string, unknown> | null) || null,
      }

      return {
        ...partnershipRequest,
        aiAnalysis: analyzePartnershipRequest(scoringInput),
      }
    })

    return NextResponse.json({ requests: requestsWithAnalysis, counts })
  } catch (error) {
    console.error("Error fetching partnership requests:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// PUT /api/admin/partnership-requests — Accept or reject a request
export async function PUT(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user || user.userType !== "employee") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!isAdminOrManager(user.role)) {
    return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { requestId, action, rejectionReason } = body

    if (!requestId || !action || !["accept", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "requestId et action (accept/reject) sont requis" },
        { status: 400 }
      )
    }

    // Fetch the request
    const [req] = await db
      .select()
      .from(partnershipRequests)
      .where(eq(partnershipRequests.id, Number(requestId)))

    if (!req) {
      return NextResponse.json({ error: "Demande introuvable" }, { status: 404 })
    }
    if (req.status !== "en_attente") {
      return NextResponse.json(
        { error: "Cette demande a déjà été traitée" },
        { status: 400 }
      )
    }

    const categoryLabels: Record<string, string> = {
      customer: "Client",
      marketing: "Marketing",
      supplier: "Fournisseur Technologique",
      university: "Universitaire",
    }

    if (action === "accept") {
      // Generate a temporary password for the new partner
      const tempPassword = `Partner${new Date().getFullYear()}!`
      const passwordHash = await bcrypt.hash(tempPassword, 10)

      // Create the partner in the partners table
      const [newPartner] = await db
        .insert(partners)
        .values({
          categories: req.category,
          name: req.companyName,
          legalName: req.legalName || null,
          website: req.website || null,
          email: req.contactEmail,
          phone: req.contactPhone || null,
          address: req.address || null,
          description: req.description || null,
          partnerSubcategory: req.partnerSubcategory || null,
          partnershipLevel: req.partnershipLevel || "Standard",
          partnershipStartDate: new Date().toISOString().split("T")[0],
          partnershipStatus: "en_negociation",
          numEmployees: req.numEmployees || null,
          country: req.country || null,
          passwordHash,
        })
        .returning()

      // Create subtype record if university or supplier
      if (req.category === "university") {
        const uniData = (req.universityData as Record<string, unknown>) || {}
        await db.insert(universityPartners).values({
          partnerId: newPartner.id,
          institutionType: (uniData.institutionType as string) || null,
          numStudents: uniData.numStudents ? Number(uniData.numStudents) : null,
          specialties: (uniData.specialties as string[]) || null,
          numInternsPerYear: uniData.numInternsPerYear ? Number(uniData.numInternsPerYear) : null,
          numApprenticesPerYear: uniData.numApprenticesPerYear ? Number(uniData.numApprenticesPerYear) : null,
          numHiresPerYear: uniData.numHiresPerYear ? Number(uniData.numHiresPerYear) : null,
        })
      } else if (req.category === "supplier") {
        const techData = (req.technologyData as Record<string, unknown>) || {}
        await db.insert(technologyPartners).values({
          partnerId: newPartner.id,
          vendorType: (techData.vendorType as string) || null,
          technologies: (techData.technologies as string[]) || null,
          certificationsHeld: techData.certificationsHeld ? Number(techData.certificationsHeld) : null,
          certificationLevel: (techData.certificationLevel as string) || null,
          partnershipModel: (techData.partnershipModel as string) || null,
        })
      }

      // Update the request
      const [updatedReq] = await db
        .update(partnershipRequests)
        .set({
          status: "acceptee",
          isAccepted: true,
          reviewedBy: Number(user.sub),
          reviewedAt: new Date(),
          createdPartnerId: newPartner.id,
          updatedAt: new Date(),
        })
        .where(eq(partnershipRequests.id, Number(requestId)))
        .returning()

      // Record status history
      await db.insert(partnerStatusHistory).values({
        partnerId: newPartner.id,
        oldStatus: "prospect",
        newStatus: "en_negociation",
        changeReason: "Demande de partenariat acceptée par l'administration",
        changedBy: user.name || user.email,
      })

      // Send email to the new partner — negotiation phase
      await sendEmail({
        to: req.contactEmail,
        subject: `Capgemini Tunisie — Votre demande de partenariat avance !`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #0070AD 0%, #00A3E0 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">📋 Demande acceptée</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Votre dossier passe en phase de négociation</p>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e9ecef;">
              <p style="font-size: 16px; color: #333;">Cher(e) ${req.contactFirstName} ${req.contactLastName},</p>
              
              <p style="color: #555;">Nous avons le plaisir de vous informer que votre demande de partenariat <strong>${categoryLabels[req.category] || req.category}</strong> pour <strong>${req.companyName}</strong> a été validée par notre administration.</p>

              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <h3 style="color: #f59e0b; margin: 0 0 15px 0;">🤝 Phase de négociation</h3>
                <p style="color: #555; line-height: 1.6;">Votre dossier est maintenant en phase de <strong>négociation commerciale</strong>. Un commercial Capgemini va examiner votre dossier et vous contactera prochainement pour discuter des modalités du partenariat.</p>
              </div>

              <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <strong>🔑 Vos identifiants de connexion :</strong><br/>
                <span style="color: #666;">Email : </span><strong>${req.contactEmail}</strong><br/>
                <span style="color: #666;">Mot de passe : </span><strong>${tempPassword}</strong><br/>
                <span style="color: #999; font-size: 12px;">(Vous pouvez dès maintenant accéder à votre espace pour suivre l'avancement)</span>
              </div>

              <div style="text-align: center; margin-top: 24px;">
                <a href="http://localhost:3000/auth/sign-in" style="display: inline-block; background: #0070AD; color: white; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                  Accéder à mon espace
                </a>
              </div>

              <p style="margin-top: 30px; color: #555;">
                Nous vous recontacterons très bientôt !<br/>
                <strong>L'équipe Capgemini Tunisie</strong>
              </p>

              <p style="margin-top: 20px; color: #999; font-size: 12px; text-align: center; border-top: 1px solid #e9ecef; padding-top: 15px;">
                Cet email a été envoyé automatiquement par la plateforme IntelliConnect — Capgemini Tunisie
              </p>
            </div>
          </div>
        `,
      })

      // Notify all commercial employees about the new partner to negotiate
      const commercials = await db
        .select()
        .from(capgeminiEmployees)
        .where(eq(capgeminiEmployees.role, "commercial"))

      for (const commercial of commercials) {
        await sendEmail({
          to: commercial.email,
          subject: `🔔 Nouveau partenaire en négociation — ${req.companyName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #0070AD 0%, #00A3E0 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">🔔 Nouveau partenaire</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Une négociation commerciale vous attend</p>
              </div>
              <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e9ecef;">
                <p style="font-size: 16px; color: #333;">Bonjour ${commercial.firstName},</p>
                
                <p style="color: #555;">Un nouveau partenaire a été validé par l'administration et est en attente de négociation commerciale.</p>

                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0070AD;">
                  <h3 style="color: #0070AD; margin: 0 0 10px 0;">Détails du partenaire</h3>
                  <p style="color: #555; margin: 5px 0;"><strong>Entreprise :</strong> ${req.companyName}</p>
                  <p style="color: #555; margin: 5px 0;"><strong>Catégorie :</strong> ${categoryLabels[req.category] || req.category}</p>
                  <p style="color: #555; margin: 5px 0;"><strong>Contact :</strong> ${req.contactFirstName} ${req.contactLastName}</p>
                  <p style="color: #555; margin: 5px 0;"><strong>Email :</strong> ${req.contactEmail}</p>
                  ${req.description ? `<p style="color: #555; margin: 5px 0;"><strong>Description :</strong> ${req.description}</p>` : ""}
                </div>

                <p style="color: #555;">Veuillez vous connecter à votre espace pour traiter cette négociation.</p>

                <div style="text-align: center; margin-top: 24px;">
                  <a href="http://localhost:3000/dashboard/profile" style="display: inline-block; background: #0070AD; color: white; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                    Accéder à mon espace
                  </a>
                </div>

                <p style="margin-top: 20px; color: #999; font-size: 12px; text-align: center; border-top: 1px solid #e9ecef; padding-top: 15px;">
                  Cet email a été envoyé automatiquement par la plateforme IntelliConnect — Capgemini Tunisie
                </p>
              </div>
            </div>
          `,
        })
      }

      return NextResponse.json({
        request: updatedReq,
        partner: newPartner,
        message: "Demande acceptée, partenaire créé en négociation, emails envoyés",
      })
    } else {
      // REJECT
      const [updatedReq] = await db
        .update(partnershipRequests)
        .set({
          status: "refusee",
          isAccepted: false,
          reviewedBy: Number(user.sub),
          reviewedAt: new Date(),
          rejectionReason: rejectionReason || null,
          updatedAt: new Date(),
        })
        .where(eq(partnershipRequests.id, Number(requestId)))
        .returning()

      // Send rejection email
      await sendEmail({
        to: req.contactEmail,
        subject: `Capgemini Tunisie — Résultat de votre demande de partenariat`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #0070AD 0%, #00A3E0 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Capgemini Tunisie</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Résultat de votre demande de partenariat</p>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e9ecef;">
              <p style="font-size: 16px; color: #333;">Cher(e) ${req.contactFirstName} ${req.contactLastName},</p>
              
              <p style="color: #555;">Nous vous remercions pour l'intérêt que vous portez à Capgemini Tunisie et pour votre demande de partenariat <strong>${categoryLabels[req.category] || req.category}</strong> pour <strong>${req.companyName}</strong>.</p>

              <p style="color: #555;">Après examen attentif de votre dossier, nous avons le regret de vous informer que <strong>votre demande n'a pas été retenue</strong> pour le moment.</p>

              ${rejectionReason ? `
              <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
                <strong>Motif :</strong><br/>
                <span style="color: #666;">${rejectionReason}</span>
              </div>
              ` : ""}

              <p style="color: #555;">Cette décision ne remet pas en cause la qualité de votre entreprise. Nous vous encourageons à soumettre une nouvelle demande à l'avenir si votre situation évolue.</p>

              <p style="color: #555;">N'hésitez pas à nous contacter pour toute question.</p>

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

      return NextResponse.json({
        request: updatedReq,
        message: "Demande refusée et email envoyé",
      })
    }
  } catch (error) {
    console.error("Error processing partnership request:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
