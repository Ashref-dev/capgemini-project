/**
 * Database schema exports
 * Aggregates all schema definitions and relations for Capgemini Partnership Platform
 */

// Partnership platform - Core
export { partners, type Partner, type NewPartner } from "./partners"
export { partnerContacts, type PartnerContact, type NewPartnerContact } from "./partner-contacts"
export { offers, type Offer, type NewOffer } from "./offers"
export { partnerEvents, type PartnerEvent, type NewPartnerEvent } from "./partner-events"
export { partnerKpis, type PartnerKPI, type NewPartnerKPI } from "./partner-kpis"
export { partnerStatusHistory, type PartnerStatusHistory, type NewPartnerStatusHistory } from "./partner-status-history"

// Partnership platform - Sub-types
export { capgeminiEmployees, type CapgeminiEmployee, type NewCapgeminiEmployee } from "./capgemini-employees"
export { clientPartners, type ClientPartner, type NewClientPartner } from "./client-partners"
export { marketingPartners, type MarketingPartner, type NewMarketingPartner } from "./marketing-partners"
export { universityPartners, type UniversityPartner, type NewUniversityPartner } from "./university-partners"
export { technologyPartners, type TechnologyPartner, type NewTechnologyPartner } from "./technology-partners"
export { studentRecruitments, type StudentRecruitment, type NewStudentRecruitment } from "./student-recruitments"
export { vendorProjects, type VendorProject, type NewVendorProject } from "./vendor-projects"

// Relations
export { partnersRelations } from "./partners"
export { partnerContactsRelations } from "./partner-contacts"
export { offersRelations } from "./offers"
export { partnerEventsRelations } from "./partner-events"
export { partnerKpisRelations } from "./partner-kpis"
export { partnerStatusHistoryRelations } from "./partner-status-history"
export { clientPartnersRelations } from "./client-partners"
export { marketingPartnersRelations } from "./marketing-partners"
export { universityPartnersRelations } from "./university-partners"
export { technologyPartnersRelations } from "./technology-partners"
export { studentRecruitmentsRelations } from "./student-recruitments"
export { vendorProjectsRelations } from "./vendor-projects"
