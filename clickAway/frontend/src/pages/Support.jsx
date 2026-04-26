import React from "react";
import { HelpCircle, MessageSquare, BookOpen, Mail } from "lucide-react";

export default function Support() {
  return (
    <div className="space-y-10 animate-fade-in-up p-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
          Help Center
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight">Support Console</h1>
        <p className="text-muted-foreground font-medium max-w-lg leading-relaxed">
          Access platform documentation, report infrastructure issues, or contact the governance team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        <div className="sf-card p-10 flex flex-col items-start gap-6 group hover:border-primary/40 transition-all bg-sf-bg-soft/40 backdrop-blur-xl">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner group-hover:scale-110 transition-transform">
            <BookOpen size={28} />
          </div>
          <div>
             <h3 className="text-2xl font-bold mb-3">Documentation Engine</h3>
             <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
               Browse our comprehensive knowledge base for guides on booking resources, managing your profile, and utilizing the digital twin interface.
             </p>
             <button className="sf-btn-primary px-6 py-3 text-xs">Access Knowledge Base</button>
          </div>
        </div>

        <div className="sf-card p-10 flex flex-col items-start gap-6 group hover:border-primary/40 transition-all bg-sf-bg-soft/40 backdrop-blur-xl">
          <div className="h-16 w-16 rounded-2xl bg-accent/50 flex items-center justify-center text-muted-foreground border border-border/40 shadow-inner group-hover:scale-110 group-hover:text-foreground transition-all">
            <Mail size={28} />
          </div>
          <div>
             <h3 className="text-2xl font-bold mb-3">Governance Contact</h3>
             <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
               Need direct assistance? Open a priority ticket with our infrastructure administrators or reach out via the 24/7 dedicated email channel.
             </p>
             <button className="sf-btn-secondary px-6 py-3 text-xs">Open Priority Ticket</button>
          </div>
        </div>
      </div>
    </div>
  );
}
