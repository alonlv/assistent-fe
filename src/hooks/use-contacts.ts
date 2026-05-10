"use client";

import { useQuery } from "@tanstack/react-query";
import type { Contact, ContactIdentity } from "@/types/api";

export type { Contact, ContactIdentity };

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
