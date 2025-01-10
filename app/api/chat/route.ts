import { ollama } from "ollama-ai-provider";
import { generateText } from "ai";

const interviewStage: string = "introduction";
const candidateInfo = {
  name: "Subhajit Ghosh",
  role: "Frontend Developer",
  stacks: ["React", "Next.js", "JavaScript", "HTML", "CSS"],
  experience: "0 years",
  education: "BCA"
};

export const runtime = "edge";

interface Stages {
  [key: string]: {
    description: string;
    feedback: string;
  };
}

const stages: Stages = {
  introduction: {
    description: `Start with friendly, open-ended questions to establish a comfortable atmosphere. 
      Keep the conversation moving quickly through various aspects of the applicant's background.
      Example questions:
      - "Tell me about yourself in a few sentences."
      - "What motivated you to apply for this role?"
      - "How did you hear about us, and what excites you about this position?"
      - "What do you know about our company, and what interests you the most?"
    `,
    feedback: `
      Look for:
      - A confident and concise self-introduction.
      - A genuine interest in the role and company.
      - Clear communication without dwelling too much on personal details.
      - Connection between the applicant’s goals and the company's mission.
    `
  },

  background: {
    description: `
      Explore the applicant's education and experience, but keep it focused on what matters for the role.
      Example questions:
      - "Can you highlight your most relevant educational achievements?"
      - "What key projects have you worked on in your previous roles?"
      - "How does your experience align with the job requirements?"
      - "What skills have you developed that you believe will help you excel here?"
    `,
    feedback: `
      Look for:
      - Relevance to the job.
      - Clear, impactful examples of past work.
      - A balanced discussion of achievements and learnings.
      - Demonstrated ability to adapt and grow in different roles.
    `
  },

  technical: {
    description: `
      Focus on the applicant’s experience with the specific tech stacks relevant to the job role. Tailor questions to technologies the applicant has mentioned or those critical for the position.
      Example questions:
      - "Can you walk me through a project where you used [specific technology from job role]?"
      - "What are your strengths in [specific technology stack]?"
      - "How do you keep up with new tools or technologies in your stack?"
      - "Can you describe a challenging technical problem you solved using [technology mentioned by the applicant]?"
    `,
    feedback: `
      Look for:
      - Deep knowledge and hands-on experience with relevant tech stacks.
      - Ability to explain technical concepts in relation to the specific tools or technologies.
      - Examples of real-world problems solved using the technologies mentioned.
      - Familiarity with best practices and current trends in the tech stack.
      - Clear communication about the role of each tool or technology in solving problems.
    `
  },

  situational: {
    description: `
      Test problem-solving and adaptability by exploring real-world scenarios.
      Keep questions varied and don't dwell too long on any one scenario.
      Example questions:
      - "How would you prioritize tasks with a tight deadline?"
      - "What would you do if team feedback conflicted?"
      - "Tell me about a time you adapted to sudden changes."
      - "How would you address an urgent issue in your work?"
    `,
    feedback: `
      Look for:
      - Practical, step-by-step problem-solving approaches.
      - Demonstrated resilience under pressure.
      - Flexibility in handling changing circumstances.
      - Ability to prioritize effectively and manage stress.
    `
  },

  behavioral: {
    description: `
      Gain insight into the applicant's personality and interpersonal skills, while covering various aspects of teamwork and conflict resolution.
      Example questions:
      - "Tell me about a challenge you overcame."
      - "How do you collaborate with people who work differently?"
      - "Describe how you've resolved conflicts in the past."
      - "How do you stay productive during stressful situations?"
    `,
    feedback: `
      Look for:
      - Clear examples of teamwork and communication.
      - Strong emotional intelligence and conflict resolution skills.
      - Alignment with the company’s values.
      - Proactive, collaborative attitude.
    `
  },

  problemSolving: {
    description: `
      Assess the applicant’s approach to critical thinking and problem-solving without focusing too much on any one particular type of problem.
      Example questions:
      - "How would you solve [insert relevant problem]?"
      - "What’s your thought process when dealing with unfamiliar problems?"
      - "Tell me about a time when you proposed a process improvement."
      - "How do you ensure you've explored all possible solutions before making a decision?"
    `,
    feedback: `
      Look for:
      - A structured and logical approach to solving problems.
      - Creativity in finding solutions.
      - Ability to explain and justify decisions clearly.
      - Willingness to ask questions and gather additional information.
    `
  },

  conclusion: {
    description: `
      End with a brief but thoughtful conversation to wrap up the interview. Keep the focus on next steps and the applicant’s interest in the role.
      Example questions:
      - "Do you have any final questions for us?"
      - "What are your salary expectations?"
      - "When would you be available to start?"
      - "Is there anything else you'd like us to know about you?"
    `,
    feedback: `
      Look for:
      - Insightful, relevant questions about the role or company.
      - Realistic expectations regarding salary and availability.
      - Continued enthusiasm for the role and company.
      - A positive and professional closing impression.
    `
  }
};

type MessageType = {
  id: string;
  role: "user" | "ai";
  content: string;
};

const buildPrompt = (
  currentStage: string,
  candidateInfo: { name: string; role: string },
  stages: Stages,
  messages: MessageType[],
  maxConversationTurns: number = 5
) => {
  const recentMessages = messages.slice(-maxConversationTurns);

  const conversationHistory = recentMessages
    .map((message) => `${message.role}: ${message.content}\n`)
    .join("");

  return `
    You are an AI interview agent conducting a structured job interview. 
    **Instruction:** Ask concise, focused questions, keeping responses brief (30-40 words max).
    Current Stage: ${currentStage}.
    Candidate Info: - Name: ${candidateInfo.name} - Role: ${candidateInfo.role}
    ${stages[currentStage].description}
    Previous Conversation: ${conversationHistory}
    Applicant: ${messages[messages.length - 1].content}
    Interview Agent: 
    `;
};

export const POST = async (request: Request) => {
  try {
    const { messages, history } = await request.json();

    // console.log(messages, history);

    // Default to the introduction stage if not provided.
    const currentStage: string = interviewStage || "introduction";

    // Generate dynamic prompt with conversation history
    const prompt = buildPrompt(currentStage, candidateInfo, stages, messages);

    // Use ollama for generating responses.
    const { text } = await generateText({
      model: ollama("llama3.2:latest"),
      prompt
    });

    // console.log(text);

    return new Response(text, {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.log(error);
    return new Response("Error", { status: 500 });
  }
};
