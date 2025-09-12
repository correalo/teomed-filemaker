'use client'

import { useState } from 'react'
import { Paciente } from '../types/paciente'
import { useToast } from './Toast';
import { useRouter } from "next/navigation";

type Props = {
  paciente: { _id: string; nome: string; prontuario: number };
};

export function BotaoDeletarPaciente({ paciente }: Props) {
  const [open, setOpen] = useState(false)
  const toast = useToast();
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    try {
      setDeleting(true);

      // Chame sua API de deleção
      const res = await fetch(`http://localhost:3004/pacientes/${paciente._id}`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Falha ao deletar");
      }

      // Feche o modal e só então navegue/atualize se quiser
      setOpen(false);

      toast.success('Paciente deletado com sucesso!')
      
      setTimeout(() => {
        window.location.href = '/pacientes'
      }, 1500)

    } catch (e: any) {
      console.error("Erro ao deletar:", e?.message || e);
      toast.error(`Erro ao deletar: ${e?.message || "tente novamente"}`);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button" // evita submit se estiver dentro de <form>
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        disabled={deleting}
      >
        🗑️ Deletar
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-96 rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-bold text-red-600 mb-4">
              🚨 ATENÇÃO: DELETAR PACIENTE 🚨
            </h2>
            <p className="mb-2">
              Paciente: <strong>{paciente.nome}</strong>
            </p>
            <p className="mb-4">
              Prontuário: <strong>{paciente.prontuario}</strong>
            </p>
            <p className="mb-6 text-gray-700">
              Esta ação é <strong>IRREVERSÍVEL</strong>! Tem certeza que deseja
              continuar?
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={deleting}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                {deleting ? "Deletando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
