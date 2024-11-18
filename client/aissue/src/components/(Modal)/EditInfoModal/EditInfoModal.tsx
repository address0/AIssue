import React, { useState } from 'react';
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
  issueId: number | null; // issue_id를 직접 전달받음
  issueKey: string | null;
  parentIssueId?: string; // 이 속성을 추가
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

  const handleSave = () => {
    const updatedIssue: UpdatedIssue = {
      summary,
      description,
      priority,
      story_points: storyPoints,
      issue_id: issueId, // 명확히 전달받은 issue_id 사용
      issue_key: issueKey,
      parent_issue_id: parentIssueId ? parseInt(parentIssueId, 10) : null,
    };
    onSave(updatedIssue);
    updateIssueDetails(updatedIssue);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose} // 모달 외부 클릭 시 닫힘
    >
      <div
        className="bg-white w-96 rounded-lg p-6 shadow-lg relative"
        onClick={(e) => e.stopPropagation()} // 이벤트 전파 방지
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500"
        >
          ✕
        </button>
        <h2 className="text-lg font-semibold mb-4">Edit Issue</h2>
        <div className="space-y-4">
          <input
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Summary"
            className="w-full border border-gray-300 rounded p-2"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full border border-gray-300 rounded p-2"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full border border-gray-300 rounded p-2"
          >
            <option value="Highest">Highest</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
            <option value="Lowest">Lowest</option>
          </select>
          <input
            type="number"
            value={storyPoints}
            onChange={(e) => setStoryPoints(parseInt(e.target.value, 10))}
            placeholder="Story Points"
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>
        <button
          onClick={handleSave}
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default EditInfoModal;
