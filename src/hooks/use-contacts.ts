"use client";

import { useQuery } from "@tanstack/react-query";

export interface ContactIdentity {
  platform: string;
  id: string;
  label: string;
}

export interface Contact {
  name: string;
  canonical_id: string;
  identities: ContactIdentity[];
}

async function fetchContacts(): Promise<Contact[]> {
  const res = await fetch("/api/admin/contacts");
  if (!res.ok) throw new Error("Failed to fetch contacts");
  const data = await res.json();
  return data.contacts || [];
}

export function useContacts() {
  return useQuery({
    queryKey: ["contacts"],
    queryFn: fetchContacts,
  });
}
