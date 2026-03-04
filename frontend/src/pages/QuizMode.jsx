import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Trophy, Star, ChevronRight, Check, X } from 'lucide-react';
import { MOCK_QUIZ } from '../data/mockData';

const QuizMode = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [timeLeft, setTimeLeft] = useState(15);
    const [isAnswered, setIsAnswered] = useState(false);

    const question = MOCK_QUIZ.questions[currentQuestion];

    useEffect(() => {
        if (timeLeft > 0 && !isAnswered) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft, isAnswered]);

    const handleAnswerSelect = (index) => {
        if (isAnswered) return;
        setSelectedAnswer(index);
        setIsAnswered(true);
    };

    return (
        <div className="grid grid-cols-12 gap-8 h-full bg-background text-text-main">
            {/* Quiz Area */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
                <div className="glass-panel p-8 rounded-[40px] relative overflow-hidden bg-surface/50 border border-border">
                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 h-1 bg-primary/20 w-full">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentQuestion + 1) / MOCK_QUIZ.questions.length) * 100}%` }}
                            className="h-full bg-primary"
                        />
                    </div>

                    <div className="flex items-center justify-between mb-12">
                        <span className="bg-text/5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-text-main-muted">
                            Question {currentQuestion + 1} of {MOCK_QUIZ.questions.length}
                        </span>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-[10px] uppercase font-bold text-text-main-muted">Bonus Multiplier</p>
                                <p className="text-lg font-bold text-secondary">2.5x</p>
                            </div>
                            <div className="w-16 h-16 relative">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-text-main-muted/10" />
                                    <motion.circle
                                        cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4"
                                        className="text-primary"
                                        strokeDasharray="175.9"
                                        animate={{ strokeDashoffset: 175.9 - (175.9 * (timeLeft / 15)) }}
                                    />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center font-bold text-lg">
                                    {timeLeft}
                                </span>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold mb-12 leading-tight">
                        {question.question}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {question.options.map((option, i) => (
                            <button
                                key={i}
                                onClick={() => handleAnswerSelect(i)}
                                disabled={isAnswered}
                                className={cn(
                                    "p-6 rounded-[24px] border transition-all text-left relative group overflow-hidden",
                                    selectedAnswer === i
                                        ? (i === question.correct ? "bg-green-500/10 border-green-500 text-green-500" : "bg-red-500/10 border-red-500 text-red-500")
                                        : isAnswered && i === question.correct
                                            ? "bg-green-500/10 border-green-500 text-green-500"
                                            : "bg-surface/50 border-border hover:border-primary/20 hover:bg-surface/80"
                                )}
                            >
                                <div className="flex items-center justify-between relative z-10">
                                    <span className="font-bold">{option}</span>
                                    {isAnswered && i === question.correct && <Check size={20} />}
                                    {isAnswered && selectedAnswer === i && i !== question.correct && <X size={20} />}
                                </div>

                                {/* Visual Feedback Glow */}
                                {selectedAnswer === i && (
                                    <motion.div
                                        layoutId="glow"
                                        className={cn(
                                            "absolute inset-0 opacity-20 blur-xl",
                                            i === question.correct ? "bg-green-500" : "bg-red-500"
                                        )}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between glass-panel p-6 rounded-3xl bg-surface/50 border border-border">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 bg-text/5 px-4 py-2 rounded-xl border border-border">
                            <Star className="text-yellow-500" size={16} />
                            <span className="text-sm font-bold">Points: 0</span>
                        </div>
                        <div className="flex items-center gap-2 bg-text/5 px-4 py-2 rounded-xl border border-border">
                            <Trophy className="text-primary" size={16} />
                            <span className="text-sm font-bold">Rank: #--</span>
                        </div>
                    </div>
                    <button
                        disabled={!isAnswered}
                        className="bg-primary text-black px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        Next Question
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Leaderboard Panel */}
            <div className="col-span-12 lg:col-span-4 glass-panel rounded-[40px] p-8 flex flex-col bg-surface/50 border border-border">
                <div className="flex items-center gap-3 mb-8">
                    <Trophy className="text-secondary" size={24} />
                    <h3 className="text-xl font-bold uppercase tracking-tight">Live Standings</h3>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                    {MOCK_QUIZ.leaderboard.map((player, i) => (
                        <div key={player.name} className="flex items-center gap-4 p-4 rounded-2xl bg-surface/50 border border-border relative group">
                            <div className="w-8 font-bold text-text-main-muted/20 italic text-xl">
                                {i + 1}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold flex items-center gap-2">
                                    {player.name}
                                    {player.streak && (
                                        <span className="bg-secondary/20 text-secondary text-[8px] px-2 py-0.5 rounded-full border border-secondary/30 uppercase">
                                            On Fire
                                        </span>
                                    )}
                                </p>
                                <p className="text-[10px] text-text-main-muted/60 tracking-wider font-bold">{player.score} PTS</p>
                            </div>
                            {i === 0 && <Star fill="currentColor" className="text-yellow-500" size={16} />}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

function cn(...inputs) {
    return inputs.filter(Boolean).join(' ');
}

export default QuizMode;
