export interface FaqItem {
  id: string
  question: string
  answer: string
}

export const faqItems: FaqItem[] = [
  {
    id: 'what-automates',
    question: 'What does LeadFlow automate end to end?',
    answer:
      'LeadFlow runs a single pipeline: scrape jobs monitor targets on the web, Groq-powered page analysis extracts typed intent signals, high-intent signals convert into scored leads, creative agents generate account-specific copy, outreach agents run multi-channel sequences, and the booking agent proposes calendar slots from live Google Calendar availability — closing the loop from discovery to confirmed meeting.',
  },
  {
    id: 'data-sources',
    question: 'What sources and signal types does it monitor?',
    answer:
      'Scrape jobs support web, social, competitor, and review targets. AI analysis surfaces hiring spikes, funding news, pricing shifts, competitor intel, mentions, and reviews — each stored as structured signals with priority tiers so your team can qualify or dismiss before anything becomes a lead.',
  },
  {
    id: 'qualification',
    question: 'How does AI qualification work — and where do humans step in?',
    answer:
      'The vetting agent reviews outreach conversations and returns qualified, needs more info, disqualified, or handoff verdicts. Leads carry ICP scores and priority tiers. Your team stays in control: review signals, approve or reject creatives, update lead status, pause campaigns, and trigger sales handoffs before anything goes live.',
  },
  {
    id: 'outreach-channels',
    question: 'Which outreach channels are supported?',
    answer:
      'Email, SMS, voice, and in-app conversation threads. Outreach agents draft context-aware sequences using lead intelligence and deployment data. Connect Resend for email or Retell/Vapi for voice when you are ready to send externally — until then, every message is captured in-thread for review and demo walkthroughs.',
  },
  {
    id: 'calendar-booking',
    question: 'Can it actually book meetings on rep calendars?',
    answer:
      'Yes. Connect Google Calendar and the booking agent reads real availability, proposes optimal slots from conversation context, and confirms appointments. Qualified or handoff conversations can trigger automated sales handoff — so reps join when intent is proven, not when scheduling is still being negotiated.',
  },
  {
    id: 'setup-time',
    question: 'How fast can we go from signup to a live pipeline?',
    answer:
      'Most teams launch scrape jobs and see their first signals within hours. Connecting Google Calendar unlocks booking. Channel credentials (email, voice) are optional — the full agent workflow runs in-app immediately, which makes LeadFlow well suited for investor demos and client prototypes before you wire production integrations.',
  },
  {
    id: 'who-for',
    question: 'Who is LeadFlow built for?',
    answer:
      'Growth and sales teams tired of manual prospecting, fragmented tools, and leads that stall between outreach and booked meetings. If your bottleneck is research, qualification, personalized copy, or calendar coordination — not closing — LeadFlow is built for your workflow.',
  },
]
