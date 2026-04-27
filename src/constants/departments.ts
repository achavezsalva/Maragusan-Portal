export const DEPARTMENT_CATEGORIES = [
  {
    title: "Executive Offices",
    depts: ["Office of the Mayor", "Office of the Vice Mayor", "Sangguniang Bayan (Legislative Council)"]
  },
  {
    title: "Financial & Administrative",
    depts: ["Municipal Treasurer’s Office", "Municipal Budget Office", "Municipal Accounting Office", "Municipal Assessor’s Office"]
  },
  {
    title: "Social & Public Services",
    depts: ["Municipal Health Office (MHO)", "Municipal Social Welfare and Development Office (MSWDO)", "Municipal Agriculture Office (MAO)"]
  },
  {
    title: "Infrastructure & Planning",
    depts: ["Municipal Engineering Office", "Municipal Planning and Development Office (MPDO)"]
  },
  {
    title: "Civil & Legal Services",
    depts: ["Municipal Civil Registrar’s Office", "Municipal Legal Office"]
  },
  {
    title: "Safety & Emergency",
    depts: ["Municipal Disaster Risk Reduction and Management Office (MDRRMO)", "Bureau of Fire Protection (BFP) – Local Station", "Philippine National Police (PNP) – Local Station"]
  },
  {
    title: "Environment & Community",
    depts: ["Municipal Environment and Natural Resources Office (MENRO)"]
  },
  {
    title: "Business & Employment",
    depts: ["Business Permits and Licensing Office (BPLO)", "Public Employment Service Office (PESO)"]
  },
  {
    title: "Culture, Education & Information",
    depts: ["Municipal Tourism Office", "Municipal Information Office", "Library Services"]
  }
];

export const ALL_DEPARTMENTS = DEPARTMENT_CATEGORIES.flatMap(cat => cat.depts);
