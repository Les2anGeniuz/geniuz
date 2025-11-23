"use client";

import { useEffect, useState } from "react";
import ClassSearch from "../materi/ClassSearch";
import ClassHeader from "../materi/ClassHeader";
import ClassStructure from "../materi/ClassStructure";
import TaskForm from "../materi/TaskForm";
import TaskList from "../materi/TaskList";
import ModuleForm from "../materi/ModuleForm";

export default function MateriPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModuleForm, setShowModuleForm] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/kelas?limit=50`, { credentials: "same-origin" });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Gagal ambil kelas");
        setClasses(json.data || json?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selected) {
      setModules([]);
      setTasks([]);
      return;
    }

    const loadDetails = async () => {
      try {
        setLoading(true);
        const [mRes, tRes] = await Promise.all([
          fetch(`/api/materi?kelas=${encodeURIComponent(selected.id_Kelas ?? selected.id ?? selected.id_Kelas)}`, { credentials: "same-origin" }),
          fetch(`/api/tugas?kelas=${encodeURIComponent(selected.id_Kelas ?? selected.id ?? selected.id_Kelas)}`, { credentials: "same-origin" }),
        ]);

        const mJson = await mRes.json();
        const tJson = await tRes.json();

        if (!mRes.ok) console.error(mJson);
        if (!tRes.ok) console.error(tJson);

        const normalized = (mJson.data || []).map((m: any) => ({
          id: m.id_Materi,
          title: m.judul_materi,
          description: m.deskripsi
        }));

        setModules(normalized);
        setTasks(tJson.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [selected]);

  const handleAddTask = (t: any) => {
    setTasks((s) => [t, ...s]);
  };

  return (
    <main className="ml-64 pt-16 p-0 min-h-screen bg-[#F8FAFC]"> {/* 🔧 removed p-8 */}
      
      <div className="max-w-[1400px] mx-auto px-8"> {/* 🔧 enlarged width */}
        
        {/* Header */}
        <div className="flex items-center justify-between py-6">
          <div>
            <h1 className="text-3xl font-bold">Manajemen Materi</h1>
            <p className="text-sm text-gray-500 mt-1">Buat, edit, dan atur konten kelas</p>
          </div>
          <button
            onClick={() => setShowModuleForm((s) => !s)}
            disabled={!selected}
            className={`px-4 py-2 rounded-md text-white ${selected ? "bg-[#0A4378]" : "bg-gray-300 cursor-not-allowed"}`}
          >
            + Add Module
          </button>
        </div>

        {/* Search — TIDAK scroll */}
        <ClassSearch
          classes={classes.map((c) => ({
            id: c.id_Kelas ?? c.id,
            name: c.nama_kelas ?? c.name,
            description: c.deskripsi,
          }))}
          onSelect={(c) => setSelected(c)}
        />

        <ClassHeader
          kelas={
            selected
              ? { id: selected.id_Kelas ?? selected.id, name: selected.nama_kelas ?? selected.name, description: selected.deskripsi }
              : null
          }
        />

        {/* AREA SCROLL MULAI DI SINI */}
        <div className="overflow-y-auto max-h-[calc(100vh-300px)] pr-2"> {/* 🔧 scroll only here */}
          
          {showModuleForm && (
            <div className="mb-6">
              <ModuleForm
                kelasId={selected?.id_Kelas ?? selected?.id}
                onCancel={() => setShowModuleForm(false)}
                onCreate={(m) => {
                  const row = m.data ?? m;
                  const normalized = {
                    id: row.id_Materi,
                    title: row.judul_materi,
                    description: row.deskripsi ?? "",
                  };
                  setModules((s) => [normalized, ...s]);
                  setShowModuleForm(false);
                }}
              />
            </div>
          )}

          <div className="mb-6">
            <ClassStructure modules={modules.map((m) => ({ id: m.id, title: m.title, description: m.description }))} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-10">
            <div className="md:col-span-2">
              <TaskForm
                onAdd={handleAddTask}
                kelasId={selected?.id_Kelas ?? selected?.id}
                modules={modules.map((m) => ({ id: m.id, title: m.title }))}
              />
            </div>
            <div>
              <TaskList tasks={tasks} />
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}