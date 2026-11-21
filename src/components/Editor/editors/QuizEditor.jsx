import React from 'react';
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';

const QuizEditor = ({ item, localState, setLocalState, onUpdate }) => {
  const handleChange = (field, value) => {
    const newState = {
      ...localState,
      [field]: value
    };
    setLocalState(newState);

    onUpdate(item.id, {
      content: {
        ...item.content,
        title: newState.title,
        questions: newState.questions
      }
    });
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...(localState.questions || [])];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value
    };
    handleChange('questions', newQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...(localState.questions || [])];
    const newOptions = [...newQuestions[qIndex].options];
    newOptions[oIndex] = value;
    newQuestions[qIndex] = {
      ...newQuestions[qIndex],
      options: newOptions
    };
    handleChange('questions', newQuestions);
  };

  const setCorrectAnswer = (qIndex, oIndex) => {
    handleQuestionChange(qIndex, 'correctAnswer', oIndex);
  };

  const addQuestion = () => {
    const newQuestions = [
      ...(localState.questions || []),
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      }
    ];
    handleChange('questions', newQuestions);
  };

  const removeQuestion = (index) => {
    const newQuestions = [...(localState.questions || [])];
    newQuestions.splice(index, 1);
    handleChange('questions', newQuestions);
  };

  const questions = localState.questions || [];

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quiz Title
        </label>
        <input
          type="text"
          value={localState.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Enter quiz title..."
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-700">
            Questions ({questions.length})
          </label>
          <button
            onClick={addQuestion}
            className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            <Plus size={16} />
            Add Question
          </button>
        </div>

        <div className="space-y-6">
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
              <button
                onClick={() => removeQuestion(qIndex)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                title="Remove question"
              >
                <Trash2 size={16} />
              </button>

              <div className="mb-4 pr-8">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Question {qIndex + 1}
                </label>
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                  className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your question..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">
                  Options (Select correct answer)
                </label>
                {q.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-2">
                    <button
                      onClick={() => setCorrectAnswer(qIndex, oIndex)}
                      className={`flex-shrink-0 ${
                        q.correctAnswer === oIndex ? 'text-green-500' : 'text-gray-300 hover:text-gray-400'
                      }`}
                      title={q.correctAnswer === oIndex ? 'Correct answer' : 'Mark as correct'}
                    >
                      {q.correctAnswer === oIndex ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <Circle size={20} />
                      )}
                    </button>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                      className={`flex-1 p-2 border rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        q.correctAnswer === oIndex ? 'border-green-200 bg-green-50' : ''
                      }`}
                      placeholder={`Option ${oIndex + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {questions.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
            No questions yet. Click "Add Question" to start.
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizEditor;
