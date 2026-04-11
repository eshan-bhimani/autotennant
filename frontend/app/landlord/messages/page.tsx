"use client";

import MessagingView from "@/components/shared/MessagingView";

export default function LandlordMessagesPage() {
  return (
    <div>
      <h1 className="text-[28px] font-bold text-text-primary">Messages</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Communicate with your tenants about properties, applications, and payments.
      </p>
      <div className="mt-6">
        <MessagingView />
      </div>
    </div>
  );
}
