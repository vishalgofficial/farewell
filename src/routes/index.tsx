import { createFileRoute } from "@tanstack/react-router";
import { ExperienceController } from "@/components/experience/ExperienceController";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Agent Vishal — The Final Handover" },
      {
        name: "description",
        content:
          "An interactive AI mission-handover farewell from Vishal to Foundry R&D. One mission ends. Another begins.",
      },
      { property: "og:title", content: "Agent Vishal — The Final Handover" },
      {
        property: "og:description",
        content: "One mission ends. Another begins. An interactive farewell from Foundry R&D.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExperienceController,
});
