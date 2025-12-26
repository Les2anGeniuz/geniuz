import React from "react";

interface StudentRow {
    id_user: string;
    nama_lengkap: string;
    email: string;
    fakultas?: string | null;
    tanggal_pendaftaran?: string | null;
    status?: string | null;
}

interface Props {
    data: StudentRow[];
}

const SiswaTable: React.FC<Props> = ({ data }) => {
    return (
        <div className="w-full">
            <div className="overflow-x-auto">
                <table className="w-full max-w-full mx-auto text-[13px] min-w-[720px] rounded-lg overflow-hidden">
                    <thead className="sticky top-0 z-10 bg-[#002D5B]">
                        <tr className="bg-[#002D5B] text-white text-[14px]">
                            <th className="py-3 px-4 text-left font-semibold">Siswa</th>
                            <th className="py-3 px-4 text-left font-semibold">Fakultas</th>
                            <th className="py-3 px-4 text-right font-semibold">Tanggal Pendaftaran</th>
                            <th className="py-3 px-4 text-right font-semibold">Status</th>
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
                                    key={row.id_user}
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

                                    <td className="py-4 px-4 align-top text-[13px] text-gray-800 font-semibold">
                                        {row.fakultas || "-"}
                                    </td>

                                    <td className="py-4 px-4 text-right text-[13px] text-gray-700">
                                        {row.tanggal_pendaftaran
                                            ? new Date(row.tanggal_pendaftaran).toLocaleDateString("id-ID")
                                            : "-"}
                                    </td>

                                    <td className="py-4 px-4 text-right text-[13px]">
                                        <span className={`px-3 py-1 rounded-full border text-[12px] font-semibold ${row.status === "aktif" ? "border-green-500 text-green-700 bg-green-50" : "border-gray-300 text-gray-600 bg-gray-50"}`}>
                                            {row.status ? row.status.toUpperCase() : "-"}
                                        </span>
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
