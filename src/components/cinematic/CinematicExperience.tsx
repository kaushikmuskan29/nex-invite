"use client";

import React from "react";
import Invitation from "../invitation/Invitation";
import type { InvitationRecipient } from "@/data/invitations";

export default function CinematicExperience({ recipient }: { recipient: InvitationRecipient }) {
  return <Invitation recipient={recipient} />;
}
