"""
Diagrammes de classes SunuDroit, version 2 (noms du code, en anglais, DEC-16).
Une seule description produit le fichier .excalidraw ET le bloc Mermaid (.mmd) de chaque module.
Usage : python3 gen.py <dossier_de_sortie>   (depuis ce dossier : python3 gen.py ..)
"""
import sys
sys.argv = sys.argv[:2]
from lib import Diagram, enum_row  # noqa: E402

O = "[0..1]"   # attribut facultatif (nullable)
ROOT = "aggregate root"
VALUE = "value"

# ---------------------------------------------------------------- CORPUS
VERT, VERT_V = "#d3f9d8", "#ebfbee"
d = Diagram("Module corpus · diagramme de classes",
            "Noms du code (anglais, DEC-16) · vérifié sur la Constitution (Conseil constitutionnel, base 2018)")
d.cls("text", "LegalText", ["+ id : String", "+ type : LegalTextType", "+ officialTitle : String",
      "+ shortTitle : String", f"+ subject : String {O}", "+ adoptionDate : LocalDate",
      "+ articleIdPrefix : String", f"+ journalNumber : String {O}", f"+ journalDate : LocalDate {O}",
      f"+ journalPage : Integer {O}", "+ status : LegalTextStatus"], 720, 0, VERT, stereotype=ROOT)
d.cls("ref", "CrossReference", ["+ id : UUID", "+ kind : CrossReferenceKind", f"+ label : String {O}",
      "+ sourceArticleId : String", "+ targetLegalTextId : String", f"+ targetDivisionId : UUID {O}",
      f"+ targetArticleId : String {O}"], 2160, 120, VERT, stereotype=ROOT)
d.cls("division", "Division", ["+ id : UUID", "+ kind : DivisionKind", f"+ label : String {O}",
      "+ position : BigDecimal"], 0, 450, VERT)
d.cls("article", "Article", ["+ id : String", "+ legalTextId : String", "+ divisionId : UUID",
      "+ kind : ArticleKind", f"+ number : String {O}", "+ sortKey : String"], 720, 450, VERT, stereotype=ROOT)
d.cls("dversion", "DivisionVersion", ["+ id : UUID", f"+ heading : String {O}", "+ validFrom : LocalDate",
      f"+ validTo : LocalDate {O}", "+ dateUncertain : boolean", "+ repealed : boolean", "+ amendmentId : UUID",
      "+ editorialStatus : EditorialStatus"], 0, 900, VERT)
d.cls("aversion", "ArticleVersion", ["+ id : UUID", "+ validFrom : LocalDate", f"+ validTo : LocalDate {O}",
      "+ dateUncertain : boolean", "+ changeKind : ArticleChangeKind", "+ repealed : boolean",
      "+ amendmentId : UUID", "+ editorialStatus : EditorialStatus"], 720, 900, VERT)
d.cls("note", "EditorialNote", ["+ id : UUID", "+ kind : EditorialNoteKind", "+ content : String",
      f"+ source : String {O}", f"+ paragraphPosition : Integer {O}"], 1440, 900, VERT)
d.cls("effect", "AmendmentEffect", ["+ id : UUID", "+ provision : String", "+ operation : EffectOperation",
      "+ officialWording : String", "+ applied : boolean"], 0, 1350, VERT)
d.cls("amendment", "Amendment", ["+ id : UUID", "+ legalTextId : String", "+ kind : AmendmentKind",
      f"+ number : String {O}", f"+ actDate : LocalDate {O}", "+ title : String", f"+ journalNumber : String {O}",
      f"+ journalDate : LocalDate {O}", f"+ journalPage : Integer {O}", "+ legalStatus : AmendmentLegalStatus",
      "+ integrationStatus : AmendmentIntegrationStatus", "+ canChangeTheLaw() : boolean"], 720, 1350, VERT,
      stereotype=ROOT)
d.cls("paragraph", "Paragraph", ["+ id : UUID", "+ position : int", "+ kind : ParagraphKind", "+ content : String",
      "+ segments : List<Segment>", f"+ changedByAmendmentId : UUID {O}",
      f"+ changeKind : ParagraphChangeKind {O}"], 1440, 1350, VERT)
d.cls("segment", "Segment", ["+ kind : SegmentKind", "+ value : String", f"+ crossReferenceId : UUID {O}"],
      2160, 1350, VERT_V, stereotype=VALUE)

B = d.boxes
d.rel("text", "division", "composition", "structure", "1", "1..*")
d.rel("division", "division", "aggregation", "sous-divisions", "0..1", "0..*", loop="top")
d.rel("division", "dversion", "composition", "intitulés dans le temps", "1", "1..*")
d.rel("article", "text", "association", "appartient à (par id)", "0..*", "1")
d.rel("article", "division", "association", "rangé dans (par id)", "0..*", "1")
d.rel("article", "aversion", "composition", "versions", "1", "1..*")
d.rel("aversion", "paragraph", "composition", "alinéas", "1", "1..*")
d.rel("aversion", "note", "composition", "notes", "1", "0..*")
d.rel("paragraph", "segment", "composition", "segments", "1", "1..*")
d.rel("segment", "ref", "dependency", "lien cliquable")
d.rel("ref", "article", "association", "depuis", "0..*", "1")
d.rel("ref", "text", "association", "vers", "0..*", "1")
d.rel("aversion", "amendment", "association", "issue de (par id)", "0..*", "1")
d.rel("dversion", "amendment", "association", "issue de (par id)", "0..*", "1")
d.rel("paragraph", "amendment", "association", "dernier changement", "0..*", "0..1")
d.rel("amendment", "effect", "composition", "effets", "1", "0..*")
ay = B["amendment"]["y"]
d.rel("amendment", "text", "association", "modifie (par id)", "0..*", "1",
      wp=[(1300, ay + 40), (1300, B["text"]["y"] + 60)])
ey = B["effect"]["y"]
d.rel("effect", "division", "association", "cible", "0..*", "0..1",
      wp=[(-90, ey + 60), (-90, B["division"]["y"] + 60)])
d.rel("effect", "article", "association", "cible", "0..*", "0..1",
      wp=[(560, ey + 40), (560, B["article"]["y"] + 150)])
d.rel("effect", "aversion", "association", "produit", "0..1", "0..1",
      wp=[(620, ey + 20), (620, B["aversion"]["y"] + 170)])

d.note("Points clés\n"
       "• LegalText.id et Article.id sont permanents (RG-01).\n"
       "  Article.id = articleIdPrefix + \"-art-\" + numéro : const-art-25-1.\n"
       "• Les racines d'agrégat se désignent par identifiant (…Id).\n"
       "• Une version = texte complet (DEC-13). En vigueur ou ancienne :\n"
       "  déduit des dates. Une division peut naître (TITRE VI BIS, 2016).\n"
       "• L'acte d'origine est un Amendment ORIGINAL_ACT, un seul par texte.\n"
       "• Non promulgué : aucune version (RG-09, canChangeTheLaw).\n"
       "• Un effet vise UNE cible : une ligne par article modifié.\n"
       "• Le texte du JO n'est jamais corrigé : EditorialNote (RG-07).", 0, 0, w=600)
d.legend(2900, 0)
enum_row(d, [
    ("LegalTextType", ["CONSTITUTION", "ORGANIC_LAW", "DECISION"]),
    ("LegalTextStatus", ["IN_FORCE", "REPEALED", "STRUCK_DOWN"]),
    ("DivisionKind", ["PREAMBLE", "TITLE", "CHAPTER", "SECTION", "HEADING"]),
    ("ArticleKind", ["ARTICLE", "PREAMBLE"]),
    ("ArticleChangeKind", ["ORIGINAL", "REPLACED", "AMENDED", "INSERTED", "REPEALED"]),
    ("ParagraphKind", ["TEXT", "LIST_ITEM"]),
    ("ParagraphChangeKind", ["INSERTED", "REWRITTEN", "WORDS_CHANGED"]),
    ("SegmentKind", ["TEXT", "REFERENCE"]),
    ("AmendmentKind", ["ORIGINAL_ACT", "CONSTITUTIONAL_LAW", "REFERENDUM", "ORGANIC_LAW"]),
    ("AmendmentLegalStatus", ["PROMULGATED", "STRUCK_DOWN", "DRAFT"]),
    ("AmendmentIntegrationStatus", ["TO_INTEGRATE", "IN_PROGRESS", "INTEGRATED"]),
    ("EffectOperation", ["REPLACES_ARTICLE", "ADDS_ARTICLE", "REPEALS_ARTICLE", "INSERTS_PARAGRAPH",
                         "REWRITES_PARAGRAPH", "REPEALS_PARAGRAPH", "DELETES_WORDS", "REPLACES_WORDS",
                         "ADDS_DIVISION", "RENAMES_DIVISION"]),
    ("EditorialNoteKind", ["SPELLING_OR_GRAMMAR", "SURVIVING_WORDS", "DRAFTING_ERROR", "BROKEN_REFERENCE",
                           "OMITTED_IN_JOURNAL", "MISPLACED_PROVISION", "AMENDMENT_NOT_APPLIED", "CLARIFICATION"]),
    ("CrossReferenceKind", ["SPECIFIED_BY", "CITED_BY", "REFERS_TO"]),
    ("EditorialStatus", ["DRAFT", "IN_REVIEW", "APPROVED", "PUBLISHED", "ABANDONED"]),
], 0, 1760, max_w=2900)
print(d.save("01-corpus.excalidraw"))

# ---------------------------------------------------------------- EDITORIAL
JAUNE = "#fff3bf"
d = Diagram("Module editorial · diagramme de classes",
            "Le travail de l'équipe : relecture, éditions, signalements, audit · noms du code (DEC-16)")
d.cls("member", "TeamMember", ["+ id : UUID", "+ email : String", "+ fullName : String", "+ roles : Set<Role>",
      "+ active : boolean", "+ twoFactorEnabled : boolean"], 700, 520, JAUNE, stereotype=ROOT)
d.cls("review", "Review", ["+ id : UUID", "+ targetType : TargetType", "+ targetId : UUID",
      "+ decision : ReviewDecision", f"+ comment : String {O}", "+ reviewedAt : Instant"], 0, 0, JAUNE)
d.cls("edition", "Edition", ["+ id : UUID", "+ number : int", "+ verifiedOn : LocalDate", "+ status : EditionStatus",
      "+ file : String", "+ sha256 : String", "+ sizeBytes : long", "+ schemaVersion : int",
      "+ minAppVersion : String", f"+ publishedAt : Instant {O}"], 0, 480, JAUNE, stereotype=ROOT)
d.cls("change", "EditionChange", ["+ id : UUID", "+ kind : EditionChangeKind", "+ label : String",
      f"+ targetId : String {O}"], 0, 1080, JAUNE)
d.cls("audit", "AuditEvent", ["+ id : UUID", "+ action : String", "+ targetType : TargetType", "+ targetId : String",
      f"+ before : Json {O}", f"+ after : Json {O}", "+ occurredAt : Instant", f"+ ipAddress : String {O}"],
      700, 1080, JAUNE, stereotype=ROOT)
d.cls("report", "Report", ["+ id : UUID", "+ reference : String", "+ kind : ReportKind",
      f"+ paragraphPosition : Integer {O}", "+ description : String", f"+ source : String {O}",
      f"+ contactEmail : String {O}", "+ status : ReportStatus", f"+ answer : String {O}", "+ createdAt : Instant"],
      1400, 0, JAUNE, stereotype=ROOT)
d.cls("article", "Article", ["(module corpus)"], 2200, 0, "#ebfbee")
d.cls("aversion", "ArticleVersion", ["(module corpus)"], 2200, 260, "#ebfbee")
d.cls("user", "User", ["(module account)"], 2200, 520, "#e7f5ff")

d.rel("member", "review", "association", "relit", "1", "0..*")
d.rel("member", "edition", "association", "publie", "1", "0..*")
d.rel("edition", "change", "composition", "notes de version", "1", "0..*")
d.rel("audit", "member", "association", "auteur", "0..*", "1")
d.rel("report", "article", "association", "concerne", "0..*", "1")
d.rel("report", "aversion", "association", "version lue", "0..*", "0..1")
d.rel("report", "report", "association", "doublon de", "0..*", "0..1")
d.rel("report", "member", "association", "traité par", "0..*", "0..1")
d.rel("report", "user", "association", "envoyé par", "0..*", "0..1")

d.note("Règles\n"
       "• Un relecteur ne valide jamais sa propre saisie (RG-21).\n"
       "• Une édition publiée est immuable, numéro croissant (RG-22).\n"
       "• AuditEvent : insertion seule, jamais modifié (RG-24).\n"
       "• Un signalement ne modifie jamais le corpus (RG-34).", 1400, 1080, w=560)
d.legend(2800, 0)
enum_row(d, [
    ("Role", ["EDITOR", "REVIEWER", "ADMIN"]),
    ("ReviewDecision", ["APPROVED", "SENT_BACK"]),
    ("TargetType", ["ARTICLE_VERSION", "DIVISION_VERSION", "CROSS_REFERENCE", "EDITORIAL_NOTE", "AMENDMENT",
                    "EDITION", "REPORT", "TEAM_MEMBER"]),
    ("EditionStatus", ["IN_PREPARATION", "PUBLISHED", "WITHDRAWN"]),
    ("EditionChangeKind", ["NEW_VERSION", "WORDING_VERIFIED", "STRUCTURE_ADDED", "NEW_TEXT", "NOTE_ADDED",
                           "REFERENCE_ADDED"]),
    ("ReportKind", ["DIFFERS_FROM_JOURNAL", "TYPO", "WRONG_REFERENCE", "MISSING_VERSION", "OTHER"]),
    ("ReportStatus", ["NEW", "UNDER_REVIEW", "ACCEPTED", "FIXED", "REJECTED", "DUPLICATE"]),
], 0, 1600, max_w=2700)
print(d.save("02-editorial.excalidraw"))

# ---------------------------------------------------------------- ACCOUNT
BLEU = "#d0ebff"
d = Diagram("Module account · diagramme de classes",
            "Utilisateurs, codes de connexion, sessions, favoris, historique, appareils · noms du code (DEC-16)")
d.cls("user", "User", ["+ id : UUID", "+ email : String", f"+ firstName : String {O}", f"+ lastName : String {O}",
      "+ status : AccountStatus", "+ createdAt : Instant", f"+ deletionRequestedAt : Instant {O}"], 640, 380, BLEU,
      stereotype=ROOT)
d.cls("code", "SignInCodeRequest", ["+ requestId : UUID", "+ email : String", "+ codeHash : String",
      "+ attempts : int", "+ expiresAt : Instant", "+ status : CodeRequestStatus", f"+ ipAddress : String {O}"],
      0, 0, BLEU, stereotype=ROOT)
d.cls("session", "RefreshSession", ["+ id : UUID", "+ familyId : UUID", "+ tokenHash : String",
      "+ expiresAt : Instant", f"+ revokedAt : Instant {O}", f"+ deviceLabel : String {O}"], 640, 0, BLEU)
d.cls("favorite", "Favorite", ["+ id : UUID", "+ targetType : FavoriteTargetType", "+ targetId : String",
      "+ modifiedAt : Instant", "+ deleted : boolean"], 1340, 300, BLEU)
d.cls("history", "HistoryEntry", ["+ id : UUID", "+ kind : HistoryEntryKind", "+ articleId : String",
      f"+ verdict : Verdict {O}", "+ occurredAt : Instant"], 1340, 640, BLEU)
d.cls("device", "Device", ["+ id : UUID", f"+ pushToken : String {O}", "+ platform : Platform",
      "+ appVersion : String", f"+ installedEdition : Integer {O}", "+ revisionAlerts : boolean",
      "+ anonymousStats : boolean", "+ lastSeenAt : Instant"], 0, 640, BLEU, stereotype=ROOT)
d.cls("article", "Article", ["(module corpus)"], 2040, 200, "#ebfbee")
d.cls("text", "LegalText", ["(module corpus)"], 2040, 420, "#ebfbee")

d.rel("user", "session", "composition", "sessions", "1", "0..*")
d.rel("session", "session", "association", "remplacée par", "0..1", "0..1")
d.rel("user", "favorite", "composition", "favoris", "1", "0..*")
d.rel("user", "history", "composition", "historique (V2)", "1", "0..*")
d.rel("user", "device", "aggregation", "appareils", "0..1", "0..*")
d.rel("favorite", "article", "dependency", "cible ARTICLE")
d.rel("favorite", "text", "dependency", "cible TEXT")
d.rel("code", "user", "dependency", "crée ou retrouve")

d.note("Règles\n"
       "• E-mail normalisé et unique ; le compte est identifié par son id (RG-40).\n"
       "• Code : 6 chiffres, haché, 10 min, 5 essais (RG-41).\n"
       "• Jeton de rafraîchissement à rotation, détection de vol (RG-42).\n"
       "• Favori : suppression logique pour la synchronisation (RG-51).\n"
       "• Un Device peut exister sans compte (visiteur).", 1340, 980, w=600)
d.legend(2600, 0)
enum_row(d, [
    ("AccountStatus", ["ACTIVE", "DELETION_REQUESTED"]),
    ("CodeRequestStatus", ["ISSUED", "VERIFIED", "EXPIRED", "BLOCKED"]),
    ("FavoriteTargetType", ["ARTICLE", "TEXT"]),
    ("HistoryEntryKind", ["READING", "VERIFICATION"]),
    ("Verdict", ["MATCHES", "INACCURATE", "NOT_FOUND"]),
    ("Platform", ["IOS", "ANDROID"]),
], 0, 1380, max_w=2400)
print(d.save("03-account.excalidraw"))

# ---------------------------------------------------------------- NOTIFICATION
VIOLET = "#e5dbff"
d = Diagram("Module notification · diagramme de classes",
            "Boîte de notifications (V2) et envois push · noms du code (DEC-16)")
d.cls("notification", "Notification", ["+ id : UUID", "+ kind : NotificationKind", "+ title : String",
      "+ body : String", "+ link : String", "+ scope : NotificationScope", "+ createdAt : Instant"], 0, 0, VIOLET,
      stereotype=ROOT)
d.cls("read", "NotificationRead", ["+ readAt : Instant"], 0, 520, VIOLET)
d.cls("push", "PushDispatch", ["+ id : UUID", "+ recipients : int", "+ succeeded : int", "+ failed : int",
      "+ sentAt : Instant"], 640, 0, VIOLET)
d.cls("user", "User", ["(module account)"], 640, 520, "#e7f5ff")

d.rel("notification", "push", "composition", "envois", "1", "0..*")
d.rel("notification", "user", "association", "destinataire si personnelle", "0..*", "0..1")
d.rel("read", "notification", "association", "", "0..*", "1")
d.rel("read", "user", "association", "", "0..*", "1")

d.note("Règles\n"
       "• Jamais de publicité (RG-71).\n"
       "• Pas d'envoi entre 22 h et 7 h, heure de Dakar (RG-70).\n"
       "• Toujours un lien vers un écran précis (RG-72).", 640, 760, w=520)
d.legend(1300, 0)
enum_row(d, [
    ("NotificationKind", ["CORPUS_UPDATED", "FAVORITE_CHANGED", "RECEIPT_AVAILABLE", "REPORT_ANSWERED", "NEWS"]),
    ("NotificationScope", ["EVERYONE", "PERSONAL"]),
], 0, 1000, max_w=1800)
print(d.save("04-notification.excalidraw"))

# ---------------------------------------------------------------- DONATION
ROSE = "#ffe3e3"
d = Diagram("Module donation (V2) · diagramme de classes",
            "Dons Wave et Orange Money, notifications de paiement, reçus · noms du code (DEC-16)")
d.cls("donation", "Donation", ["+ id : UUID", "+ reference : String", "+ amountFcfa : int", "+ method : PaymentMethod",
      "+ status : DonationStatus", f"+ receiptEmail : String {O}", f"+ providerPaymentId : String {O}",
      "+ createdAt : Instant", "+ expiresAt : Instant", f"+ confirmedAt : Instant {O}"], 640, 0, ROSE,
      stereotype=ROOT)
d.cls("event", "PaymentEvent", ["+ id : UUID", "+ payload : Json", "+ signatureValid : boolean",
      "+ receivedAt : Instant"], 0, 560, ROSE)
d.cls("receipt", "Receipt", ["+ id : UUID", "+ number : String", "+ amountFcfa : int", "+ donorName : String",
      "+ date : LocalDate", "+ pdfFile : String"], 1300, 560, ROSE, stereotype=ROOT)
d.cls("user", "User", ["(module account)"], 0, 0, "#e7f5ff")

d.rel("donation", "user", "association", "donateur connecté", "0..*", "0..1")
d.rel("donation", "event", "composition", "notifications du prestataire", "1", "0..*")
d.rel("donation", "receipt", "association", "reçu", "1", "0..1")

d.note("Règles\n"
       "• Montant de 200 à 1 000 000 FCFA (RG-60).\n"
       "• Statut changé uniquement par le prestataire (RG-61).\n"
       "• Référence SD-AAMM-XXXX (RG-62) · expiration 15 min (RG-63).\n"
       "• Reçu R-AAAA-NNNNNN, nom copié au moment du don (RG-64).", 640, 1000, w=560)
d.legend(2000, 0)
enum_row(d, [
    ("PaymentMethod", ["WAVE", "ORANGE_MONEY"]),
    ("DonationStatus", ["INITIATED", "PENDING", "CONFIRMED", "FAILED", "EXPIRED", "CANCELLED"]),
], 0, 1280, max_w=1800)
print(d.save("05-donation.excalidraw"))
