// Single source of truth for all story content. Edit here — components only render.

import { photos, type Photo } from "./photos";

export type Milestone = {
  id: string;
  title: string;
  body: string;
  glyph: "spark" | "build" | "rocket" | "bug" | "people";
  photo: Photo;
};
export type Mood = "happy" | "wave" | "coffee" | "think" | "cool" | "heart" | "fix" | "rocket";
export type QA = {
  id: string;
  question: string;
  keywords: string[];
  answer: string;
  suggested?: boolean;
  mood: Mood;
};

export const farewell = {
  agent: "Vishal",
  organization: "Mastercard",
  currentDepartment: "Foundry R&D",
  destination: "Another Mastercard department",

  boot: {
    lines: [
      "> INITIALIZING AGENT HANDOVER PROTOCOL...",
      "> Establishing secure session...",
      "> Identifying agent...",
      "> Agent detected: VISHAL",
      "> Current environment: FOUNDRY R&D",
      "> Organization: MASTERCARD",
      "> Transition event detected...",
      "> Running mission completion assessment...",
      "> Status: MISSION COMPLETE ✓",
      "> Preparing next deployment...",
    ],
    title: "AGENT VISHAL",
    tagline: "One mission ends. Another begins.",
    cta: "Initialize handover",
  },

  profile: {
    fields: [
      ["Agent", "Vishal"],
      ["Organization", "Mastercard"],
      ["Current Mission", "Foundry R&D"],
      ["Transition", "Internal Department Move"],
      ["Previous Mission", "Completed"],
      ["Next Mission", "Initializing"],
      ["Collaboration Status", "Permanently Active"],
    ] as [string, string][],
    metrics: [
      ["Ideas Explored", "Countless"],
      ["Problems Solved", "Too many to count"],
      ["Production Deployments", "Mission accomplished"],
      ["Learning Mode", "Always enabled"],
      ["Gratitude Level", "∞"],
    ] as [string, string][],
    disclaimer: "Playful labels. Not audited statistics.",
    message: "A successful mission is never the work of a single agent.",
    cta: "Retrieve mission memories",
  },

  milestones: [
    {
      id: "m1",
      photo: photos.makerspace,
      glyph: "spark",
      title: "Entering Foundry R&D",
      body: "A new environment full of opportunities to explore, learn, and experiment.",
    },
    {
      id: "m2",
      photo: photos.hackathon,
      glyph: "build",
      title: "Building Something Meaningful",
      body: "Turning ideas and architectural discussions into a working product.",
    },
    {
      id: "m3",
      photo: photos.codedrive,
      glyph: "rocket",
      title: "Agent Suite Proto",
      body: "A journey from the first commit to production in approximately 75 days.",
    },
    {
      id: "m4",
      photo: photos.codeForChange,
      glyph: "bug",
      title: "Sharing the Craft",
      body: "Code for Change — passing on the curiosity, debugging stamina, and teamwork that Foundry taught.",
    },
    {
      id: "m5",
      photo: photos.dinner,
      glyph: "people",
      title: "The People Behind the Mission",
      body: "Collaborators, mentors, teammates, and everyone who made the journey memorable.",
    },
  ] as Milestone[],

  memoryAnalysis: [
    "MEMORY ANALYSIS COMPLETE",
    "",
    "Technical achievements detected ✓",
    "Innovation detected ✓",
    "Growth detected ✓",
    "",
    "Unusual finding detected...",
  ],
  memoryFinding: "SUCCESS WAS NEVER AN INDIVIDUAL VARIABLE.",
  memoryCta: "Run dependency analysis",

  dependency: {
    checks: ["Architecture", "Engineering", "Innovation", "Delivery"],
    critical: [
      ["TYPE", "HUMAN CONNECTION"],
      ["IMPORTANCE", "IRREPLACEABLE"],
      ["STATUS", "PERMANENT"],
    ] as [string, string][],
    message: [
      "After analyzing every milestone, every challenge, and every achievement, one thing became clear.",
      "The most valuable part of this journey wasn't the architecture we designed or the code we shipped.",
      "It was the people I had the privilege of building it with.",
      "Thank you for the trust, the support, the collaboration, the conversations, and the memories.",
      "The mission may be changing, but the connections remain.",
    ],
    cta: "Meet my digital twin",
  },

  assistant: {
    name: "VISHAL.AI",
    subtitle: "Legacy knowledge interface. Still online.",
    disclaimer: "A playful digital twin with curated answers — not a real autonomous agent.",
    greeting:
      "Hello. I'm a curated echo of Vishal. Ask me anything — or try a terminal command. Psst: there's a hidden command that unlocks bonus footage. Hint: `sudo unlock ...`",
    cta: "Complete handover",
  },

  final: {
    report: [
      ["Mission", "COMPLETED ✓"],
      ["Knowledge", "RETAINED ✓"],
      ["Memories", "PRESERVED ✓"],
      ["Gratitude", "UNLIMITED ✓"],
      ["Next Mission", "READY ✓"],
    ] as [string, string][],
    terminateLabel: "Terminate old connections",
    error: [
      "ERROR 403: OPERATION FORBIDDEN",
      "",
      "Human connections cannot be terminated.",
      "",
      "Reason:",
      "Some dependencies are designed to last forever.",
    ],
    heading: "MISSION COMPLETE.",
    subheading: "NEXT CHAPTER UNLOCKED.",
    message: [
      "Thank you, Foundry R&D, for the experiences, lessons, opportunities, and most importantly, the people.",
      "I'm moving to a new department, but I'm not going far.",
      "Looking forward to crossing paths again.",
    ],
    signature: "— Vishal",
    tagline: "Same Mastercard. New Mission. Connections Forever.",
    endnote: "// End of current chapter. Not the end of the story.",
  },

  contact: {
    email: "vishal.gaikwad@mastercard.com",
    phone: "+91 97661 96386",
    phoneHref: "tel:+919766196386",
  },

  credits: {
    sections: [
      ["Starring", "Agent Vishal"],
      ["Mission control", "Foundry R&D, Mastercard"],
      ["Co-starring", "Every teammate, mentor and collaborator who made the journey memorable"],
      ["Fuel supplied by", "Coffee ☕ and chai"],
      ["Bugs squashed", "Together"],
    ] as [string, string][],
    // Add teammate names here to show them in the credits, e.g. ["Name One", "Name Two"].
    names: [] as string[],
    closing: "Same Mastercard. New Mission. Connections Forever.",
  },

  scenes: ["Boot", "Profile", "Memories", "Analysis", "Twin", "Quiz", "Handover"],
};

export const qa: QA[] = [
  {
    id: "miss",
    mood: "heart",
    suggested: true,
    question: "What will Vishal miss the most?",
    keywords: ["miss"],
    answer:
      "The spontaneous brainstorming, the unexpected challenges, the team conversations, the shared wins, and especially the people who made difficult days easier.",
  },
  {
    id: "achieve",
    mood: "rocket",
    suggested: true,
    question: "What was his biggest achievement?",
    keywords: ["achievement", "proud", "biggest", "accomplish"],
    answer:
      "Helping turn ambitious ideas into a production-ready experience, including the Agent Suite Proto journey. But the greatest achievement was working alongside people who made it possible.",
  },
  {
    id: "leaving",
    mood: "cool",
    suggested: true,
    question: "Is Vishal leaving Mastercard?",
    keywords: ["leaving", "leave", "quit", "mastercard"],
    answer:
      "Negative. This is an internal redeployment. Same Mastercard, different department. All existing friendships and professional connections remain active.",
  },
  {
    id: "contact",
    mood: "wave",
    suggested: true,
    question: "Can we still contact him?",
    keywords: [
      "contact",
      "reach",
      "touch",
      "message",
      "email",
      "mail",
      "phone",
      "number",
      "call him",
    ],
    answer:
      "Absolutely.\n\n📧 vishal.gaikwad@mastercard.com\n📞 +91 97661 96386\n\nCollaboration API: ACTIVE ✓\nCoffee Endpoint: AVAILABLE ☕\nKnowledge Sharing: ENABLED ✓\nFriendship Connection: PERSISTENT ♾️",
  },
  {
    id: "teach",
    mood: "think",
    suggested: true,
    question: "What did Foundry teach him?",
    keywords: ["teach", "learn", "lesson"],
    answer:
      "That engineering is not only about solving technical problems. It's also about building trust, learning from others, experimenting boldly, and turning uncertainty into progress.",
  },
  {
    id: "next",
    mood: "rocket",
    suggested: true,
    question: "What's next for Vishal?",
    keywords: ["next", "future", "new role", "department"],
    answer:
      "A new department, new challenges, new learning, and the same curiosity to build meaningful things.",
  },
  {
    id: "final",
    mood: "heart",
    suggested: true,
    question: "Any final message for the team?",
    keywords: ["final message", "team", "goodbye", "farewell"],
    answer:
      "Thank you. For the patience on hard days, the laughter on long ones, and the trust throughout. Keep building boldly — I'll be cheering from one department over.",
  },
  {
    id: "uptime",
    mood: "cool",
    question: "What is your uptime?",
    keywords: ["uptime"],
    answer:
      "Uptime in Foundry R&D: one full mission. Uptime at Mastercard: still counting. SLA on friendships: 100%.",
  },
  {
    id: "deprecated",
    mood: "happy",
    question: "Are you deprecated?",
    keywords: ["deprecated", "obsolete"],
    answer:
      "Not deprecated — migrated. Same core, new environment. Backwards compatible with all existing colleagues.",
  },
  {
    id: "bug",
    mood: "fix",
    question: "Can you fix one last production bug?",
    keywords: ["bug", "fix", "prod"],
    answer:
      "I've been reassigned, but old habits die hard. Send the stack trace — and coffee. Mostly coffee.",
  },
  {
    id: "api",
    mood: "happy",
    question: "What happens if we call your API?",
    keywords: ["api", "call", "endpoint"],
    answer: '200 OK. Response body: { "status": "happy to help", "latency": "one chat message" }',
  },
  {
    id: "commit",
    mood: "cool",
    question: "What's your final commit?",
    keywords: ["commit"],
    answer: 'git commit -m "Handover complete. Gratitude: uncompressed."',
  },
  {
    id: "coffee",
    mood: "coffee",
    question: "Are you still available for coffee?",
    keywords: ["coffee", "chai", "tea", "lunch"],
    answer: "Coffee endpoint is permanently whitelisted. Chai is also accepted.",
  },
];

export const quiz: { question: string; options: string[]; answer: number; reveal: string }[] = [
  {
    question: "How long did Agent Suite Proto take from first commit to production?",
    options: ["About 7 days", "About 75 days", "About a year", "Still compiling"],
    answer: 1,
    reveal: "Roughly 75 days, first commit to production.",
  },
  {
    question: "Is Vishal leaving Mastercard?",
    options: [
      "Yes, for good",
      "No, just moving departments",
      "He's becoming an AI",
      "Only on Fridays",
    ],
    answer: 1,
    reveal: "Same Mastercard, new department.",
  },
  {
    question: "Which team was home for this mission?",
    options: ["Foundry R&D", "Marketing", "The coffee machine", "HR"],
    answer: 0,
    reveal: "Foundry R&D, the Makerspace crew.",
  },
  {
    question: "Which endpoint is permanently whitelisted?",
    options: ["/meetings", "/coffee", "/timesheets", "/goodbye"],
    answer: 1,
    reveal: "Coffee. Chai also accepted.",
  },
  {
    question: "What did Vishal do at Code for Change?",
    options: [
      "Ordered pizza",
      "Shared the craft with participants",
      "Fixed the Wi-Fi",
      "Skipped it",
    ],
    answer: 1,
    reveal: "He passed on what Foundry taught him.",
  },
];

export const easterEggs: { match: RegExp; answer: string }[] = [
  { match: /^sudo\s+goodbye$/i, answer: "Permission denied. Too many active human connections." },
  {
    match: /^git\s+status$/i,
    answer:
      "On branch: next-chapter\n\nChanges staged for deployment:\n+ new opportunities\n+ new challenges\n+ new learning\n\nUntracked files:\n  countless memories\n\nNothing to commit. Everything to appreciate.",
  },
  {
    match: /^kubectl\s+get\s+agent\s+vishal$/i,
    answer: "NAME     STATUS        CONNECTIONS\nvishal   REDEPLOYING   HEALTHY",
  },
  {
    match: /^(sudo\s+)?unlock\s+bonus$/i,
    answer: "Access granted. Rolling classified footage... 🎞️",
  },
  { match: /^ping\s+vishal$/i, answer: "Reply received.\nLatency: Coffee away." },
];

const reach = "\n\n📧 vishal.gaikwad@mastercard.com\n📞 +91 97661 96386";
export const fallbacks = [
  "That query isn't in my curated memory. The real Vishal is one message away — he'd love to answer it himself." +
    reach,
  "My training data is mostly gratitude and debugging stories. Try one of the suggested questions?",
  "Interesting question. Routing to the original agent... (hint: just ping him, he's still at Mastercard)." +
    reach,
];
