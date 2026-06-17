"use client";

import React from "react";

export default function TrackLink({
  href,
  className,
  children,
  firmId,
  type,
  target,
  rel,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  firmId: string;
  type: string;
  target?: string;
  rel?: string;
}) {
  const handleClick = () => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firm_id: firmId, type }),
      keepalive: true,
    }).catch(() => {});
  };

  return (
    <a href={href} className={className} onClick={handleClick} target={target} rel={rel}>
      {children}
    </a>
  );
}
