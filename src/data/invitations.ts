export interface InvitationRecipient {
  name: string;
  designation: string;
  organization: string;
  salutation?: string;
  personalNote?: string;
  token: string;
}

export const INVITATIONS: Record<string, InvitationRecipient> = {
  "pro-chancellor": {
    name: "Shri Nishant Bansal",
    designation: "Hon'ble Pro-Chancellor",
    organization: "Geeta University, Panipat",
    salutation: "Esteemed Pro-Chancellor Sir",
    personalNote: "It is our distinct honor to summon your visionary presence as our Patron-in-Chief for the Grand Conclave of NexHack 2.0.",
    token: "pro-chancellor",
  },
  "vice-chancellor": {
    name: "Prof. (Dr.) Vikas Kohli",
    designation: "Hon'ble Vice-Chancellor",
    organization: "Geeta University, Panipat",
    salutation: "Respected Vice-Chancellor Sir",
    personalNote: "We humbly request the honor of your august presence to inaugurate and preside over the 24-hour national technical hackathon.",
    token: "vice-chancellor",
  },
  "chief-guest": {
    name: "Distinguished Chief Guest",
    designation: "Industry Leader & Innovator",
    organization: "Pioneers of Technology",
    salutation: "Respected Chief Guest",
    personalNote: "You are cordially invited to grace the Grand Opening of NexHack 2.0 and ignite the creative minds of 500+ elite innovators across India.",
    token: "chief-guest",
  },
  "judge-01": {
    name: "Distinguished Grand Jury",
    designation: "Technical Jury & Evaluator",
    organization: "NexHack 2.0 Evaluation Board",
    salutation: "Respected Jury Member",
    personalNote: "Your expertise and critical acumen are formally requested to evaluate the finest digital creations across 10 mystical innovation tracks.",
    token: "judge-01",
  },
  "mentor": {
    name: "Esteemed Technical Mentor",
    designation: "Domain Specialist & Architect",
    organization: "Guild of Innovators",
    salutation: "Respected Mentor",
    personalNote: "We formally invite your esteemed guidance to counsel and illuminate the paths of our 500+ collegiate hackers.",
    token: "mentor",
  },
  "participant": {
    name: "Elite Hacker & Builder",
    designation: "Dimension Seeker",
    organization: "National Innovation Guild",
    salutation: "Greetings Innovator",
    personalNote: "By imperial summons, your prowess has been acknowledged. You are formally challenged to enter the 24-Hour Arena of NexHack 2.0.",
    token: "participant",
  },
};

export const DEFAULT_INVITATION: InvitationRecipient = {
  name: "Honored Guest",
  designation: "Distinguished Leader & Innovator",
  organization: "Geeta University, Panipat",
  salutation: "Respected Guest of Honor",
  personalNote: "You are cordially summoned to witness and celebrate the grand confluence of intellect, innovation, and technological magic at NexHack 2.0.",
  token: "guest",
};

export function getInvitationByToken(token?: string): InvitationRecipient {
  if (!token) return DEFAULT_INVITATION;
  const normalized = token.toLowerCase().trim();
  return (
    INVITATIONS[normalized] || {
      name: decodeURIComponent(token).replace(/[-_]/g, " ").toUpperCase(),
      designation: "Honored Guest",
      organization: "Geeta University Conclave",
      salutation: "Respected Guest",
      personalNote: "We cordially invite you to join us at the 24-Hour National Conclave of NexHack 2.0.",
      token: normalized,
    }
  );
}

export function parseInvitationFromSearchParams(
  searchParams?: Record<string, string | string[] | undefined> | URLSearchParams | null,
  baseToken?: string
): InvitationRecipient {
  const base = getInvitationByToken(baseToken);
  if (!searchParams) return base;

  const getVal = (key: string): string | undefined => {
    if (searchParams instanceof URLSearchParams) {
      return searchParams.get(key) || undefined;
    }
    const v = searchParams[key];
    if (Array.isArray(v)) return v[0];
    return v;
  };

  const name = getVal("name");
  const designation = getVal("designation") || getVal("title");
  const organization = getVal("organization") || getVal("org");
  const salutation = getVal("salutation");
  const personalNote = getVal("note") || getVal("personalNote");

  return {
    name: name || base.name,
    designation: designation || base.designation,
    organization: organization || base.organization,
    salutation: salutation || base.salutation,
    personalNote: personalNote || base.personalNote,
    token: base.token || "custom",
  };
}

export function buildPersonalizedUrl(recipient: InvitationRecipient, origin: string = ""): string {
  const params = new URLSearchParams();
  if (recipient.name) params.set("name", recipient.name);
  if (recipient.designation) params.set("title", recipient.designation);
  if (recipient.organization) params.set("org", recipient.organization);
  if (recipient.personalNote) params.set("note", recipient.personalNote);
  if (recipient.salutation) params.set("salutation", recipient.salutation);

  const base = origin ? `${origin}/invite/${encodeURIComponent(recipient.token || "custom")}` : `/invite/${encodeURIComponent(recipient.token || "custom")}`;
  return `${base}?${params.toString()}`;
}

