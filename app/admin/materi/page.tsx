"use client";

import { useEffect, useState } from "react";
import NavbarAdmin from "../../components/layouts/navbarAdmin";
import SidebarAdmin from "../../components/layouts/sidebarAdmin";

import ClassSearch from "../../components/materi/ClassSearch";
import ClassHeader from "../../components/materi/ClassHeader";
import ClassStructure from "../../components/materi/ClassStructure";
import TaskForm from "../../components/materi/TaskForm";
import TaskList from "../../components/materi/TaskList";
import ModuleForm from "../../components/materi/ModuleForm";

export default function AdminMateri() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModuleForm, setShowModuleForm] = useState(false);

  // -----------------------------------------------------
  // Load daftar kelas
  // -----------------------------------------------------
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/kelas?limit=50`, { credentials: "same-origin" });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Gagal ambil kelas");
        setClasses(json.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // -----------------------------------------------------
  // Load modules & tasks ketika kelas dipilih
  // -----------------------------------------------------
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
          fetch(`/api/materi?kelas=${selected.id_Kelas ?? selected.id}`, { credentials: "same-origin" }),
          fetch(`/api/tugas?kelas=${selected.id_Kelas ?? selected.id}`, { credentials: "same-origin" }),
        ]);

        const mJson = await mRes.json();
        const tJson = await tRes.json();

        const materi = mJson.data || [];
        const normalizedModules = materi.map((m: any) => ({
          id: m.id_Materi,
          title: m.judul_materi,
          description: m.deskripsi ?? "",
        }));

        setModules(normalizedModules);
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
    setTasks((prev) => [t, ...prev]);
  };

  return (
    <div className="flex min-h-screen bg-[#F4F6F9]">
      {/* SIDEBAR */}
      <SidebarAdmin />

      {/* CONTENT */}
      <div className="flex-1 ml-64 flex flex-col">

        {/* NAVBAR */}
        <div className="sticky top-0 bg-white h-16 shadow-sm z-50 flex items-center px-4">
          <NavbarAdmin />
        </div>

        {/* PAGE HEADER STICKY */}
        <div className="sticky top-16 z-40 bg-[#F4F6F9] px-10 pt-5 pb-4 backdrop-blur">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-[#002D5B]">Manajemen Materi</h1>
              <p className="text-sm text-gray-500 mt-1">Buat, edit, dan atur struktur materi kelas</p>
            </div>

            <button
              onClick={() => setShowModuleForm(!showModuleForm)}
              disabled={!selected}
              className={`px-5 py-2 rounded-xl text-white text-sm shadow-sm transition-all
                ${
                  selected
                    ? "bg-[#002D5B] hover:bg-[#093a68]"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
            >
              + Add Module
            </button>
          </div>
        </div>

        {/* MAIN */}
        <div className="flex-1 px-10 pb-10 pt-4 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto space-y-6">

            {/* SEARCH — Notion card */}
            <ClassSearch
              classes={classes.map((c) => ({
                id: c.id_Kelas ?? c.id,
                name: c.nama_kelas ?? c.name,
                description: c.deskripsi,
              }))}
              onSelect={(c) => setSelected(c)}
            />

            {/* HEADER KELAS */}
            <ClassHeader
              kelas={
                selected
                  ? {
                      id: selected.id_Kelas ?? selected.id,
                      name: selected.nama_kelas ?? selected.name,
                      description: selected.deskripsi,
                    }
                  : null
              }
            />

            {/* MODULE FORM */}
            {showModuleForm && (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                <ModuleForm
                  kelasId={selected?.id_Kelas ?? selected?.id}
                  onCancel={() => setShowModuleForm(false)}
                  onCreate={(m) => {
                    const row = m.data ?? m;
                    const newMod = {
                      id: row.id_Materi,
                      title: row.judul_materi,
                      description: row.deskripsi ?? "",
                    };
                    setModules((prev) => [newMod, ...prev]);
                    setShowModuleForm(false);
                  }}
                />
              </div>
            )}

            {/* STRUCTURE */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <ClassStructure modules={modules} />
            </div>

            {/* TASKS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pb-6">

              {/* FORM */}
              <div className="md:col-span-2">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                  <TaskForm
                    onAdd={handleAddTask}
                    kelasId={selected?.id_Kelas ?? selected?.id}
                    modules={modules}
                  />
                </div>
              </div>

              {/* LIST */}
              <div className="md:col-span-3">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                  <TaskList tasks={tasks} />
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}