import React from "react";
import { Settings as SettingsIcon, Bell, Shield, Key } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-10 animate-fade-in-up p-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
          Preferences
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight">Platform Settings</h1>
        <p className="text-muted-foreground font-medium max-w-lg leading-relaxed">
          Manage your account configuration, security preferences, and notification channels.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        <div className="sf-card p-8 group hover:border-primary/40 transition-all bg-sf-bg-soft/40 backdrop-blur-xl">
          <div className="h-14 w-14 rounded-2xl bg-accent/50 flex items-center justify-center text-muted-foreground mb-6 group-hover:text-primary transition-colors">
            <Bell size={24} />
          </div>
          <h3 className="text-lg font-bold mb-2">Notification Directives</h3>
          <p className="text-sm text-muted-foreground">Configure email and SMS alerts for upcoming sessions and infrastructure reports.</p>
        </div>
        
        <div className="sf-card p-8 group hover:border-primary/40 transition-all bg-sf-bg-soft/40 backdrop-blur-xl">
          <div className="h-14 w-14 rounded-2xl bg-accent/50 flex items-center justify-center text-muted-foreground mb-6 group-hover:text-primary transition-colors">
            <Shield size={24} />
          </div>
          <h3 className="text-lg font-bold mb-2">Security Parameters</h3>
          <p className="text-sm text-muted-foreground">Manage two-factor authentication and review recent login activity across devices.</p>
        </div>

        <div className="sf-card p-8 group hover:border-primary/40 transition-all bg-sf-bg-soft/40 backdrop-blur-xl">
          <div className="h-14 w-14 rounded-2xl bg-accent/50 flex items-center justify-center text-muted-foreground mb-6 group-hover:text-primary transition-colors">
            <Key size={24} />
          </div>
          <h3 className="text-lg font-bold mb-2">Access Credentials</h3>
          <p className="text-sm text-muted-foreground">Update your password or request identity verification tokens from administration.</p>
        </div>
      </div>
    </div>
  );
}
