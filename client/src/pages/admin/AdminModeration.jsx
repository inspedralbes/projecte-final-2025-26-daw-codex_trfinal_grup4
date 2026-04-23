import React from "react";
import AdminUsers from "./AdminUsers";

export default function AdminModeration() {
  return (
    <AdminUsers
      initialBanStatus="timeout"
      title="Moderación de Timeouts y Baneos"
    />
  );
}
