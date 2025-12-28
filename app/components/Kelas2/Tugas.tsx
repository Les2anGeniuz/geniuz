import { MoreVertical } from 'lucide-react';
import Link from 'next/link';

export interface TugasCardProps {
  id: string | number;
  title: string;
  dueDate: string;
  status: 'TELAH' | 'BELUM';
}

export default function TugasCard({ id, title, dueDate, status }: TugasCardProps) {
  const isSubmitted = status === 'TELAH';

  return (
    <Link href={`/tugas/${id}`}>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-3 hover:shadow-md transition cursor-pointer">
        <div className="flex justify-between items-start gap-2">
          {/* Info Tugas */}
          <div className="flex-1">
            <span 
              className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tight ${
                isSubmitted 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {/* Logika perubahan teks di sini */}
              {isSubmitted ? 'Selesai' : 'Belum Dikerjakan'}
            </span>
            
            <h3 className="text-md font-semibold text-gray-900 mt-2 hover:text-blue-600 leading-tight">
              {title}
            </h3>
          </div>

          {/* Tombol Menu */}
          <button 
            className="text-gray-400 hover:text-gray-600 p-1 flex-shrink-0"
            onClick={(e) => e.preventDefault()}
          >
            <MoreVertical size={18} />
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2 font-medium">Tenggat: {dueDate}</p>
      </div>
    </Link>
  );
}