'use client';

import { AdminView } from "@/components/views/AdminView";
import { CoordinatorView } from "@/components/views/CoordinatorView";
import { TeacherView } from "@/components/views/TeacherView";
import { getAccessToken, getUserScope } from "@/lib/auth";

export function Home() {
  const token = getAccessToken();
  const scopes = getUserScope(token!);

  // Verifica se o usuário é ADMIN
  if (scopes.includes("ADMIN")) {
    return <AdminView />;
  }

  // Verifica se o usuário é COORDINATOR
  if (scopes.includes("COORDINATOR")) {
    return <CoordinatorView />;
  }

  // Verifica se o usuário é TEACHER
  if (scopes.includes("TEACHER")) {
    return <TeacherView />;
  }
}
