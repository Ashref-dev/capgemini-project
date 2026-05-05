BEGIN;

DELETE FROM project_documents WHERE project_id IN (SELECT id FROM projects);
DELETE FROM project_allocations WHERE project_id IN (SELECT id FROM projects);
DELETE FROM project_tasks WHERE project_id IN (SELECT id FROM projects);
DELETE FROM milestones WHERE project_id IN (SELECT id FROM projects);
DELETE FROM projects;
ALTER SEQUENCE projects_id_seq RESTART WITH 1;
ALTER SEQUENCE milestones_id_seq RESTART WITH 1;
ALTER SEQUENCE project_tasks_id_seq RESTART WITH 1;
ALTER SEQUENCE project_allocations_id_seq RESTART WITH 1;
ALTER SEQUENCE project_documents_id_seq RESTART WITH 1;

INSERT INTO projects (name, partner_id, owner_employee_id, status, health, priority, start_date, end_date, budget, currency, percent_complete, tags, description) VALUES
('BIAT Digital Transformation', 22, 1, 'active', 'G', 'high', CURRENT_DATE - INTERVAL '120 days', CURRENT_DATE + INTERVAL '180 days', 850000, 'TND', 45, '["banking","cloud","azure"]'::jsonb,
 'Migration of BIAT''s core banking platform to Azure with hybrid identity, API modernization, and a new customer portal. Phase 1 in progress; production cutover slated Q3.'),

('Microsoft Azure Center of Excellence', 16, 5, 'active', 'Y', 'critical', CURRENT_DATE - INTERVAL '210 days', CURRENT_DATE + INTERVAL '90 days', 1200000, 'TND', 62, '["azure","training","governance"]'::jsonb,
 'Standing up the Azure CoE — landing zones, FinOps governance, and certification track for 40 engineers. Slipping on certification milestone — yellow.'),

('Orange 5G IoT Platform', 15, 5, 'active', 'R', 'critical', CURRENT_DATE - INTERVAL '180 days', CURRENT_DATE + INTERVAL '60 days', 1450000, 'TND', 38, '["5G","IoT","telecom","edge"]'::jsonb,
 'Edge IoT platform for Orange''s industrial 5G slice. Two milestones missed, hardware integration delayed by vendor — flagged red, recovery plan needed.'),

('ESPRIT Talent Pipeline 2026', 1, 6, 'active', 'G', 'medium', CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE + INTERVAL '300 days', 180000, 'TND', 25, '["recruitment","university","internships"]'::jsonb,
 'Cohort program with ESPRIT — 30 internships, 12 alternances, 8 CDI conversions. On track. Demo days planned in May and October.'),

('Amen Bank Cybersecurity Audit', 22, 4, 'planning', 'G', 'high', CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '120 days', 320000, 'TND', 0, '["security","audit","compliance"]'::jsonb,
 'ISO 27001 readiness audit + penetration testing across Amen Bank''s digital channels. Kickoff in two weeks. Awaiting customer sign-off on scope.'),

('Pluxee Employee Benefits Platform', 6, 2, 'completed', 'G', 'medium', CURRENT_DATE - INTERVAL '380 days', CURRENT_DATE - INTERVAL '20 days', 540000, 'TND', 100, '["webapp","benefits","saas"]'::jsonb,
 'Custom employee benefits portal for Pluxee Tunisie — meal cards, gift vouchers, expense claims. Delivered Q1, currently in 1-month hypercare.'),

('Dell Tunisia Server Refresh', 17, 3, 'on_hold', 'Y', 'low', CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE + INTERVAL '180 days', 420000, 'TND', 18, '["infrastructure","procurement"]'::jsonb,
 'Multi-site server refresh with Dell. On hold — customer awaiting fiscal year approval.');

INSERT INTO milestones (project_id, name, due_date, status, "order", description) VALUES
(1, 'Discovery & Architecture Approval', CURRENT_DATE - INTERVAL '90 days', 'completed', 1, 'Completed Phase 0: 14 workshops, target architecture signed off.'),
(1, 'Identity Federation Live (Entra ID + ADFS)', CURRENT_DATE - INTERVAL '30 days', 'completed', 2, 'Hybrid identity live for 4500 users. Zero-downtime cutover achieved.'),
(1, 'API Modernization Wave 1 (12 APIs)', CURRENT_DATE + INTERVAL '20 days', 'in_progress', 3, '8 of 12 APIs ported to .NET 8 + APIM.'),
(1, 'Customer Portal Beta', CURRENT_DATE + INTERVAL '75 days', 'pending', 4, 'Public beta for 500 customers.'),
(1, 'Production Cutover', CURRENT_DATE + INTERVAL '160 days', 'pending', 5, 'Full production cutover with 72h freeze window.'),

(2, 'Landing Zone Deployment', CURRENT_DATE - INTERVAL '160 days', 'completed', 1, 'Hub-spoke + 4 management groups operational.'),
(2, 'FinOps Tagging & Budget Alerts', CURRENT_DATE - INTERVAL '90 days', 'completed', 2, '100% workload tagged, monthly budget alerts wired to Teams.'),
(2, 'AZ-104 Certification Wave (12 engineers)', CURRENT_DATE - INTERVAL '14 days', 'missed', 3, '8 of 12 passed. Two retakes scheduled — milestone date missed.'),
(2, 'AZ-305 Architect Track (5 engineers)', CURRENT_DATE + INTERVAL '45 days', 'pending', 4, 'Pre-reading distributed.'),
(2, 'CoE Operating Model Handover', CURRENT_DATE + INTERVAL '85 days', 'pending', 5, 'Final documentation, runbook, on-call rota.'),

(3, 'Edge Hardware Procurement', CURRENT_DATE - INTERVAL '120 days', 'completed', 1, 'Cradlepoint + Advantech delivered (60 units).'),
(3, 'Network Slicing Configuration', CURRENT_DATE - INTERVAL '60 days', 'missed', 2, 'Slice 1 OK, slice 2 blocked by vendor firmware bug. Escalated.'),
(3, 'Pilot Site (Sfax Industrial Zone)', CURRENT_DATE - INTERVAL '30 days', 'missed', 3, 'Connectivity intermittent — milestone overrun.'),
(3, 'Platform UAT', CURRENT_DATE + INTERVAL '20 days', 'pending', 4, 'UAT cannot start until pilot stabilized.'),
(3, 'Commercial Launch', CURRENT_DATE + INTERVAL '55 days', 'pending', 5, 'At risk — likely 30 day delay.'),

(4, 'Campus Outreach & Branding', CURRENT_DATE - INTERVAL '40 days', 'completed', 1, '4 campus events, 280 students reached.'),
(4, 'Spring Internship Cohort (15 interns)', CURRENT_DATE + INTERVAL '40 days', 'in_progress', 2, '15 interns onboarded, 4 on-site.'),
(4, 'Mid-Year Demo Day', CURRENT_DATE + INTERVAL '120 days', 'pending', 3, 'Public demo of intern projects, partner ESPRIT faculty.'),
(4, 'Autumn Cohort Recruitment', CURRENT_DATE + INTERVAL '180 days', 'pending', 4, 'Target: 15 additional interns + 12 alternants.'),

(5, 'Scope & SOW Finalization', CURRENT_DATE + INTERVAL '14 days', 'pending', 1, 'Awaiting Amen Bank legal sign-off.'),
(5, 'External Pen Test (Web + Mobile)', CURRENT_DATE + INTERVAL '60 days', 'pending', 2, '4-week engagement.'),
(5, 'ISO 27001 Gap Analysis', CURRENT_DATE + INTERVAL '90 days', 'pending', 3, 'Document review + interviews.'),
(5, 'Final Report & Roadmap', CURRENT_DATE + INTERVAL '115 days', 'pending', 4, 'C-level presentation included.'),

(6, 'Discovery & Wireframes', CURRENT_DATE - INTERVAL '350 days', 'completed', 1, 'Done.'),
(6, 'MVP Build', CURRENT_DATE - INTERVAL '210 days', 'completed', 2, 'Done.'),
(6, 'Integration with Pluxee SSO', CURRENT_DATE - INTERVAL '120 days', 'completed', 3, 'Done.'),
(6, 'Production Launch', CURRENT_DATE - INTERVAL '50 days', 'completed', 4, 'Launched.'),
(6, 'Hypercare Closeout', CURRENT_DATE + INTERVAL '10 days', 'in_progress', 5, '1-month hypercare ending soon.'),

(7, 'Customer Hardware Inventory', CURRENT_DATE - INTERVAL '70 days', 'completed', 1, 'Audit complete: 84 servers across 3 sites.'),
(7, 'Procurement Quote', CURRENT_DATE - INTERVAL '40 days', 'completed', 2, 'Quote signed by procurement.'),
(7, 'Customer Fiscal Approval', CURRENT_DATE + INTERVAL '60 days', 'pending', 3, 'BLOCKER: awaiting customer board.');

INSERT INTO project_tasks (project_id, milestone_id, name, assignee_employee_id, due_date, status) VALUES
(1, 3, 'Migrate /accounts API to .NET 8', 1, CURRENT_DATE + INTERVAL '7 days', 'in_progress'),
(1, 3, 'Migrate /transfers API to .NET 8', 2, CURRENT_DATE + INTERVAL '12 days', 'in_progress'),
(1, 3, 'Migrate /cards API to .NET 8', 5, CURRENT_DATE + INTERVAL '15 days', 'todo'),
(1, 3, 'Migrate /loans API to .NET 8', 4, CURRENT_DATE + INTERVAL '18 days', 'todo'),
(1, 3, 'API Management policy review', 1, CURRENT_DATE + INTERVAL '10 days', 'todo'),
(1, 4, 'Customer portal — design system port', 2, CURRENT_DATE + INTERVAL '40 days', 'todo'),
(1, 4, 'Customer portal — auth integration', 5, CURRENT_DATE + INTERVAL '50 days', 'todo'),
(1, 4, 'Customer portal — load testing plan', 4, CURRENT_DATE + INTERVAL '65 days', 'todo'),
(1, NULL, 'Weekly steering committee with BIAT IT', 1, CURRENT_DATE + INTERVAL '3 days', 'in_progress'),

(2, 3, 'AZ-104 retake coaching for Hatem', 5, CURRENT_DATE + INTERVAL '5 days', 'blocked'),
(2, 3, 'AZ-104 retake coaching for Yasmine', 5, CURRENT_DATE + INTERVAL '7 days', 'in_progress'),
(2, 3, 'Cert vouchers procurement', 7, CURRENT_DATE + INTERVAL '10 days', 'done'),
(2, 4, 'AZ-305 cohort kickoff', 5, CURRENT_DATE + INTERVAL '20 days', 'todo'),
(2, 4, 'Architecture lab environment provisioning', 4, CURRENT_DATE + INTERVAL '15 days', 'todo'),
(2, 5, 'CoE operating model documentation', 1, CURRENT_DATE + INTERVAL '70 days', 'todo'),
(2, 5, 'On-call rota setup with PagerDuty', 5, CURRENT_DATE + INTERVAL '75 days', 'todo'),
(2, NULL, 'Monthly FinOps review with customer', 1, CURRENT_DATE + INTERVAL '4 days', 'todo'),

(3, 2, 'Cradlepoint firmware upgrade plan', 5, CURRENT_DATE - INTERVAL '5 days', 'in_progress'),
(3, 2, 'Vendor escalation — slice 2 firmware bug', 5, CURRENT_DATE + INTERVAL '2 days', 'blocked'),
(3, 3, 'Sfax site connectivity diagnostic', 4, CURRENT_DATE - INTERVAL '2 days', 'blocked'),
(3, 3, 'Backup carrier failover test', 4, CURRENT_DATE + INTERVAL '5 days', 'todo'),
(3, 3, 'Recovery plan writeup', 1, CURRENT_DATE + INTERVAL '3 days', 'in_progress'),
(3, 4, 'UAT scenarios drafted', 2, CURRENT_DATE + INTERVAL '15 days', 'todo'),
(3, 4, 'Customer UAT environment build', 5, CURRENT_DATE + INTERVAL '12 days', 'todo'),
(3, NULL, 'Daily standup with Orange ops', 1, CURRENT_DATE, 'in_progress'),
(3, NULL, 'Risk register update', 1, CURRENT_DATE + INTERVAL '1 day', 'todo'),

(4, 2, 'Onboarding kit refresh', 6, CURRENT_DATE - INTERVAL '20 days', 'done'),
(4, 2, 'Mentor pairing for spring cohort', 6, CURRENT_DATE + INTERVAL '5 days', 'in_progress'),
(4, 2, 'Mid-cohort feedback survey', 6, CURRENT_DATE + INTERVAL '20 days', 'todo'),
(4, 3, 'Demo Day venue booking', 6, CURRENT_DATE + INTERVAL '60 days', 'todo'),
(4, 3, 'Demo Day jury invitations', 6, CURRENT_DATE + INTERVAL '70 days', 'todo'),
(4, 4, 'Autumn campus visit calendar', 6, CURRENT_DATE + INTERVAL '90 days', 'todo'),

(5, 1, 'Scope draft v2', 4, CURRENT_DATE + INTERVAL '5 days', 'in_progress'),
(5, 1, 'Legal review with Amen Bank counsel', 4, CURRENT_DATE + INTERVAL '10 days', 'todo'),
(5, 1, 'NDA + DPA signature', 7, CURRENT_DATE + INTERVAL '12 days', 'todo'),

(6, 5, 'Hypercare ticket triage daily', 2, CURRENT_DATE, 'in_progress'),
(6, 5, 'Knowledge transfer to Pluxee L3 team', 2, CURRENT_DATE + INTERVAL '5 days', 'in_progress'),
(6, 5, 'Final lessons-learned doc', 2, CURRENT_DATE + INTERVAL '8 days', 'todo'),

(7, 3, 'Follow-up email with Dell finance contact', 3, CURRENT_DATE + INTERVAL '7 days', 'blocked'),
(7, 3, 'Quote refresh prep (in case of price re-validation)', 3, CURRENT_DATE + INTERVAL '30 days', 'todo');

INSERT INTO project_allocations (project_id, employee_id, role, fte_percent, start_date, end_date) VALUES
(1, 1, 'Engagement Manager', 30, CURRENT_DATE - INTERVAL '120 days', CURRENT_DATE + INTERVAL '180 days'),
(1, 2, 'Senior Cloud Engineer', 80, CURRENT_DATE - INTERVAL '120 days', CURRENT_DATE + INTERVAL '180 days'),
(1, 4, 'Solution Architect', 50, CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE + INTERVAL '180 days'),
(1, 5, 'Tech Lead', 100, CURRENT_DATE - INTERVAL '120 days', CURRENT_DATE + INTERVAL '180 days'),

(2, 5, 'CoE Lead', 60, CURRENT_DATE - INTERVAL '210 days', CURRENT_DATE + INTERVAL '90 days'),
(2, 4, 'FinOps Analyst', 40, CURRENT_DATE - INTERVAL '180 days', CURRENT_DATE + INTERVAL '90 days'),
(2, 1, 'Steering Sponsor', 10, CURRENT_DATE - INTERVAL '210 days', CURRENT_DATE + INTERVAL '90 days'),
(2, 7, 'L&D Coordinator', 20, CURRENT_DATE - INTERVAL '180 days', CURRENT_DATE + INTERVAL '60 days'),

(3, 5, 'Tech Lead', 100, CURRENT_DATE - INTERVAL '180 days', CURRENT_DATE + INTERVAL '60 days'),
(3, 4, 'Network Engineer', 80, CURRENT_DATE - INTERVAL '150 days', CURRENT_DATE + INTERVAL '60 days'),
(3, 2, 'Software Engineer', 60, CURRENT_DATE - INTERVAL '150 days', CURRENT_DATE + INTERVAL '60 days'),
(3, 1, 'Engagement Manager', 40, CURRENT_DATE - INTERVAL '180 days', CURRENT_DATE + INTERVAL '60 days'),

(4, 6, 'Program Lead', 60, CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE + INTERVAL '300 days'),
(4, 2, 'Mentor Coordinator', 20, CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE + INTERVAL '300 days'),
(4, 7, 'Talent Acquisition Partner', 30, CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE + INTERVAL '300 days'),

(5, 4, 'Lead Auditor', 70, CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '120 days'),
(5, 7, 'Compliance Specialist', 30, CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '120 days'),

(6, 2, 'Hypercare Lead', 30, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '20 days'),
(6, 5, 'Tech Advisor', 10, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '20 days'),

(7, 3, 'Account Manager', 15, CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE + INTERVAL '180 days');

INSERT INTO project_documents (project_id, file_name, original_name, file_type, file_size, file_path, description, uploaded_by, uploaded_by_type, uploaded_by_id) VALUES
(1, 'biat-target-architecture-v3.pdf', 'BIAT Target Architecture v3.pdf', 'application/pdf', 2_840_000, '/uploads/projects/1/biat-target-architecture-v3.pdf', 'Phase 0 deliverable — signed off by both CIOs.', 'Karim Mejri', 'employee', 1),
(1, 'biat-api-modernization-plan.md', 'API Modernization Plan.md', 'text/markdown', 14_200, '/uploads/projects/1/biat-api-modernization-plan.md', 'Wave 1 of 3 — 12 APIs, .NET 8 + APIM. Capgemini methodology applied.', 'Sami Trabelsi', 'employee', 5),
(1, 'biat-cutover-runbook-draft.md', 'Cutover Runbook (Draft).md', 'text/markdown', 8_900, '/uploads/projects/1/biat-cutover-runbook-draft.md', 'Draft 0.4 — to be reviewed before customer portal beta.', 'Sami Trabelsi', 'employee', 5),

(2, 'azure-coe-operating-model.md', 'Azure CoE Operating Model.md', 'text/markdown', 22_100, '/uploads/projects/2/azure-coe-operating-model.md', 'CoE charter, RACI, governance forums.', 'Sami Trabelsi', 'employee', 5),
(2, 'finops-dashboard-q1-readout.pdf', 'FinOps Q1 Readout.pdf', 'application/pdf', 1_200_000, '/uploads/projects/2/finops-dashboard-q1-readout.pdf', 'Quarterly FinOps savings: 18% vs baseline.', 'Nadia Haddad', 'employee', 4),

(3, 'orange-recovery-plan-v1.md', 'Orange 5G Recovery Plan v1.md', 'text/markdown', 18_400, '/uploads/projects/3/orange-recovery-plan-v1.md', '30-day recovery plan after vendor firmware blocker.', 'Karim Mejri', 'employee', 1),
(3, 'orange-network-slicing-design.pdf', 'Network Slicing Design.pdf', 'application/pdf', 4_100_000, '/uploads/projects/3/orange-network-slicing-design.pdf', 'Detailed slicing design — slice 1 live, slice 2 in remediation.', 'Sami Trabelsi', 'employee', 5),
(3, 'orange-risk-register.md', 'Risk Register (R/Y/G).md', 'text/markdown', 6_200, '/uploads/projects/3/orange-risk-register.md', 'Live risk register — 3 reds open.', 'Karim Mejri', 'employee', 1),

(4, 'esprit-cohort-charter.md', 'ESPRIT Cohort Charter.md', 'text/markdown', 11_000, '/uploads/projects/4/esprit-cohort-charter.md', 'Mentorship model + KPIs.', 'Mouna Baccar', 'employee', 6),

(5, 'amen-bank-scope-v2.md', 'Amen Bank Scope v2.md', 'text/markdown', 9_400, '/uploads/projects/5/amen-bank-scope-v2.md', 'Scope iteration v2 — pending legal review.', 'Nadia Haddad', 'employee', 4),

(6, 'pluxee-lessons-learned-draft.md', 'Lessons Learned (Draft).md', 'text/markdown', 7_800, '/uploads/projects/6/pluxee-lessons-learned-draft.md', 'Final retrospective in progress.', 'Leila Ben Ali', 'employee', 2);

COMMIT;

SELECT 'projects: ' || COUNT(*) FROM projects
UNION ALL SELECT 'milestones: ' || COUNT(*) FROM milestones
UNION ALL SELECT 'tasks: ' || COUNT(*) FROM project_tasks
UNION ALL SELECT 'allocations: ' || COUNT(*) FROM project_allocations
UNION ALL SELECT 'documents: ' || COUNT(*) FROM project_documents;
