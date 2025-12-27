import Image from 'next/image';
import { MoreVertical, Calendar } from 'lucide-react'; // Tambah icon Calendar agar lebih mirip desain

// Helper untuk warna tag sesuai desain referensi
const getTagColor = (tag: string) => {
  const upperTag = tag.toUpperCase();
  if (upperTag.includes('PERTEMUAN')) return 'bg-blue-50 text-blue-500 border border-blue-100';
  if (upperTag === 'MATERI' || upperTag === 'VIDEO' || upperTag === 'RANGKUMAN') return 'bg-pink-50 text-pink-500 border border-pink-100';
  if (upperTag === 'TAYANG') return 'bg-green-50 text-green-500 border border-green-100';
  return 'bg-gray-50 text-gray-500 border border-gray-100';
};

export interface MateriCardProps {
  id: string;
  title: string;
  date: string;
  thumbnailUrl: string;
  tags: readonly string[];
}

export default function MateriCard({ title, date, thumbnailUrl, tags }: MateriCardProps) {
  // Format tanggal agar lebih cantik (opsional, sesuaikan dengan database)
  const formattedDate = date ? new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : 'Tanggal tidak tersedia';

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex gap-6 items-center transition-all hover:shadow-md hover:border-blue-100 group">
      {/* Thumbnail dengan aspek rasio yang pas */}
      <div className="relative w-[200px] h-[112px] flex-shrink-0 overflow-hidden rounded-lg shadow-inner bg-gray-100">
        <Image 
          src={thumbnailUrl} 
          alt={title} 
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      
      {/* Info Materi */}
      <div className="flex-grow">
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag, index) => (
            <span 
              key={`${tag}-${index}`} 
              className={`text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase ${getTagColor(tag)}`}
            >
              {tag}
            </span>
          ))}
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#064479] transition-colors">
          {title}
        </h3>
        
        {/* Tambahkan icon kalender sesuai desain */}
        <div className="flex items-center gap-2 text-gray-400">
          <Calendar size={14} />
          <p className="text-xs font-medium">{formattedDate}</p>
        </div>
      </div>

      {/* Tombol Menu */}
      <button className="text-gray-300 hover:text-gray-600 p-2 transition-colors">
        <MoreVertical size={20} />
      </button>
    </div>
  );
}