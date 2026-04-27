export interface DepartmentInfo {
  id: string;
  name: string;
  description: string;
  head: string;
  contact: {
    email: string;
    phone: string;
    location: string;
  };
  services: string[];
}

export const DEPARTMENT_CATEGORIES = [
  {
    title: "Executive Offices",
    depts: [
      {
        id: "mayor",
        name: "Office of the Mayor",
        description: "The primary executive office of the municipality, responsible for overall governance, policy implementation, and public administration.",
        head: "Hon. Cesar Clarion Colina Sr.",
        contact: {
          email: "mayor@maragusan.gov.ph",
          phone: "+63 (082) 374-1234",
          location: "1st Floor, Municipal Hall, Poblacion, Maragusan"
        },
        services: ["Issuance of Business Permits", "Civil Wedding Officiation", "Public Consultation", "Crisis Management"]
      },
      {
        id: "vice-mayor",
        name: "Office of the Vice Mayor",
        description: "Assists the Mayor in executive functions and serves as the presiding officer of the Sangguniang Bayan.",
        head: "Hon. Osberht Yanong",
        contact: {
          email: "vmayor@maragusan.gov.ph",
          phone: "+63 (082) 374-1235",
          location: "2nd Floor, Legislative Building, Maragusan"
        },
        services: ["Legislative Assistance", "Community Outreach", "Public Hearing Coordination"]
      },
      {
        id: "legislative",
        name: "Sangguniang Bayan (Legislative Council)",
        description: "The legislative body of the municipality responsible for enacting ordinances and resolutions for the general welfare.",
        head: "Hon. Osberht Yanong (Presiding)",
        contact: {
          email: "sb@maragusan.gov.ph",
          phone: "+63 (082) 374-1236",
          location: "Legislative Hall, Maragusan"
        },
        services: ["Enactment of Ordinances", "Passage of Resolutions", "Accreditation of NGOs/POs", "Legislative Research"]
      }
    ]
  },
  {
    title: "Financial & Administrative",
    depts: [
      {
        id: "treasurer",
        name: "Municipal Treasurer’s Office",
        description: "Responsible for the collection of taxes, fees, and charges, and the proper management of municipal funds.",
        head: "Ms. Divina M. Garcia",
        contact: {
          email: "treasury@maragusan.gov.ph",
          phone: "+63 (082) 374-2211",
          location: "Ground Floor, Left Wing, Municipal Hall"
        },
        services: ["Property Tax Collection", "Business Tax Assessment", "Issuance of Community Tax Certificates (Cedula)", "Disbursement of Funds"]
      },
      {
        id: "assessor",
        name: "Municipal Assessor’s Office",
        description: "Manages the discovery, listing, and appraisal of all real properties in the municipality for taxation purposes.",
        head: "Engr. Roberto T. Santos",
        contact: {
          email: "assessor@maragusan.gov.ph",
          phone: "+63 (082) 374-2212",
          location: "Ground Floor, Right Wing, Municipal Hall"
        },
        services: ["Property Appraisal", "Tax Declaration Issuance", "Transfer of Property Ownership", "Certified True Copy of Tax Dec"]
      },
      {
        id: "accounting",
        name: "Municipal Accounting Office",
        description: "Responsible for managing the financial records and reporting of the municipal government.",
        head: "Ms. Elena R. Castro",
        contact: {
          email: "accounting@maragusan.gov.ph",
          phone: "+63 (082) 374-2213",
          location: "2nd Floor, Municipal Hall"
        },
        services: ["Bookkeeping", "Financial Statement Preparation", "Payroll Processing", "Audit Compliance"]
      },
      {
        id: "budget",
        name: "Municipal Budget Office",
        description: "Responsible for the preparation and execution of the municipal budget in accordance with law.",
        head: "Mr. Felipe G. Luna",
        contact: {
          email: "budget@maragusan.gov.ph",
          phone: "+63 (082) 374-2214",
          location: "2nd Floor, Municipal Hall"
        },
        services: ["Budget Preparation", "Allotment Release", "Financial Monitoring", "Budget Review"]
      }
    ]
  },
  {
    title: "Social & Public Services",
    depts: [
      {
        id: "health",
        name: "Municipal Health Office (MHO)",
        description: "Provides primary healthcare services, public health programs, and disease prevention initiatives for Maragusanons.",
        head: "Dr. Maria Clara P. Dela Cruz",
        contact: {
          email: "health@maragusan.gov.ph",
          phone: "+63 (082) 374-3311",
          location: "Main Health Center, Brgy. Poblacion"
        },
        services: ["Medical Consultation", "Immunization", "Maternal Care", "Dental Services", "Laboratory Tests"]
      },
      {
        id: "mswdo",
        name: "Municipal Social Welfare and Development Office (MSWDO)",
        description: "Implements social welfare programs for vulnerable sectors including PWDs, senior citizens, and women and children.",
        head: "Ms. Susan Q. Ramos",
        contact: {
          email: "mswdo@maragusan.gov.ph",
          phone: "+63 (082) 374-3312",
          location: "Social Welfare Center, Maragusan"
        },
        services: ["Crisis Intervention", "Senior Citizen ID Issuance", "PWD Certification", "Adoption and Foster Care Services"]
      },
      {
        id: "agriculture",
        name: "Municipal Agriculture Office (MAO)",
        description: "Provides technical assistance and support to local farmers to increase agricultural productivity and ensure food security.",
        head: "Mr. Ricardo J. Velasco",
        contact: {
          email: "agriculture@maragusan.gov.ph",
          phone: "+63 (082) 374-3313",
          location: "Department of Agriculture Bldg, Maragusan"
        },
        services: ["Technical Assistance for Farmers", "Distribution of Seeds/Fertilizers", "Soil Analysis", "Livestock Vaccination"]
      }
    ]
  },
  {
    title: "Infrastructure & Planning",
    depts: [
      {
        id: "engineering",
        name: "Municipal Engineering Office",
        description: "Responsible for the planning, design, and implementation of public infrastructure projects in the municipality.",
        head: "Engr. Ramon L. Garcia",
        contact: {
          email: "engineering@maragusan.gov.ph",
          phone: "+63 (082) 374-4411",
          location: "Engineering Annex, Municipal Hall Compound"
        },
        services: ["Building Permit Issuance", "Infrastructure Planning", "Road Maintenance", "Public Facility Design"]
      },
      {
        id: "mpdo",
        name: "Municipal Planning and Development Office (MPDO)",
        description: "Formulates comprehensive development plans and monitors the progress of municipal programs and projects.",
        head: "Arch. Jose S. Lim",
        contact: {
          email: "planning@maragusan.gov.ph",
          phone: "+63 (082) 374-4412",
          location: "2nd Floor, Planning Office, Municipal Hall"
        },
        services: ["Zoning Clearance", "Socio-Economic Profile Preparation", "Town Planning", "Project Monitoring"]
      }
    ]
  },
  {
    title: "Civil & Legal Services",
    depts: [
      {
        id: "civil-registrar",
        name: "Municipal Civil Registrar’s Office",
        description: "Responsible for the registration of vital events such as births, marriages, and deaths.",
        head: "Ms. Rosario F. Mendoza",
        contact: {
          email: "registrar@maragusan.gov.ph",
          phone: "+63 (082) 374-5511",
          location: "Ground Floor, Civil Registry, Municipal Hall"
        },
        services: ["Birth Registration", "Marriage License Issuance", "Death Registration", "Correction of Clerical Error"]
      },
      {
        id: "legal",
        name: "Municipal Legal Office",
        description: "Provides legal advice and representation to the municipal government and its officials.",
        head: "Atty. Benedict P. Reyes",
        contact: {
          email: "legal@maragusan.gov.ph",
          phone: "+63 (082) 374-5512",
          location: "2nd Floor, Legislative Bldg, Maragusan"
        },
        services: ["Legal Advice", "Contract Review", "Representation in Legal Proceedings"]
      }
    ]
  },
  {
    title: "Safety & Emergency",
    depts: [
      {
        id: "mdrrmo",
        name: "Municipal Disaster Risk Reduction and Management Office (MDRRMO)",
        description: "Ensures the safety of the municipality through disaster preparedness, response, and risk mitigation.",
        head: "Mr. Alexander T. Cruz",
        contact: {
          email: "mdrrmo@maragusan.gov.ph",
          phone: "911 / +63 (082) 374-6611",
          location: "Disaster Operations Center, Maragusan"
        },
        services: ["Emergency Rescue", "Disaster Awareness Training", "Risk Map Assessment", "Flood Monitoring"]
      },
      {
        id: "bfp",
        name: "Bureau of Fire Protection (BFP)",
        description: "Responsible for the prevention and suppression of all destructive fires and implementation of the Fire Code.",
        head: "SInsp. David M. Tan",
        contact: {
          email: "bfp@maragusan.gov.ph",
          phone: "+63 (082) 374-6612",
          location: "Fire Station, Poblacion, Maragusan"
        },
        services: ["Fire Suppression", "Fire Safety Inspection", "Fire Prevention Seminars"]
      },
      {
        id: "pnp",
        name: "Philippine National Police (PNP)",
        description: "Enforces laws and maintains peace and order within the municipality of Maragusan.",
        head: "PLTCOL James R. Puno",
        contact: {
          email: "pnp@maragusan.gov.ph",
          phone: "+63 (082) 374-6613",
          location: "Police Station, Maragusan"
        },
        services: ["Law Enforcement", "Police Clearance Issuance", "Security Assistance", "Crime Investigation"]
      }
    ]
  },
  {
    title: "Environment & Community",
    depts: [
      {
        id: "menro",
        name: "Municipal Environment and Natural Resources Office (MENRO)",
        description: "Responsible for the protection and management of the municipality's natural resources and environment.",
        head: "Mr. Salvador G. Verde",
        contact: {
          email: "menro@maragusan.gov.ph",
          phone: "+63 (082) 374-8811",
          location: "Solid Waste Management Facility, Maragusan"
        },
        services: ["Solid Waste Management", "Reforestation Programs", "Environmental Clearance", "Anti-Pollution Campaigns"]
      }
    ]
  },
  {
    title: "Business & Employment",
    depts: [
      {
        id: "bplo",
        name: "Business Permits and Licensing Office (BPLO)",
        description: "Facilitates the registration and licensing of businesses operating within the municipality.",
        head: "Ms. Isabela K. Lopez",
        contact: {
          email: "bplo@maragusan.gov.ph",
          phone: "+63 (082) 374-9911",
          location: "Business Center, Municipal Hall"
        },
        services: ["Business Permit Processing", "Occupational Permit", "Liquor License Issuance", "Business Inspection"]
      },
      {
        id: "peso",
        name: "Public Employment Service Office (PESO)",
        description: "Assists job seekers in finding employment and provides labor market information and services.",
        head: "Mr. Antonio O. Trabajo",
        contact: {
          email: "peso@maragusan.gov.ph",
          phone: "+63 (082) 374-9912",
          location: "PESO Office, Maragusan"
        },
        services: ["Job Placement Assistance", "Career Guidance", "Labor Market Information", "OFW Assistance"]
      }
    ]
  },
  {
    title: "Culture, Education & Information",
    depts: [
      {
        id: "tourism",
        name: "Municipal Tourism Office",
        description: "Promotes Maragusan as a premier Highland Haven tourist destination and manages local cultural heritage sites.",
        head: "Ms. Jonalyn B. Salva",
        contact: {
          email: "tourism@maragusan.gov.ph",
          phone: "+63 (082) 374-7711",
          location: "Tourism Center, Brgy. Poblacion"
        },
        services: ["Tourist Assistance", "Event Coordination", "Promotional Campaigns", "Cultural Heritage Preservation"]
      },
      {
        id: "information",
        name: "Municipal Information Office (MIO)",
        description: "Manages the dissemination of information about municipal programs, projects, and activities.",
        head: "Mr. Arturo P. Salva",
        contact: {
          email: "info@maragusan.gov.ph",
          phone: "+63 (082) 374-7712",
          location: "Information Center, Municipal Hall"
        },
        services: ["Public Notices", "Press Releases", "Social Media Management", "Community Engagement"]
      }
    ]
  }
];

export const ALL_DEPARTMENTS = DEPARTMENT_CATEGORIES.flatMap(cat => cat.depts.map(d => d.name));
export const ALL_DEPT_DETAILS = DEPARTMENT_CATEGORIES.flatMap(cat => cat.depts);
