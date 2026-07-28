export type StepType = 'text' | 'textarea' | 'select' | 'multiselect' | 'email';

export interface WizardStep {
  id: string;
  question: string;
  subtext?: string;
  type: StepType;
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'business_name',
    question: "What's your business name?",
    subtext: "This is how we'll refer to you in reports and communications.",
    type: 'text',
    placeholder: 'Acme Corp',
    required: true,
  },
  {
    id: 'website',
    question: "What's your website URL?",
    subtext: "We'll analyze it to understand your offer and positioning.",
    type: 'text',
    placeholder: 'https://yoursite.com',
    required: true,
  },
  {
    id: 'target_market',
    question: 'Who is your ideal customer?',
    subtext: 'Describe the company type, size, industry, or role you sell to.',
    type: 'textarea',
    placeholder: 'e.g. SaaS startups with 10–100 employees, hiring a Head of Sales',
    required: true,
  },
  {
    id: 'offer',
    question: 'What do you sell and what problem does it solve?',
    subtext: "A clear one-liner helps us write better outreach on your behalf.",
    type: 'textarea',
    placeholder: 'e.g. We help B2B SaaS companies reduce churn by 40% using AI-driven onboarding flows',
    required: true,
  },
  {
    id: 'monthly_lead_goal',
    question: 'How many qualified leads do you want per month?',
    subtext: "Be ambitious — we can scale up or down once we understand your capacity.",
    type: 'select',
    options: ['10–25', '25–50', '50–100', '100–250', '250+'],
    required: true,
  },
  {
    id: 'current_tools',
    question: 'Which tools are you currently using for outreach or CRM?',
    subtext: "We'll integrate wherever possible.",
    type: 'multiselect',
    options: ['HubSpot', 'Salesforce', 'Pipedrive', 'Apollo', 'LinkedIn Sales Navigator', 'Instantly', 'Lemlist', 'None yet'],
  },
  {
    id: 'past_challenges',
    question: 'What has NOT worked for lead gen in the past?',
    subtext: "We'll avoid repeating those mistakes.",
    type: 'textarea',
    placeholder: 'e.g. Cold email bounced a lot, LinkedIn outreach felt spammy, agencies overpromised...',
  },
  {
    id: 'contact_email',
    question: "What's the best email to reach you?",
    subtext: "We'll send your onboarding confirmation and weekly reports here.",
    type: 'email',
    placeholder: 'you@company.com',
    required: true,
  },
];
