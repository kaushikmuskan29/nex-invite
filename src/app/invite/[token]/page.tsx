import React from "react";
import type { Metadata } from "next";
import CinematicExperience from "@/components/cinematic/CinematicExperience";
import { parseInvitationFromSearchParams } from "@/data/invitations";

interface PageProps {
  params: Promise<{
    token: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const [{ token }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const recipient = parseInvitationFromSearchParams(resolvedSearchParams, token);

  return {
    title: `Imperial Summons: ${recipient.name} | NEXHACK 2.0`,
    description: `Official invitation to ${recipient.name} (${recipient.designation}) for NEXHACK 2.0 at Geeta University, Panipat.`,
    openGraph: {
      title: `NEXHACK 2.0 | Imperial Summons for ${recipient.name}`,
      description: `You have received an imperial invitation to NEXHACK 2.0 at Geeta University.`,
      type: "website",
    },
  };
}

export default async function InvitePage({ params, searchParams }: PageProps) {
  const [{ token }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const recipient = parseInvitationFromSearchParams(resolvedSearchParams, token);

  return <CinematicExperience recipient={recipient} />;
}
