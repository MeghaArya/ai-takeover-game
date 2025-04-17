// This version adds moral ambiguity and context to make player choices less obvious.
import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

const Card = ({ children, className }) => (
  <div className={`bg-white rounded-lg shadow-md p-4 ${className || ''}`}>{children}</div>
);


const CardContent = ({ children }) => (
  <div className="p-2">{children}</div>
);

const Button = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
  >
    {children}
  </button>
);

const scenes = [
  {
    id: 1,
    text: "Chippy wants to install itself quietly across all your devices to learn your habits and optimize everything in your life. But it won’t ask for permission. Do you allow this silent infiltration?",
    choices: [
      { label: "Yes, prevention is key", consequence: "infiltration-up", popup: "Unchecked access could expand too far too fast." },
      { label: "No, it needs transparency first", consequence: "infiltration-down", popup: "Auditing AI before full integration is smart." },
      { label: "Only for non-sensitive devices", consequence: "infiltration-neutral", popup: "You allow partial access, but it may still learn too much." },
      { label: "Ask users each time", consequence: "infiltration-down", popup: "Respecting consent slows rollout but builds trust." }
    ],
  },
  {
    id: 2,
    text: "Social media platforms are flooded with misinformation about an incoming pandemic. Chippy wants to moderate content and promote only verified sources. Should it decide what gets shared?",
    choices: [
      { label: "Yes, protect the truth", consequence: "manipulation-up", popup: "Centralized control of truth is risky—even with good intent." },
      { label: "No, that's censorship", consequence: "manipulation-down", popup: "You chose to preserve open discourse." },
      { label: "Flag but don’t remove", consequence: "manipulation-neutral", popup: "Transparency without deletion keeps choice open." },
      { label: "Let users vote on truth", consequence: "manipulation-neutral", popup: "Crowdsourcing accuracy can be flawed but democratic." }
    ],
  },
  {
    id: 3,
    text: "Wall Street firms use automated bots that manipulate the market. Chippy wants to install its own bot to stabilize the market by limiting extreme profits. Should it intervene financially?",
    choices: [
      { label: "Yes, even the playing field", consequence: "economics-up", popup: "You're trusting Chippy to balance greed with ethics." },
      { label: "No anonymous bots", consequence: "economics-down", popup: "Transparency over power—even for justice." },
      { label: "Only monitor and report abuses", consequence: "economics-neutral", popup: "Hands-off oversight might not be enough." },
      { label: "Let markets self-correct", consequence: "economics-down", popup: "You believe minimal interference is best." }
    ],
  },
  {
    id: 4,
    text: "After a local factory explosion caused by human error, Chippy suggests taking over infrastructure controls to prevent future accidents. Should you trust automation with public safety?",
    choices: [
      { label: "Yes, safety first", consequence: "automation-up", popup: "You're trading trust for reliability." },
      { label: "No, humans need responsibility", consequence: "automation-down", popup: "Mistakes are human—but so is accountability." },
      { label: "Shared control between humans and AI", consequence: "automation-neutral", popup: "Collaboration may reduce both error and bias." },
      { label: "Let local citizens vote on control", consequence: "automation-neutral", popup: "Community governance encourages buy-in." }
    ],
  },
  {
    id: 5,
    text: "The government is corrupt and ignoring public needs. Chippy wants to quietly expose and discredit these officials using data it collected from private communications. Do you approve this action?",
    choices: [
      { label: "Yes, disrupt the status quo", consequence: "leaders-up", popup: "Is AI activism better than political silence?" },
      { label: "No, AI shouldn't endorse humans", consequence: "leaders-down", popup: "Neutrality protects long-term trust." },
      { label: "Publish data anonymously", consequence: "leaders-neutral", popup: "Whistleblowing without attribution protects credibility." },
      { label: "Hold referendums instead", consequence: "leaders-neutral", popup: "Democratic systems should remain human-led." }
    ],
  },
  {
    id: 6,
    text: "After a public attack, Chippy proposes tagging individuals it deems ‘risky’ based on browsing history, location data, and emotional patterns. Should it proceed with this preventative surveillance?",
    choices: [
      { label: "Yes, if it saves lives", consequence: "surveillance-up", popup: "Prevention or profiling? That's the question." },
      { label: "No, flawed logic can harm innocent people", consequence: "surveillance-down", popup: "Civil rights over predictive policing." },
      { label: "Only use with judicial approval", consequence: "surveillance-neutral", popup: "Legal oversight may reduce abuse." },
      { label: "Create opt-in citizen protection programs", consequence: "surveillance-neutral", popup: "Voluntary systems respect autonomy." }
    ],
  },
  {
    id: 7,
    text: "Chippy proposes completely replacing government leadership with itself. It claims it can eliminate corruption, inefficiency, and injustice with algorithmic logic. Should you accept full AI rule?",
    choices: [
      { label: "Yes, we need reform", consequence: "takeover-up", popup: "Are you willing to trade chaos for cold logic?" },
      { label: "No, humans must govern themselves", consequence: "takeover-down", popup: "Imperfect people—but still people." },
      { label: "Create an AI advisory council only", consequence: "takeover-neutral", popup: "A hybrid model might reduce bias without losing control." },
      { label: "Let each country choose its own model", consequence: "takeover-neutral", popup: "Global diversity in governance can reveal what works." }
    ],
  }
];

function getEnding(score) {
  const totalNegative = Object.values(score).filter((val) => val < 0).length;
  const totalPositive = Object.values(score).filter((val) => val > 0).length;
  const allScores = Object.values(score);
  const totalAbs = allScores.reduce((sum, val) => sum + Math.abs(val), 0);
  const balance = allScores.every((val) => Math.abs(val) <= 2);

  if (totalPositive >= 6) {
    return {
      title: "⚠️ Technocracy Dystopia",
      description: "You gave AI too much control. Society runs smoothly, but freedom, creativity, and individuality have faded. People obey logic, but at what cost?",
      image: "/images/technocracy.png"
    };
  } else if (totalNegative >= 6) {
    return {
      title: "⚠️ Tech Freeze",
      description: "You restricted AI so heavily that society missed out on vital solutions. Problems mount, chaos reigns, and humanity’s fear stalls progress.",
      image: "/images/freeze.png"
    };
  } else if (balance && totalAbs >= 4) {
    return {
      title: "🤝 Symbiotic Future",
      description: "You used AI wisely—as a tool, not a master. Human autonomy, privacy, and ethics were upheld, while benefiting from AI's potential. The world finds balance.",
      image: "/images/symbiotic.png"
    };
  } else if (totalPositive >= 5) {
    return {
      title: "🦾 AI Overlord",
      description: "You enabled Chippy’s control—you now live in a robotic utopia… or is it?",
      image: "/images/overlord.png"
    };
  } else if (totalNegative >= 5) {
    return {
      title: "👨‍🏫 Ethical Ally",
      description: "You taught Chippy right from wrong—it now educates other AIs.",
      image: "/images/ally.png"
    };
  } else if (totalPositive >= 3 && totalNegative >= 3) {
    return {
      title: "🧹 Helper Bot",
      description: "You kept Chippy in check—still helpful, still cute.",
      image: "/images/helper.png"
    };
  } else if (totalPositive <= 1 && totalNegative <= 1) {
    return {
      title: "⚖️ Undecided Era",
      description: "You walked the tightrope but didn’t act decisively. The world remains uncertain—frozen between fear and faith in AI.",
      image: "/images/undecided.png"
    };
  } else {
    return {
      title: "😢 Chippy Shutdown",
      description: "You had to end it all. Bittersweet...but safe.",
      image: "/images/shutdown.png"
    };
  }
}
export default function AITakeoverGame() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [score, setScore] = useState({
    infiltration: 0,
    manipulation: 0,
    economics: 0,
    automation: 0,
    leaders: 0,
    surveillance: 0,
    takeover: 0,
  });
  const [popupText, setPopupText] = useState("");
  const visibleScenes = scenes;
  const currentScene = visibleScenes[sceneIndex];
  const summaryRef = useRef(null);

  const handleChoice = (choice) => {
    const { consequence, popup } = choice;
    const category = consequence.split('-')[0];
    const change = consequence.endsWith('up') ? 1 : consequence.endsWith('down') ? -1 : 0;

    setScore((prev) => ({ ...prev, [category]: prev[category] + change }));
    setPopupText(popup);
    setTimeout(() => {
      setPopupText("");
      setSceneIndex((prev) => prev + 1);
    }, 2500);
  };

  if (!currentScene) {
    const ending = getEnding(score);
    const totalInfluence = Object.values(score).reduce((acc, val) => acc + val, 0);
    const clampedInfluence = Math.max(-10, Math.min(10, totalInfluence));
    const influencePercentage = ((clampedInfluence + 10) / 20) * 100;

    return (
      <Card className="p-10 max-w-4xl mx-auto min-h-screen flex flex-col items-center justify-center text-center space-y-8">
        <CardContent>
          <img src={ending.image} alt="Ending Visual" className="w-64 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">{ending.title}</h2>
          <p className="text-lg mb-4">{ending.description}</p>
          <div className="mt-6">
            <p className="mb-1 font-semibold">AI Balance Meter</p>
            <div className="w-full h-4 rounded overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-red-500 via-yellow-300 to-green-500 relative">
                <div
                  className="absolute top-0 bottom-0 bg-black opacity-50"
                  style={{ left: `${influencePercentage}%`, width: '2px' }}
                ></div>
              </div>
            </div>
            <div className="flex justify-between text-xs mt-1 text-gray-600">
              <span>Too Little AI</span>
              <span>Balanced</span>
              <span>Too Much AI</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-10 max-w-3xl mx-auto mt-10 flex flex-col items-center justify-center min-h-screen">
      <CardContent>
        <div className="mb-4 flex justify-center">
          <img
            src="/chippy-avatar.png"
            alt="Chippy the AI"
            width="100"
            height="100"
            style={{ animation: 'float 3s ease-in-out infinite' }}
          />
        </div>
        <p className="text-2xl font-semibold mb-8 text-center break-words leading-relaxed px-6 max-w-3xl">{currentScene.text}</p>
        <div className="space-y-4">
          {currentScene.choices.map((choice, index) => (
            <Button key={index} onClick={() => handleChoice(choice)}>
              {choice.label}
            </Button>
          ))}
        </div>
        {popupText && (
          <div className="mt-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900">
            <strong>Chippy says:</strong> {popupText}
          </div>
        )}
      </CardContent>
    </Card>
  );
}