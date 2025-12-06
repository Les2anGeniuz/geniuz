import React from "react";

interface StudentRow {
    id_user: string;
    nama_lengkap: string;
    email: string;
    nama_kelas?: string | null;
    tanggal_masuk?: string | null;
    terakhir_aktif?: string | null;
}

interface Props {
    data: StudentRow[];
}

const SiswaTable: React.FC<Props> = ({ data }) => {
    return (
        <div className="w-full">
            <div className="overflow-x-auto">
                <table className="w-full max-w-full mx-auto text-[13px] min-w-[720px] rounded-lg overflow-hidden">
                    <thead>
                        <tr className="bg-[#002D5B] text-white text-[14px]">
                            <th className="py-3 px-4 text-left font-semibold rounded-tl-lg">Siswa</th>
                            <th className="py-3 px-4 text-left font-semibold">Kelas</th>
                            <th className="py-3 px-4 text-right font-semibold">Tanggal Masuk</th>
                            <th className="py-3 px-4 text-right font-semibold rounded-tr-lg">Terakhir Aktif</th>
                        </tr>
                    </thead>

                    {data.length === 0 ? (
                        <tbody>
                            <tr>
                                <td
                                    colSpan={4}
                                    className="text-center py-6 text-gray-500 text-sm bg-white"
                                >
                                    Belum ada siswa yang terdaftar.
                                </td>
                            </tr>
                        </tbody>
                    ) : (
                        <tbody>
                            {data.map((row) => (
                                <tr
                                    key={`${row.id_user}-${row.nama_kelas ?? "none"}`}
                                    className="hover:bg-gray-50 transition"
                                >
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-300" />
                                            <div>
                                                <p className="text-[15px] font-semibold text-[#002D5B] leading-tight">
                                                    {row.nama_lengkap}
                                                </p>
                                                <p className="text-[12px] text-gray-500">{row.email}</p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="py-4 px-4">
                                        {row.nama_kelas ? (
                                            <span className="inline-block px-3 py-1 rounded-full border border-gray-300 text-[12px] font-medium text-[#002D5B] bg-gray-50 whitespace-nowrap">
                                                {row.nama_kelas}
                                            </span>
                                        ) : (
                                            <span className="text-[12px] text-gray-400">-</span>
                                        )}
                                    </td>

                                    <td className="py-4 px-4 text-right text-[13px] text-gray-700">
                                        {row.tanggal_masuk
                                            ? new Date(row.tanggal_masuk).toLocaleDateString("id-ID")
                                            : "-"}
                                    </td>

                                    <td className="py-4 px-4 text-right text-[13px] text-gray-700">
                                        {row.terakhir_aktif
                                            ? new Date(row.terakhir_aktif).toLocaleDateString("id-ID")
                                            : "-"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    )}
                </table>
            </div>
        </div>
    );
};

export default SiswaTable;
