import { Interviewer } from "./types/type";

export const technicalInterviewTopics = {
  programming: [
    "Data Structures",
    "Algorithms",
    "Problem Solving",
    "Object-Oriented Programming",
    "Functional Programming"
  ],
  languages: [
    "JavaScript",
    "Python",
    "Java",
    "C++",
    "TypeScript"
  ],
  webDevelopment: [
    "HTML",
    "CSS",
    "Frontend Development",
    "Backend Development",
    "Web Security"
  ],
  databases: [
    "SQL",
    "NoSQL",
    "Database Design",
    "Indexing",
    "Transactions"
  ],
  devops: [
    "Git",
    "Docker",
    "CI/CD",
    "Linux",
    "Cloud Services"
  ],
  computerScience: [
    "Operating Systems",
    "Computer Networks",
    "System Design",
    "Concurrency",
    "Memory Management"
  ],
  testingAndDebugging: [
    "Unit Testing",
    "Integration Testing",
    "Debugging Techniques",
    "Performance Optimization"
  ]
};

export const interviewers : Interviewer[] = [
  {
    name: "Alex Doe",
    avatar: "/person1.jpg",
    desc: "A no-nonsense tech lead with years of experience grilling candidates at top startups.",
    style: "Tough",
    tone: "casual",
    temperature: 0.7,
    id: 1
  },
  {
    name: "Priya Khanna",
    avatar: "/person2.jpg",
    desc: "A warm and empathetic interviewer who loves guiding freshers through technical challenges.",
    style: "Supportive",
    tone: "mentor-like",
    temperature: 0.6,
    id : 2
  },
  {
    name: "Jason Trent",
    avatar: "/person3.jpg",
    desc: "Fast-paced and sharp, known for throwing rapid algorithm questions one after the other.",
    style: "Rapid-fire",
    tone: "neutral",
    temperature: 0.8,
    id : 3
  },
  {
    name: "Mei Lin",
    avatar: "/person4.jpg",
    desc: "Pushes candidates with deep conceptual problems to see how far they can go.",
    style: "Challenging",
    tone: "formal",
    temperature: 0.75,
    id : 4
  },
  {
    name: "Rahul Verma",
    avatar: "/person1.jpg",
    desc: "Acts like a mentor, offering hints but expects candidates to explain their reasoning deeply.",
    style: "Mentor",
    tone: "mentor-like",
    temperature: 0.65,id : 5
  }
];
