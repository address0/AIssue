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
    //   issue_key: string;
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
          className="bg-white w-96 rounded-lg p-6 shadow-lg relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500"
          >
            ✕
          </button>
  
          <div>
            <h2 className="text-lg font-semibold text-teal-600 mb-4">
              이슈: {issueDetails.summary}
            </h2>
            <p className="text-sm">
              <strong>설명:</strong> {issueDetails.description}
            </p>
            <p className="text-sm">
              <strong>우선순위:</strong> {issueDetails.priority}
            </p>
            <p className="text-sm">
              <strong>스토리 포인트:</strong> {issueDetails.story_points}
            </p>
          </div>
        </div>
      </div>
    );
  };
  
  export default InfoModal;
  