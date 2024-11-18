import React from 'react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  issueKey: string | null;
  issueDetails: {
    summary: string;
    status?: string;
    description: string;
    priority: string;
    issue_id: number | null;
    story_points: number;
  };
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, issueDetails }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-sm rounded-lg p-6 shadow-lg relative"
        onClick={(e) => e.stopPropagation()} // Prevent click propagation
      >
 

        {/* Modal Header */}
        <h2 className="text-lg font-semibold text-[#54B2A3] text-center mb-6">
          이슈: {issueDetails.summary}
        </h2>

        {/* Modal Content */}
        <div className="grid grid-cols-2 gap-y-4 text-sm text-gray-700">
        <div className="font-medium text-right pr-4 border-r border-[#D9D9D9]">설명</div>
        <div className="text-left pl-4">{issueDetails.description}</div>

        <div className="font-medium text-right pr-4 border-r border-[#D9D9D9]">우선순위</div>
        <div className="text-left pl-4">{issueDetails.priority}</div>

        <div className="font-medium text-right pr-4 border-r border-[#D9D9D9]">스토리 포인트</div>
        <div className="text-left pl-4">{issueDetails.story_points}</div>
        </div>


        {/* Confirm Button */}
        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#54B2A3] text-white font-semibold rounded hover:bg-teal-500 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
