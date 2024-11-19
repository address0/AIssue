import React, { useState, useEffect } from 'react';
import { updateIssueDetails } from '@/api/project';

interface UpdatedIssue {
  summary: string;
  description: string;
  priority: string;
  story_points: number;
  issue_id: number | null;
  issue_key: string | null;
  parent_issue_id?: number | null;
}

interface EditInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  issueId: number | null;
  issueKey: string | null;
  parentIssueId?: string;
  onSave: (updatedIssue: UpdatedIssue) => void;
}

const EditInfoModal: React.FC<EditInfoModalProps> = ({
  isOpen,
  onClose,
  issueId,
  issueKey,
  parentIssueId,
  onSave,
}) => {
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium'); // Default to "Medium"
  const [storyPoints, setStoryPoints] = useState(0);
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);

  // Check if all fields are filled to enable the Save button
  useEffect(() => {
    const isFormValid =
      summary.trim() !== '' &&
      description.trim() !== '' &&
      priority.trim() !== '' &&
      storyPoints > 0;
    setIsSaveEnabled(isFormValid);
  }, [summary, description, priority, storyPoints]);

  const handleSave = () => {
    if (!isSaveEnabled) return; // Prevent saving if button is disabled

    const updatedIssue: UpdatedIssue = {
      summary,
      description,
      priority,
      story_points: storyPoints,
      issue_id: issueId,
      issue_key: issueKey,
      parent_issue_id: parentIssueId ? parseInt(parentIssueId, 10) : null,
    };
    onSave(updatedIssue);
    updateIssueDetails(updatedIssue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent default form submission behavior
      handleSave(); // Trigger save action
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white w-96 rounded-lg p-6 shadow-lg relative"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown} // Attach the keydown event listener
        tabIndex={-1} // Ensure the div is focusable for key events
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <h2 className="text-lg font-semibold text-[#54B2A3] mb-6 text-center">
        이슈 편집
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이슈 타이틀</label>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="이슈 타이틀을 입력해주세요"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#54B2A3] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="이슈에 대한 설명을 입력해주세요"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#54B2A3] focus:outline-none resize-none"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">우선순위</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#54B2A3] focus:outline-none"
            >
              <option value="Highest">Highest</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
              <option value="Lowest">Lowest</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Story Points</label>
            <input
              type="number"
              value={storyPoints}
              onChange={(e) => setStoryPoints(parseInt(e.target.value, 10))}
              placeholder="Enter story points"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#54B2A3] focus:outline-none"
            />
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={!isSaveEnabled}
          className={`mt-6 w-full py-2 px-4 rounded-lg transition-all ${
            isSaveEnabled
              ? 'bg-[#54B2A3] text-white hover:bg-[#459d8e]'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          저장
        </button>
      </div>
    </div>
  );
};

export default EditInfoModal;
