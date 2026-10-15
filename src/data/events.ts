export interface EventContact {
  whatsapp?: string
  phone?: string
  formLink?: string
  website?: string
}

export interface EventItem {
  id: string
  number: string
  tag: string
  title: string
  date: string
  audience?: string
  location?: string
  duration?: string
  summary: string
  description: string
  highlights?: string[]
  coverImage: string
  gallery: string[]
  contact?: EventContact
}

export const events: EventItem[] = [
  {
    id: "python-webinar",
    number: "01",
    tag: "Webinar",
    title: "Python Language Webinar",
    date: "November 2, 2025",
    audience: "College Students",
    location: "Online",
    duration: "Live session",
    summary: "Free registration webinar on Python, with an e-certificate for every participant.",
    description: "A hands-on introduction to Python for college students, covering the language fundamentals and practical, project-oriented examples. Registration is completely free, and every attendee receives an e-certificate on completion.",
    highlights: ["Registration Free", "E-Certificate Provided", "Only for College Students"],
    coverImage: "https://res.cloudinary.com/qtoywhbg/image/upload/f_auto,q_auto,w_800/v1786795834/python_tkz7y2.png",
    gallery: ["https://res.cloudinary.com/qtoywhbg/image/upload/f_auto,q_auto,w_800/v1786795834/python_tkz7y2.png"],
    contact: { whatsapp: "+91 89399 76607" }
  },
  {
    id: "services-spotlight",
    number: "02",
    tag: "Open House",
    title: "Fill Your Knowledge, Fill Your Future",
    date: "Ongoing",
    audience: "All Students",
    location: "Near Sona College, Salem",
    summary: "A look at our core programs - AI and Robotics, IoT, App Development and All-Dept college projects.",
    description: "U Fill Academy's flagship services span AI and Robotics, Internet of Things, App Development and Animations, and full-scope college project support across Mechanical, EEE, ECE, IT, AI and Robotics, and Agriculture departments. Drop by or reach out for a free consultation.",
    highlights: [
      "AI and Robotics",
      "IoT - Internet of Things",
      "App Development and Animations",
      "All Dept College Projects (MECH, EEE, ECE, IT, AI and Robotics, Agri)"
    ],
    coverImage: "https://res.cloudinary.com/qtoywhbg/image/upload/f_auto,q_auto,w_800/v1786795833/project_elqm6u.png",
    gallery: ["https://res.cloudinary.com/qtoywhbg/image/upload/f_auto,q_auto,w_800/v1786795833/project_elqm6u.png"],
    contact: { phone: "+91 89399 76607", website: "https://www.ufillacamedy.in" }
  },
  {
    id: "app-dev-course",
    number: "03",
    tag: "Free Course",
    title: "App Development Free Course",
    date: "October 2, 2025",
    audience: "School Students",
    duration: "2 Hours Live Webinar",
    summary: "A 2-hour live webinar covering UI/UX, coding basics, and live project planning - free e-certificate included.",
    description: "A live, beginner-friendly webinar for school students covering UI and UX design, core coding concepts, and live practicals around real project plans. Every participant gets a free e-certificate on completion.",
    highlights: ["UI and UX Designs", "Coding Vibes", "Project Plans - Live Practicals", "Free E-Certificate"],
    coverImage: "https://res.cloudinary.com/qtoywhbg/image/upload/f_auto,q_auto,w_800/v1786795833/appdev_wyoulp.png",
    gallery: ["https://res.cloudinary.com/qtoywhbg/image/upload/f_auto,q_auto,w_800/v1786795833/appdev_wyoulp.png"],
    contact: {
      whatsapp: "+91 89399 76607",
      formLink: "https://forms.gle/LU3C35tNHfn8QzaL7"
    }
  },
  {
    id: "tamil-contest",
    number: "04",
    tag: "Competition",
    title: "Tamil Talent Contest",
    date: "September 21, 2025",
    audience: "Ages 10-30",
    duration: "3 Minutes per participant",
    location: "G-Meet (Online)",
    summary: "A free Tamil speech contest for ages 10-30, held online - trophies and medals for the winners.",
    description: "A talent contest built around the Tamil language, open to participants aged 10 to 30. Topics are shared in advance via the registration form, each performance runs 3 minutes, and the event is hosted entirely online over G-Meet. Every participant receives an e-certificate, and winners take home trophies and medals.",
    highlights: [
      "Topics given in Google Form",
      "Age Criteria: 10 to 30 Years",
      "Duration: 3 Minutes",
      "Mode: G-Meet (Online)",
      "E-Certificate for all participants",
      "Trophies and Medals for winners",
      "Last date to register: September 15, 2025"
    ],
    coverImage: "https://res.cloudinary.com/qtoywhbg/image/upload/v1786795834/tamilcontents_np3fzs.png",
    gallery: ["https://res.cloudinary.com/qtoywhbg/image/upload/v1786795834/tamilcontents_np3fzs.png"],
    contact: { whatsapp: "+91 89399 76607", website: "https://www.ufillacademy.in" }
  }
]