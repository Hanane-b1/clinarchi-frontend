import React from "react";

function LogoSVG({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 90"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5fa8a0" />
          <stop offset="100%" stopColor="#8fbf8f" />
        </linearGradient>
      </defs>
      <path
        d="M20 60 L20 40 L40 25 L60 40 L60 60"
        fill="none"
        stroke="url(#grad)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M35 60 L35 45 L48 35 L48 60"
        fill="none"
        stroke="#6b7280"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M55 55 
           C50 45, 65 40, 70 50
           C75 40, 90 45, 85 55
           C80 65, 70 70, 70 75
           C70 70, 60 65, 55 55 Z"
        fill="none"
        stroke="url(#grad)"
        strokeWidth="3"
      />
      <path
        d="M50 58 L60 58 L65 50 L70 62 L75 55 L85 55"
        fill="none"
        stroke="url(#grad)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Home({ startApp }) {
  return (
    <div style={styles.page}>
      <div style={styles.overlay}></div>
      <header style={styles.header}>
        <div style={styles.brand}>
          <div style={styles.brandIcon}>
            <LogoSVG size={45} />
          </div>
          <div>
            <div style={styles.brandName}>ClinArchi</div>
            <div style={styles.brandSub}>Plateforme de Programmation Spatiale</div>
          </div>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.badge}>Santé & Architecture</span>
        </div>
      </header>
      <main style={styles.hero}>
        <div style={styles.left}>
          <div style={styles.tag}>
            Concevez des cliniques performantes, modernes et bien structurées
          </div>
          <h1 style={styles.title}>
            Planifiez vos cliniques
            <br />
            <span style={styles.titleAccent}>
              avec précision, efficacité et rigueur
            </span>
          </h1>
          <p style={styles.description}>
            ClinArchi génère des programmes spatiaux complets pour vos projets de
            cliniques, en structurant les locaux et en dimensionnant les surfaces
            selon les exigences fonctionnelles. Elle permet de concevoir des projets
            cohérents, conformes et directement exploitables.
          </p>
          <div style={styles.actions}>
            <button style={styles.primaryBtn} onClick={startApp}>
              Commencer la Planification
            </button>
          </div>
          <div style={styles.statsRow}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>9</div>
              <div style={styles.statLabel}>Types de départements</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>31</div>
              <div style={styles.statLabel}>Unités fonctionnelles</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>PDF</div>
              <div style={styles.statLabel}>Export professionnel</div>
            </div>
          </div>
        </div>
        <div style={styles.right}>
          <div style={styles.previewCard}>
            <div style={styles.previewTop}>
              <div>
                <div style={styles.previewLabel}>Aperçu de la plateforme</div>
                <div style={styles.previewTitle}>
                  Tableau de Bord — Programme Spatial
                </div>
              </div>
              <div style={styles.liveBadge}>Aperçu</div>
            </div>
            <div style={styles.previewGrid}>
              <div style={styles.metricBox}>
                <div style={styles.metricTitle}>Départements</div>
                <div style={styles.metricValue}>09</div>
              </div>
              <div style={styles.metricBox}>
                <div style={styles.metricTitle}>Capacité en lits</div>
                <div style={styles.metricValue}>240</div>
              </div>
              <div style={styles.metricBox}>
                <div style={styles.metricTitle}>Nombre de locaux</div>
                <div style={styles.metricValue}>186</div>
              </div>
              <div style={styles.metricBox}>
                <div style={styles.metricTitle}>Surface totale estimée</div>
                <div style={styles.metricValue}>18 400 m²</div>
              </div>
            </div>
            <div style={styles.departmentPanel}>
              <div style={styles.panelTitle}>
                Répartition fonctionnelle des activités de la clinique
              </div>
              <div style={styles.deptRow}>
                <span>Hospitalisation</span>
                <span style={styles.deptPillTeal}>32%</span>
              </div>
              <div style={styles.deptRow}>
                <span>Plateau Technique</span>
                <span style={styles.deptPillGreen}>24%</span>
              </div>
              <div style={styles.deptRow}>
                <span>Ambulatoire</span>
                <span style={styles.deptPillMint}>18%</span>
              </div>
              <div style={styles.deptRowNoBorder}>
                <span>Administration</span>
                <span style={styles.deptPillSage}>11%</span>
              </div>
            </div>
            <div style={styles.bottomNote}>
              Workflow de planification professionnelle pour cliniques, hôpitaux
              et campus de santé universitaires.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Color palette ──────────────────────────────────────────────────────────
// Teal  (logo primary):  #5fa8a0  →  light #eaf5f4  mid #b2dbd8
// Green (logo secondary):#8fbf8f  →  light #eef6ee  mid #c5e0c5
// Blue  (accent):        #3b82f6  →  light #eff6ff  mid #bfdbfe
// Gray  (logo structure):#6b7280
// ---------------------------------------------------------------------------

const styles = {
  page: {
    minHeight: "100vh",
    background: "#ffffff",
    color: "#0f172a",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(95,168,160,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)",
    backgroundSize: "42px 42px",
    pointerEvents: "none",
  },
  header: {
    position: "relative",
    zIndex: 2,
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "20px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  brandIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 18px rgba(95,168,160,0.14)",
    border: "1px solid #b2dbd8",
  },
  brandName: {
    fontSize: "17px",
    fontWeight: "700",
    letterSpacing: "-0.02em",
    color: "#0f172a",
  },
  brandSub: {
    fontSize: "11px",
    color: "#6b7280",
    marginTop: "2px",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
  },
  // Blue accent on the header badge — keeps blue visible up top
  badge: {
    padding: "8px 14px",
    borderRadius: "999px",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    fontSize: "12px",
    fontWeight: "600",
    color: "#2563eb",
  },
  hero: {
    position: "relative",
    zIndex: 2,
    maxWidth: "1280px",
    margin: "0 auto",
    minHeight: "calc(100vh - 82px)",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    alignItems: "center",
    gap: "40px",
    padding: "10px 32px 40px",
  },
  left: {
    maxWidth: "680px",
  },
  // Teal tag under the header
  tag: {
    display: "inline-block",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "#eaf5f4",
    border: "1px solid #b2dbd8",
    color: "#3d8880",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "18px",
  },
  title: {
    fontSize: "clamp(32px, 6vw, 52px)",
    lineHeight: 1.05,
    margin: "0 0 18px 0",
    fontWeight: "800",
    letterSpacing: "-0.04em",
    color: "#0f172a",
  },
  // Title accent: teal → blue, nods to both logo and original blue
  titleAccent: {
    background: "linear-gradient(135deg, #5fa8a0, #3b82f6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  description: {
    fontSize: "17px",
    lineHeight: 1.7,
    color: "#475569",
    maxWidth: "580px",
    marginBottom: "26px",
  },
  actions: {
    display: "flex",
    gap: "14px",
    flexWrap: "wrap",
    marginBottom: "28px",
  },
  // Button: blue → teal gradient, blue origin, teal destination
  primaryBtn: {
    background: "linear-gradient(135deg, #3b82f6, #5fa8a0)",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    padding: "14px 26px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 10px 28px rgba(59,130,246,0.22)",
    transition: "0.2s ease",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(110px, 1fr))",
    gap: "12px",
    maxWidth: "560px",
  },
  statCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "14px 16px",
    boxShadow: "0 6px 20px rgba(15,23,42,0.06)",
  },
  // Stat values in teal
  statValue: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#3d8880",
    marginBottom: "4px",
  },
  statLabel: {
    fontSize: "12px",
    color: "#6b7280",
    lineHeight: 1.4,
  },
  right: {
    display: "flex",
    justifyContent: "center",
  },
  previewCard: {
    width: "100%",
    maxWidth: "480px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "24px",
    padding: "22px",
    boxShadow: "0 16px 50px rgba(15,23,42,0.10)",
  },
  previewTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "18px",
  },
  // Label in blue — keeps blue present in the card
  previewLabel: {
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#2563eb",
    fontWeight: "700",
    marginBottom: "6px",
  },
  previewTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 1.25,
  },
  // Live badge in green
  liveBadge: {
    padding: "7px 12px",
    borderRadius: "999px",
    background: "#eef6ee",
    border: "1px solid #c5e0c5",
    color: "#4a8f4a",
    fontSize: "11px",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },
  previewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "10px",
    marginBottom: "14px",
  },
  metricBox: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "14px",
  },
  metricTitle: {
    fontSize: "11px",
    color: "#6b7280",
    marginBottom: "8px",
  },
  // Metric values in teal
  metricValue: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#3d8880",
  },
  departmentPanel: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "14px",
    marginBottom: "14px",
  },
  panelTitle: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "12px",
  },
  deptRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid #e2e8f0",
    fontSize: "13px",
    color: "#334155",
  },
  deptRowNoBorder: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    fontSize: "13px",
    color: "#334155",
  },
  // Blue pill — original blue accent preserved
  deptPillTeal: {
    background: "#eff6ff",
    color: "#2563eb",
    border: "1px solid #bfdbfe",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "700",
  },
  // Teal pill — logo primary
  deptPillGreen: {
    background: "#eaf5f4",
    color: "#2d7a73",
    border: "1px solid #86c9c4",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "700",
  },
  // Green pill — logo secondary
  deptPillMint: {
    background: "#eef6ee",
    color: "#3a7a3a",
    border: "1px solid #a3ceaa",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "700",
  },
  // Slate/neutral pill — matches original orange role without being loud
  deptPillSage: {
    background: "#f8fafc",
    color: "#475569",
    border: "1px solid #cbd5e1",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "700",
  },
  bottomNote: {
    fontSize: "12px",
    lineHeight: 1.6,
    color: "#6b7280",
  },
};