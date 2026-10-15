import vishal from "@/assets/photos/vishal-makerspace.jpg";
import makerspace from "@/assets/photos/makerspace-team.jpg";
import hackathon from "@/assets/photos/hackathon.jpg";
import codedrive from "@/assets/photos/codedrive-team.jpg";
import codeForChange from "@/assets/photos/code-for-change.jpg";
import trio from "@/assets/photos/codedrive-trio.jpg";
import della from "@/assets/photos/della-offsite.jpg";
import cfcHack from "@/assets/photos/code-for-change-hackathon.jpg";
import outing from "@/assets/photos/parsi-dhaba-outing.jpg";
import dinner from "@/assets/photos/team-dinner.jpg";

export type Photo = { src: string; alt: string; caption: string };

export const photos = {
  vishal: {
    src: vishal,
    alt: "Vishal at the Foundry R&D Makerspace",
    caption: "Agent on site · Makerspace",
  },
  makerspace: {
    src: makerspace,
    alt: "Foundry R&D team at the Makerspace sign",
    caption: "The Makerspace crew",
  },
  hackathon: {
    src: hackathon,
    alt: "Team selfie during a hackathon",
    caption: "Hackathon mode: on",
  },
  codedrive: {
    src: codedrive,
    alt: "Team in codedrive 008 t-shirts in front of the Mastercard wall",
    caption: "codedrive 008",
  },
  codeForChange: {
    src: codeForChange,
    alt: "Vishal with the Code for Change participants",
    caption: "Code for Change",
  },
  trio: {
    src: trio,
    alt: "Vishal with two teammates in codedrive 008 t-shirts at the Mastercard wall",
    caption: "Partners in code",
  },
  dinner: {
    src: dinner,
    alt: "Team dinner around a wooden table",
    caption: "After hours, same team",
  },
  della: {
    src: della,
    alt: "The whole team at the Della Resorts offsite",
    caption: "Offsite at Della",
  },
  cfcHack: {
    src: cfcHack,
    alt: "Code for Change hackathon group photo on stage",
    caption: "Code for Change Hackathon",
  },
  outing: {
    src: outing,
    alt: "Team outing at Parsi Dhaba under blue skies",
    caption: "Team day out",
  },
} satisfies Record<string, Photo>;

export const memoryWall: Photo[] = [
  photos.makerspace,
  photos.hackathon,
  photos.codedrive,
  photos.trio,
  photos.codeForChange,
  photos.cfcHack,
  photos.della,
  photos.outing,
  photos.dinner,
  photos.vishal,
];
