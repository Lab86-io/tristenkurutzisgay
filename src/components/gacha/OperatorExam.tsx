import { useState } from "react";
import { useGachaSession, useSubmitExam } from "#/hooks/useGacha";
import { sfx } from "#/lib/sfx";
import { pushToast } from "#/lib/toasts";

interface Question {
	prompt: string;
	options: string[];
}

const QUESTIONS: Question[] = [
	{
		prompt: "Where does Tristen study?",
		options: [
			"MIT",
			"Rensselaer Polytechnic Institute",
			"Rochester Institute of Technology",
			"University at Buffalo",
		],
	},
	{
		prompt: "What did he build solo at M&T Bank?",
		options: [
			"A Java test orchestration platform",
			"A TikTok clone",
			"A payroll system",
			"A Pokémon battle simulator",
		],
	},
	{
		prompt: "How many cats does he have?",
		options: ["One", "Zero, cats are a construct", "Five", "Two"],
	},
];

export function OperatorExam() {
	const { status, state } = useGachaSession();
	const submitExam = useSubmitExam();
	const [questionIndex, setQuestionIndex] = useState(0);
	const [answers, setAnswers] = useState<number[]>([]);
	const [submitting, setSubmitting] = useState(false);
	const [failed, setFailed] = useState(false);

	const alreadyPassed = Boolean(state.achievements["operator-exam"]);
	const examUnlocked = status === "ready";

	const answer = async (optionIndex: number) => {
		if (submitting) return;
		const next = [...answers, optionIndex];
		if (next.length < QUESTIONS.length) {
			setAnswers(next);
			setQuestionIndex((index) => index + 1);
			return;
		}
		setSubmitting(true);
		const result = await submitExam(next);
		setSubmitting(false);
		if (result.passed) {
			pushToast("EXAM PASSED", "Certified operator status granted.", "gold");
			for (const achievement of result.unlocked) {
				pushToast(
					`TROPHY — ${achievement.name}`,
					`${achievement.description} +${achievement.reward}◈`,
					"gold",
				);
			}
			if (result.unlocked.length) sfx.unlock();
			setAnswers([]);
			setQuestionIndex(0);
			setFailed(false);
		} else {
			setFailed(true);
			setAnswers([]);
			setQuestionIndex(0);
			sfx.deny();
		}
	};

	if (!examUnlocked) return null;

	return (
		<section className="panel exam-panel">
			<h2 className="panel-title">OPERATOR EXAM</h2>
			{alreadyPassed ? (
				<p className="transmit-sub">
					Passed — certified operator. Retakes available for the confident and
					the bored.
				</p>
			) : (
				<p className="transmit-sub">
					Three questions about the person behind the cards. Pass and the
					registrar pays out +100◈.
				</p>
			)}
			{failed && (
				<p className="exam-failed">Wrong answer. The ledger rejects vibes.</p>
			)}
			{!alreadyPassed && (
				<div className="exam-question">
					<span className="exam-counter">
						{questionIndex + 1}/{QUESTIONS.length}
					</span>
					<p className="exam-prompt">{QUESTIONS[questionIndex].prompt}</p>
					<div className="exam-options">
						{QUESTIONS[questionIndex].options.map((option, optionIndex) => (
							<button
								key={option}
								type="button"
								className="exam-option"
								disabled={submitting}
								onClick={() => answer(optionIndex)}
							>
								{option}
							</button>
						))}
					</div>
				</div>
			)}
		</section>
	);
}
