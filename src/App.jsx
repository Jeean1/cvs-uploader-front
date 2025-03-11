import { useState } from "react";
import axios from "axios";

const FileUploader = () => {
  const [file, setFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [enableSuccessAlert, setEnableSuccessAlert] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [detailClient, setDetailClient] = useState({});
  const itemsPerPage = 10;

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:4000/customers/detail?query=${query}`
      );
      setResults(response.data);
    } catch (error) {
      console.error("Error en la búsqueda:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Por favor, selecciona un archivo primero.");
      return;
    }

    // Validar que el archivo sea un CSV
    const allowedTypes = ["text/csv", "application/vnd.ms-excel"];
    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (!allowedTypes.includes(file.type) || fileExtension !== "csv") {
      alert("Solo se permiten archivos CSV.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:4000/customers/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setData(response.data.items.data);
      setTotalPages(response.data.items.totalPages);
      setEnableSuccessAlert(true);
    } catch (error) {
      console.error("Error en la subida:", error);
      alert("Error al enviar el archivo.");
    }
  };

  const loadData = async (page) => {
    setCurrentPage(page);

    try {
      const response = await axios.get(
        `http://localhost:4000/customers/general?page=${page}&limit=${itemsPerPage}`
      );

      setData(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error obteniendo data:", error);
      alert("Error al obtener los datos.");
    }
  };

  return (
    <div
      className="grid grid-cols-2 gap-4"
      style={{ background: "#f0f0f0f0", padding: "6rem 0" }}
    >
      <div>
        {/* buscar */}
        <div
          className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-lg mt-6 border border-gray-300"
          style={{ marginBottom: "5rem" }}
        >
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Buscar Usuario
          </h2>
          <input
            type="text"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nombre o correo electrónico"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            className="mt-4 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>
          {Object.keys(results).length > 0 && (
            <>
              <h3 className="font-semibold text-gray-700 text-center my-4">
                Resultados:
              </h3>

              <ul className="mt-2 text-sm text-gray-600">
                <li key={results.id} className="border-b border-gray-300 py-2">
                  <strong>Nombre:</strong> {results.name} <br />
                  <strong>Edad:</strong> {results.age} <br />
                  <strong>Email:</strong> {results.email}
                </li>
              </ul>
            </>
          )}
        </div>

        {/* formulario csv */}
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Subir Archivo
          </h2>
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full p-2 border border-gray-300 rounded-md mb-3"
          />
          {file && (
            <p className="text-gray-600 mb-2">
              Archivo seleccionado: {file.name}
            </p>
          )}
          <button
            onClick={handleUpload}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Enviar Archivo
          </button>
        </div>

        {enableSuccessAlert && (
          <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg mt-6 text-center border border-green-500">
            <h2 className="text-lg font-semibold text-green-600">
              ✔ Datos cargados exitosamente
            </h2>
            <p className="text-gray-700 mt-2">
              Los datos han sido procesados correctamente.
            </p>
          </div>
        )}
      </div>

      {/* table */}
      <div>
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg mt-6 border border-gray-300">
          {data.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 uppercase text-sm">
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        ID
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Nombre
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-center">
                        Edad
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Correo
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item) => (
                      <tr
                        key={item.id}
                        className="border-t border-gray-300 hover:bg-gray-50 hover:shadow-md hover:cursor-pointer transition-shadow"
                        onClick={() => {
                          setDetailClient(item);
                          setOpenModal(true);
                        }}
                      >
                        <td className="px-4 py-2">{item.id}</td>
                        <td className="px-4 py-2">{item.name}</td>
                        <td className="px-4 py-2 text-center">{item.age}</td>
                        <td className="px-4 py-2">{item.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => loadData(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="text-gray-700 text-sm">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => loadData(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </>
          ) : (
            <div className="max-w-md mx-auto p-6 mt-6  ">
              <h2
                className="text-lg font-semibold text-gray-700 mb-4"
                style={{ textAlign: "center" }}
              >
                Filtrar lista general
              </h2>

              <button
                className="mt-4 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
                onClick={() => loadData(currentPage + 1)}
                disabled={loading}
              >
                Buscar
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Modal */}
      {openModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
              Detalle de Cliente
            </h2>

            <div className="mt-4 space-y-2 text-gray-700">
              <div>
                <span className="font-medium">Nombre: </span>
                {detailClient.name}
              </div>
              <div>
                <span className="font-medium">Edad: </span>
                {detailClient.age}
              </div>
              <div>
                <span className="font-medium">Correo: </span>
                {detailClient.email}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                onClick={() => setOpenModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
