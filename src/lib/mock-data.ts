export type ChatHistoryItem = {
  id: string;
  title: string;
  reflective?: boolean;
  time: string;
};

export const chatHistory: ChatHistoryItem[] = [
  { id: "1", title: "PM career change deliberation", reflective: true, time: "Today" },
  { id: "2", title: "Series A pitch narrative", time: "Today" },
  { id: "3", title: "Reframing burnout signals", reflective: true, time: "Yesterday" },
  { id: "4", title: "Hiring rubric for staff PMs", time: "Yesterday" },
  { id: "5", title: "Quarterly OKR critique", time: "Previous 7 days" },
  { id: "6", title: "Reading list — decision making", time: "Previous 7 days" },
  { id: "7", title: "Negotiating equity refresh", reflective: true, time: "Previous 30 days" },
  { id: "8", title: "Product principles draft", time: "Previous 30 days" },
];

export type ReflectiveQuestion = {
  id: string;
  prompt: string;
  options: string[];
};

export const reflectiveQuestions: ReflectiveQuestion[] = [
  {
    id: "q1",
    prompt: "If forced to choose, which matters more right now?",
    options: ["Rapid learning and upside", "Stability and predictability"],
  },
  {
    id: "q2",
    prompt:
      "Would you still consider switching if work–life balance became significantly worse for 1–2 years?",
    options: ["Yes", "No", "Unsure"],
  },
  {
    id: "q3",
    prompt: "How important is AI startup experience for your long-term goals?",
    options: ["Very important", "Somewhat important", "Not a major factor"],
  },
];

export const mockAnswer = `There isn't a single right answer here — the decision sits on a few axes that only you can weigh. Based on what you've shared, here's how I'd think about it.

**Where the move likely pays off**
Joining an early-stage AI startup tends to compress learning. You'd be exposed to ambiguous scope, faster iteration cycles, and decisions that would take quarters to reach you at a larger company. If your priority over the next 2–3 years is range and optionality, that environment usually delivers it.

**Where it can quietly cost you**
Stability isn't only financial. It's also the compounding effect of relationships, internal credibility, and the projects you only get to lead once you've been somewhere long enough. Leaving resets some of that. Early-stage roles also have a wider variance — the upside is real, but so is the chance the company doesn't reach its next milestone.

**A useful reframe**
The strongest version of this question isn't *"stay vs. leave"* — it's *"what evidence would make me confident either way?"* If you can name 2–3 things you'd need to see (about the team, the market, your own energy), the decision usually clarifies itself within a few weeks.`;

export type Perspective = {
  id: string;
  title: string;
  body: string;
};

export const perspectives: Perspective[] = [
  {
    id: "flip",
    title: "Assumption Flip",
    body: "You're framing this as a career bet on AI. Flip it: assume AI tooling becomes commodity within 3 years and the differentiator is judgment built across cycles. Under that assumption, staying at a company where you can lead larger surfaces may compound faster than chasing the label of 'AI startup.'",
  },
  {
    id: "stakeholder",
    title: "Stakeholder Shift",
    body: "Most of the framing here is about your career. Consider the people whose lives change with this decision — a partner, a team you'd leave mid-roadmap, a future hiring manager reading your résumé in five years. Each of them weighs stability, ambition, and momentum differently. Their views aren't decisive, but they often surface tradeoffs you've quietly normalized.",
  },
  {
    id: "evidence",
    title: "Evidence Gap",
    body: "You haven't mentioned what you actually know about this startup — founder track record, hiring velocity, retention of recent senior hires, customer concentration. Strong intuition with thin evidence is a common pattern before high-regret decisions. A week of targeted diligence usually changes the conversation more than another month of deliberation.",
  },
];

export type ChecklistItem = {
  id: string;
  label: string;
  detail: string;
};

export const checklist: ChecklistItem[] = [
  {
    id: "runway",
    label: "Funding runway",
    detail: "Cash on hand, burn rate, and the realistic timeline to the next raise — not just the headline number.",
  },
  {
    id: "attrition",
    label: "Team attrition",
    detail: "Who has left in the last 6 months and why. Quiet senior departures are a stronger signal than public ones.",
  },
  {
    id: "scope",
    label: "PM ownership scope",
    detail: "What you'd actually own end-to-end, and what would be decided above you. Titles often overstate scope at this stage.",
  },
  {
    id: "reporting",
    label: "Reporting structure",
    detail: "Who you report to, how decisions are made, and whether that line is likely to change in the next two quarters.",
  },
  {
    id: "comp",
    label: "Compensation trajectory",
    detail: "Base, refresh policy, and how equity vests under realistic (not best-case) outcomes.",
  },
  {
    id: "pmf",
    label: "Product–market fit",
    detail: "Retention curves and qualitative customer pull, not pipeline. Ask to see the data, not the deck.",
  },
];
