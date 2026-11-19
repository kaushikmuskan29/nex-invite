import React from "react";
import CinematicExperience from "@/components/cinematic/CinematicExperience";
import { parseInvitationFromSearchParams } from "@/data/invitations";

interface HomePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams;
  const recipient = parseInvitationFromSearchParams(resolvedSearchParams);

  return <CinematicExperience recipient={recipient} />;
}
