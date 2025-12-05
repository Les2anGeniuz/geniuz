import { MoreVertical } from 'lucide-react';

export interface TugasCardProps {
  id: string;
  title: string;
  dueDate: string;
  status: 'TELAH' | 'BELUM';
}

export default function TugasCard({ title, dueDate, status }: TugasCardProps) {
  const isSubmitted = status === 'TELAH';

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-3">
      <div className="flex justify-between items-start">
        {/* Info Tugas */}
        <div>
          <span 
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              isSubmitted 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}
          >
            {status}
          </span>
          <h3 className="text-md font-semibold text-gray-900 mt-2 hover:text-blue-600 cursor-pointer">
            {title}
          </h3>
        </div>
        {/* Tombol Menu */}
        <button className="text-gray-400 hover:text-gray-600 p-1">
          <MoreVertical size={18} />
        </button>
      </div>
      <p className="text-sm text-gray-500 mt-1">{dueDate}</p>
    </div>
  );
}