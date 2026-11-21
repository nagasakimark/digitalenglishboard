import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Trophy, RefreshCw, ArrowRight } from 'lucide-react';
import TextWithTranslation from '../TextWithTranslation';
import { awardSticker } from '../../utils/stickers';

const QuizCard = ({ item, isEditing }) => {
  const { title, questions = [] } = item.content;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleOptionClick = (index) => {
    if (isAnswered) return;
    
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
      awardSticker(item);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowResults(false);
  };

  // Fixed dimensions for the card to prevent layout shifts
  const cardStyle = {
    width: item.width ? `${item.width}px` : '260px',
    height: item.height ? `${item.height}px` : '320px'
  };

  if (!questions || questions.length === 0) {
    return (
      <div 
        className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center justify-center"
        style={cardStyle}
      >
        <p className="text-gray-500 font-medium text-sm">No questions added yet.</p>
        <p className="text-xs text-gray-400 mt-2">Edit this card to add questions.</p>
      </div>
    );
  }

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div 
        className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col"
        style={cardStyle}
      >
        <div className="bg-purple-600 p-4 text-white text-center">
          <h3 className="font-bold text-xl">{title || 'Quiz Results'}</h3>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="mb-6"
          >
            <Trophy size={64} className="text-yellow-500" />
          </motion.div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{score} / {questions.length}</h2>
          <p className="text-gray-500 mb-6">{percentage}% Correct</p>
          
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors font-medium"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col"
      style={cardStyle}
    >
      {/* Header */}
      <div className="bg-purple-600 px-3 py-2 text-white flex justify-between items-center h-[48px]">
        <h3 className="font-bold text-base truncate flex-1">{title || 'Quiz'}</h3>
        <span className="text-xs bg-purple-700 px-2 py-0.5 rounded-md">
          {currentQuestionIndex + 1}/{questions.length}
        </span>
      </div>

      {/* Question Area */}
      <div className="flex-1 p-3 flex flex-col overflow-y-auto custom-scrollbar">
        <h4 className="text-base font-medium text-gray-800 mb-2 leading-tight">
          <TextWithTranslation text={currentQuestion.question} />
        </h4>

        <div className="space-y-2">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedOption === index;
            const isCorrect = index === currentQuestion.correctAnswer;
            
            let buttonClass = "w-full p-2 rounded-lg border text-left transition-all relative text-sm ";
            
            if (isAnswered) {
              if (isCorrect) {
                buttonClass += "border-green-500 bg-green-50 text-green-700";
              } else if (isSelected) {
                buttonClass += "border-red-500 bg-red-50 text-red-700";
              } else {
                buttonClass += "border-gray-200 text-gray-400 opacity-60";
              }
            } else {
              buttonClass += "border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-gray-700";
            }

            return (
              <motion.button
                key={index}
                whileTap={!isAnswered ? { scale: 0.98 } : {}}
                onClick={() => handleOptionClick(index)}
                disabled={isAnswered}
                className={buttonClass}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium leading-tight"><TextWithTranslation text={option} /></span>
                  {isAnswered && isCorrect && <CheckCircle size={14} className="text-green-500 flex-shrink-0 ml-2" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle size={14} className="text-red-500 flex-shrink-0 ml-2" />}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 48, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-3 border-t border-gray-100 bg-gray-50 flex justify-end items-center overflow-hidden"
          >
            <button
              onClick={handleNextQuestion}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-xs"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next' : 'Finish'}
              <ArrowRight size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizCard;
