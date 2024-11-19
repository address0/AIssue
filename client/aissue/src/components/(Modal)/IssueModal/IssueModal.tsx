import React, { useState } from 'react';
import InfoModal from '../InfoModal/InfoModal';
import EditInfoModal from '../EditInfoModal/EditInfoModal';

interface Task {
  title: string;
  start: Date;
  end: Date;
}

interface IssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  title: string;
  parentSummary: string;
  issueId: number | null;
  issueKey: string | null;
  parentIssueId?: string;
}

const IssueModal: React.FC<IssueModalProps> = ({
  isOpen,
  onClose,
  tasks,
  title,
  parentSummary,
  issueId,
  issueKey,
  parentIssueId,
}) => {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isEditInfoModalOpen, setIsEditInfoModalOpen] = useState(false);
  const [issueDetails, setIssueDetails] = useState({
    summary: title,
    description: '',
    priority: 'Medium',
    story_points: 0,
    issue_id: issueId,
    issue_key: issueKey,
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white w-96 rounded-lg p-6 shadow-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500"
        >
          ✕
        </button>
        <h2 className="text-lg font-semibold text-[#7498E5] mb-4">
          에픽: {parentSummary}
        </h2>
        <h3 className="text-lg font-semibold text-teal-600 mb-4">
          이슈: {issueDetails.summary}
          <img
            src="/img/information.png"
            alt="정보 보기"
            className="inline-block w-5 h-5 ml-2 cursor-pointer"
            onClick={() => setIsInfoModalOpen(true)}
          />
          <img
            src="/img/pencil.png"
            alt="수정"
            className="inline-block w-5 h-5 ml-2 cursor-pointer"
            onClick={() => setIsEditInfoModalOpen(true)}
          />
        </h3>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {tasks.map((task, index) => (
            <div
              key={index}
              className="p-3 bg-gray-50 rounded-md shadow-sm border border-gray-200"
            >
              <h3 className="text-sm font-semibold text-orange-600">
                {task.title}
              </h3>
              <p className="text-xs text-gray-500">
                Start: {task.start.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                End: {task.end.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* InfoModal */}
      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        issueKey={issueDetails.issue_key}
        issueDetails={issueDetails} // 전달된 상태 반영
      />

      {/* EditInfoModal */}
      <EditInfoModal
        isOpen={isEditInfoModalOpen}
        onClose={() => setIsEditInfoModalOpen(false)}
        issueId={issueId} // 숫자로 변환
        issueKey={issueKey} // 문자열 그대로 전달
        parentIssueId={parentIssueId}
        onSave={(updatedIssue) => {
          console.log('Updated Issue:', updatedIssue);
          setIsEditInfoModalOpen(false);
          setIssueDetails((prev) => ({
            ...prev,
            ...updatedIssue, // 수정된 데이터로 상태 업데이트
          }));
        }}
      />


    </div>
  );
};

export default IssueModal;
