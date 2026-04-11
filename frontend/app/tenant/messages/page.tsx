"use client";

import MessagingView from "@/components/shared/MessagingView";

export default function TenantMessagesPage() {
  return (
    <div>
      <h1 className="text-[28px] font-bold text-text-primary">Messages</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Chat with your landlord about your application, lease, or maintenance.
      </p>
      <div className="mt-6">
        <MessagingView />
      </div>
    </div>
  );
}
