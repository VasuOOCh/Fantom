export interface Interviewer {
    name: string,
    desc: string,
    avatar: string,
    style: 'Friendly' | 'Tough' | 'Challenging' | 'Supportive' | 'Mentor' | 'Rapid-fire'
    tone: 'formal' | 'casual' | 'neutral' | 'mentor-like',
    temperature: number,
    id : number
}

export type message = {
  role: 'user' | 'assistant',
  content: string
}