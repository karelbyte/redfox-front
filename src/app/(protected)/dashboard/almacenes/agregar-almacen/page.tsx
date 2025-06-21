import { Btn } from "@/components/atoms";
import Link from "next/link";

export default function AgregarAlmacenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-8">
          <div className="mx-auto h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
            <svg
              className="h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            En Construcción
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            La funcionalidad para agregar almacenes estará disponible pronto.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link href="/dashboard/almacenes/lista-de-almacenes">
            <Btn variant="primary" className="w-full sm:w-auto">
              Volver a la Lista de Almacenes
            </Btn>
          </Link>
          
          <Link href="/dashboard">
            <Btn variant="outline" className="w-full sm:w-auto">
              Ir al Dashboard
            </Btn>
          </Link>
        </div>
      </div>
    </div>
  );
} 