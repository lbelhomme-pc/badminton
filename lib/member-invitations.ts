export type MemberInvitationStatus = "pending" | "used" | "expired" | "revoked";

export interface MemberInvitationLike {
  status: MemberInvitationStatus;
  expires_at: string;
  used_at?: string | null;
  revoked_at?: string | null;
}

export type InvitationAccessState = "usable" | "used" | "expired" | "revoked";

export function getInvitationAccessState(invitation: MemberInvitationLike, now = new Date()): InvitationAccessState {
  if (invitation.status === "used" || invitation.used_at) return "used";
  if (invitation.status === "revoked" || invitation.revoked_at) return "revoked";
  if (invitation.status === "expired" || new Date(invitation.expires_at) <= now) return "expired";
  return "usable";
}

export function isInvitationUsable(invitation: MemberInvitationLike, now = new Date()) {
  return getInvitationAccessState(invitation, now) === "usable";
}

export function invitationAccessMessage(state: InvitationAccessState) {
  switch (state) {
    case "used":
      return "Cette invitation a déjà été utilisée.";
    case "expired":
      return "Cette invitation a expiré. Demande un nouveau lien au club.";
    case "revoked":
      return "Cette invitation a été révoquée par le club.";
    default:
      return "Invitation valide.";
  }
}
