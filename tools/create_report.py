from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'output' / 'pdf' / 'Sentinel-Implementation-Report.pdf'
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='ReportTitle', parent=styles['Title'], fontName='Helvetica-Bold', fontSize=25, leading=30, textColor=colors.HexColor('#172640'), alignment=TA_CENTER, spaceAfter=8))
styles.add(ParagraphStyle(name='Subtitle', parent=styles['Normal'], fontName='Helvetica', fontSize=10, leading=14, textColor=colors.HexColor('#53637a'), alignment=TA_CENTER, spaceAfter=18))
styles.add(ParagraphStyle(name='Heading', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=15, leading=20, textColor=colors.HexColor('#1f4f9e'), spaceBefore=12, spaceAfter=7))
styles.add(ParagraphStyle(name='Body', parent=styles['BodyText'], fontName='Helvetica', fontSize=9.2, leading=13, textColor=colors.HexColor('#25364f'), spaceAfter=7))
styles.add(ParagraphStyle(name='Small', parent=styles['BodyText'], fontName='Helvetica', fontSize=8, leading=10, textColor=colors.HexColor('#53637a')))
styles.add(ParagraphStyle(name='TableCell', parent=styles['BodyText'], fontName='Helvetica', fontSize=8, leading=10, textColor=colors.HexColor('#25364f')))
styles.add(ParagraphStyle(name='TableHeader', parent=styles['BodyText'], fontName='Helvetica-Bold', fontSize=8, leading=10, textColor=colors.white))

def p(text, style='Body'):
    return Paragraph(text, styles[style])

def data_table(rows, widths=None):
    wrapped_rows = []
    for index, row in enumerate(rows):
        style = styles['TableHeader'] if index == 0 else styles['TableCell']
        wrapped_rows.append([Paragraph(str(cell), style) for cell in row])
    table = Table(wrapped_rows, colWidths=widths, repeatRows=1, hAlign='LEFT')
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#172640')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('LEADING', (0, 0), (-1, -1), 10),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#F7F9FC')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#F7F9FC'), colors.white]),
        ('GRID', (0, 0), (-1, -1), 0.35, colors.HexColor('#DCE4EF')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    return table

def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor('#DCE4EF'))
    canvas.line(doc.leftMargin, 13 * mm, A4[0] - doc.rightMargin, 13 * mm)
    canvas.setFont('Helvetica', 7.5)
    canvas.setFillColor(colors.HexColor('#60718B'))
    canvas.drawString(doc.leftMargin, 8 * mm, 'Sentinel Asset Command - Implementation Report')
    canvas.drawRightString(A4[0] - doc.rightMargin, 8 * mm, f'Page {doc.page}')
    canvas.restoreState()

doc = SimpleDocTemplate(str(OUTPUT), pagesize=A4, rightMargin=18*mm, leftMargin=18*mm, topMargin=18*mm, bottomMargin=19*mm)
story = []
story += [Spacer(1, 9*mm), p('Sentinel Asset Command', 'ReportTitle'), p('Military Asset Management System - Full-Stack Implementation Report', 'Subtitle')]
story += [p('Project objective', 'Heading'), p('Sentinel provides end-to-end asset visibility for vehicles, weapons, and ammunition across military bases. It calculates opening balances, net movements, assignments, expenditures, and closing balances while retaining an auditable record of every stock-changing operation.')]
story += [p('Operational inventory equation', 'Heading'), data_table([
    ['Measure', 'Calculation'],
    ['Net movement', 'Purchases + Transfers in - Transfers out'],
    ['Closing balance', 'Opening balance + Net movement - Assigned - Expended'],
], [46*mm, 118*mm]), Spacer(1, 4*mm)]
story += [p('System architecture', 'Heading'), data_table([
    ['Layer', 'Implementation'],
    ['Frontend', 'React with Vite, Tailwind CSS, Lucide icons, Recharts visualizations, Axios API client, protected routes, and role-sensitive navigation.'],
    ['Backend', 'Node.js Express ES modules with Helmet, CORS, JSON input limits, JWT authentication, Bcrypt password verification, and modular controllers/routes.'],
    ['Data', 'PostgreSQL through Prisma ORM. Relational foreign keys, unique stock balances, and base/equipment/date indexes protect integrity and reporting performance.'],
    ['Deployment', 'Vercel frontend configuration plus a Render Blueprint for the Express API and managed PostgreSQL database.'],
], [31*mm, 133*mm])]
story += [p('Core flow', 'Heading'), p('User signs in -> JWT carries user id, role, and base scope -> Express verifies the token -> RBAC restricts the route -> Prisma writes to PostgreSQL -> central audit service records the operation -> dashboard calculates balances from movement history.')]
story.append(PageBreak())

story += [p('Relational data design', 'Heading'), p('The schema models Bases, Users, Equipment Types, Assets, Purchases, Transfers, Assignments, Expenditures, and Audit Logs. Asset is the current stock record and has a unique compound key of base and equipment type. Event tables remain immutable and support dynamic balance calculations.')]
story += [data_table([
    ['Entity', 'Purpose and key controls'],
    ['Base / User', 'Each Base Commander has an optional assigned base. Username is unique; role is constrained to ADMIN, BASE_COMMANDER, or LOGISTICS_OFFICER.'],
    ['EquipmentType / Asset', 'Equipment categories are VEHICLE, WEAPON, or AMMUNITION. Asset uses a unique (baseId, equipmentTypeId) balance.'],
    ['Purchase / Transfer', 'Inbound records and cross-base movements. Transfers retain source, destination, initiator, status, and timestamp.'],
    ['Assignment / Expenditure', 'Record personnel/unit issue and asset consumption without overwriting history.'],
    ['AuditLog', 'Records user, action, details, and timestamp for every purchase, transfer, assignment, and expenditure.'],
], [43*mm, 121*mm]), p('Transactional control', 'Heading'), p('Transfers run in Prisma at Serializable isolation. The source Asset row is atomically decremented only when sufficient quantity exists. The destination Asset is upserted, the Transfer is created, and an AuditLog entry is written before the transaction commits. Any error rolls the entire transfer back.')]
story += [p('Role-based access matrix', 'Heading'), data_table([
    ['Capability', 'Administrator', 'Base Commander', 'Logistics Officer'],
    ['Dashboard and inventory', 'All bases', 'Assigned base only', 'All bases'],
    ['Log purchase', 'Yes', 'Assigned base only', 'Yes'],
    ['Initiate transfer', 'Yes', 'No', 'Yes'],
    ['Assign / expend', 'Yes', 'Assigned base only', 'No'],
    ['View audit trail', 'Yes', 'No', 'No'],
], [47*mm, 39*mm, 43*mm, 38*mm])]
story.append(PageBreak())

story += [p('API interface', 'Heading'), data_table([
    ['Method', 'Endpoint', 'Purpose'],
    ['POST', '/api/auth/login', 'Verifies Bcrypt hash and returns a signed JWT with role and base scope.'],
    ['GET', '/api/dashboard', 'Calculates opening, purchases, transfers, assignments, expenditure, net movement, and closing balance.'],
    ['GET', '/api/assets', 'Returns current available Asset balances within the caller scope.'],
    ['GET / POST', '/api/purchases', 'Lists and creates inbound stock transactions.'],
    ['GET / POST', '/api/transfers', 'Lists and atomically completes cross-base stock transfers.'],
    ['GET / POST', '/api/assignments and /api/expenditures', 'Records unit allocation and consumed assets.'],
    ['GET', '/api/audit-logs', 'Administrator-only central mutation history.'],
], [22*mm, 54*mm, 91*mm])]
story += [p('Sample test accounts', 'Heading'), data_table([
    ['Role', 'Username', 'Password', 'Scope'],
    ['Administrator', 'admin_user', 'AdminPass123!', 'All bases'],
    ['Base Commander', 'commander_alpha', 'CommandPass123!', 'Fort Alpha'],
    ['Logistics Officer', 'logistics_officer', 'LogisticsPass123!', 'Purchases and transfers'],
], [38*mm, 43*mm, 42*mm, 44*mm])]
story += [p('Deployment and demonstration', 'Heading'), p('For local development, Docker Compose starts PostgreSQL; Prisma db push creates the schema and the seed script creates the sample accounts and records. In production, Render provisions PostgreSQL and starts the API from render.yaml. Vercel builds the frontend and receives VITE_API_BASE_URL pointing to the Render /api endpoint. The Vercel preview retains a clearly labeled browser-demo fallback until that URL is configured.')]
story += [p('Suggested 3-5 minute walkthrough', 'Heading'), p('1. Log in as Administrator and explain dashboard filters and net movement modal. 2. Log a purchase and show inventory/audit updates. 3. Log in as Logistics Officer and execute a transfer while explaining the serializable transaction. 4. Log in as Base Commander and demonstrate forced Fort Alpha scope while creating an assignment. 5. Return as Administrator and show the central audit trail plus the Prisma/PostgreSQL schema.')]

doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(OUTPUT)
