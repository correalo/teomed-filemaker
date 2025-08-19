import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  paciente: { _id: string; nome: string; prontuario: number };
};

export function BotaoDeletarPaciente({ paciente }: Props) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    try {
      setDeleting(true);

      // Chame sua API de deleção
      const res = await fetch(`http://localhost:3001/pacientes/${paciente._id}`, {
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

      // Toast de sucesso
      const toast = document.createElement('div')
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-8 py-4 rounded-lg shadow-xl z-50 text-lg font-semibold'
      toast.textContent = '✅ Paciente deletado com sucesso!'
      document.body.appendChild(toast)
      
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast)
        }
        window.location.reload()
      }, 2000)

    } catch (e: any) {
      console.error("Erro ao deletar:", e?.message || e);
      
      // Toast de erro
      const toast = document.createElement('div')
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
      toast.textContent = `❌ Erro ao deletar: ${e?.message || "tente novamente"}`
      document.body.appendChild(toast)
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast)
        }
      }, 3000)
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
