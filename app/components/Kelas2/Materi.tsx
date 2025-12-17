import Image from 'next/image';
import { MoreVertical } from 'lucide-react';

// Helper untuk warna tag
const getTagColor = (tag: string) => {
  if (tag.includes('PERTEMUAN')) return 'bg-yellow-100 text-yellow-800';
  if (tag === 'MATERI') return 'bg-blue-100 text-blue-800';
  if (tag === 'TAYANG') return 'bg-green-100 text-green-800';
  return 'bg-gray-100 text-gray-800';
};

export interface MateriCardProps {
  id: string;
  title: string;
  date: string;
  thumbnailUrl: string;
  tags: readonly string[];
}

export default function MateriCard({ title, date, thumbnailUrl, tags }: MateriCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex gap-5 items-center transition-shadow hover:shadow-md">
      {/* Thumbnail */}
      <Image 
        src={thumbnailUrl} 
        alt={title} 
        width={200} // Sesuaikan ukurannya
        height={112} 
        className="rounded-md object-cover bg-gray-200"
      />
      
      {/* Info Materi */}
      <div className="flex-grow">
        <div className="flex gap-2 mb-2">
          {tags.map((tag) => (
            <span 
              key={tag} 
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${getTagColor(tag)}`}
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500">{date}</p>
      </div>

      {/* Tombol Menu */}
      <button className="text-gray-400 hover:text-gray-600 p-2">
        <MoreVertical size={20} />
      </button>
    </div>
  );
}