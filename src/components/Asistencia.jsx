import { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

function Asistencia() {
  const [date, setDate] = useState("");
  const [presencial, setPresencial] = useState("");
  const [zoom, setZoom] = useState("");
  const [youtube, setYoutube] = useState("");
  const [historial, setHistorial] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");
  const [loading, setLoading] = useState(false);
  const [notas, setNotas] = useState("");

  // Estado para mostrar los modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "asistencias"));
        const asistenciasData = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        // Sort by date in descending order
        asistenciasData.sort((a, b) => new Date(b.date) - new Date(a.date));

        setHistorial(asistenciasData);
      } catch (error) {
        console.error("Error al obtener los documentos: ", error);
        showToastMessage("Error al obtener los documentos.", "error");
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!date) {
      showToastMessage("La fecha es obligatoria.", "error");
      return;
    }

    setLoading(true);
    const total = parseInt(presencial) + parseInt(zoom) + parseInt(youtube);

    try {
      const docRef = await addDoc(collection(db, "asistencias"), {
        date,
        presencial: parseInt(presencial),
        zoom: parseInt(zoom),
        youtube: parseInt(youtube),
        total,
        notas, // Include notas here
      });
      setHistorial([
        ...historial,
        { date, presencial, zoom, youtube, total, notas, id: docRef.id },
      ]);
      setDate("");
      setPresencial("");
      setZoom("");
      setYoutube("");
      setNotas(""); // Clear the notas input
      showToastMessage("¡Asistencia agregada correctamente!", "success");
    } catch (e) {
      console.error("Error al agregar el documento: ", e);
      showToastMessage("Error al agregar la asistencia.", "error");
    } finally {
      setLoading(false);
      setShowAddModal(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "asistencias", deleteId));
      setHistorial(historial.filter((entry) => entry.id !== deleteId));
      showToastMessage("Asistencia eliminada correctamente.", "success");
    } catch (e) {
      console.error("Error al eliminar el documento: ", e);
      showToastMessage("Error al eliminar la asistencia.", "error");
    } finally {
      setShowDeleteModal(false);
    }
  };

  const showToastMessage = (message, type) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center">
      <div className="container px-3">
        <h2 className="my-4 text-center">Asistencia Reuniones</h2>
        <form className="mx-auto mb-3 w-100" style={{ maxWidth: "400px" }}>
          <div className="mb-4 row justify-content-center">
            <div className="col-12">
              <i className="fas fa-calendar-alt fa-lg me-2"></i>
              <label htmlFor="fecha" className="form-label fw-bold">
                Fecha
              </label>
              <input
                type="date"
                id="fecha"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-4 row justify-content-center">
            <div className="col-12">
            <i className="fa-solid fa-users fa-lg me-2"></i>
              <label htmlFor="presencial" className="form-label fw-bold">
                Presencial
              </label>
              <input
                type="number"
                id="presencial"
                className="form-control"
                value={presencial}
                onChange={(e) => setPresencial(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-4 row justify-content-center">
            <div className="col-12">
            <i className="fas fa-video fa-lg me-2"></i>
              <label htmlFor="zoom" className="form-label fw-bold">
                Zoom
              </label>
              <input
                type="number"
                id="zoom"
                className="form-control"
                value={zoom}
                onChange={(e) => setZoom(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-4 row justify-content-center">
            <div className="col-12">
            <i className="fab fa-youtube fa-lg me-2"></i>
              <label htmlFor="youtube" className="form-label fw-bold">
                YouTube
              </label>
              <input
                type="number"
                id="youtube"
                className="form-control"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-4 row justify-content-center">
            <div className="col-12">
            <i className="fas fa-sticky-note fa-lg me-2"></i>
              <label htmlFor="notas" className="form-label fw-bold">
                Notas
              </label>
              <textarea
                id="notas"
                className="form-control"
                rows="4" // Ajusta la cantidad de filas según lo necesites
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-4 text-center">
            <button
              type="button"
              className="btn btn-primary px-4"
              onClick={() => setShowAddModal(true)}
            >
              Agregar Asistencia
            </button>
          </div>
        </form>

        <h3 className="mb-2 text-center">Historial</h3>

        <div className="table-responsive">
          <table className="table table-striped table-bordered w-100 mx-auto">
            <thead>
              <tr className="text-center">
                <th>Fecha</th>
                <th>Presencial</th>
                <th>Zoom</th>
                <th>YouTube</th>
                <th>Total</th>
                <th>Notas</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="text-center">
              {historial.map((entry) => {
                const duplicate =
                  historial.filter((e) => e.date === entry.date).length > 1;
                return (
                  <tr
                    key={entry.id}
                    style={duplicate ? { backgroundColor: "IndianRed" } : {}}
                  >
                    <td>
                      {new Date(
                        new Date(entry.date).getTime() +
                          new Date(entry.date).getTimezoneOffset() * 60000
                      ).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>

                    <td>{entry.presencial}</td>
                    <td>{entry.zoom}</td>
                    <td>{entry.youtube}</td>
                    <td>{entry.total}</td>
                    <td>{entry.notas}</td>
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => {
                          setDeleteId(entry.id);
                          setShowDeleteModal(true);
                        }}
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Modal para agregar asistencia */}
        <div
          className={`modal fade ${showAddModal ? "show d-block" : ""}`}
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar Agregar Asistencia</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  ¿Quieres confirmar la asistencia con los siguientes detalles?
                </p>
                <ul>
                  <li>
                    <strong>Fecha:</strong> {date}
                  </li>
                  <li>
                    <strong>Presencial:</strong> {presencial}
                  </li>
                  <li>
                    <strong>Zoom:</strong> {zoom}
                  </li>
                  <li>
                    <strong>YouTube:</strong> {youtube}
                  </li>
                  <li>
                    <strong>Notas:</strong> {notas}
                  </li>
                </ul>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Agregando...
                    </>
                  ) : (
                    "Confirmar"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal para eliminar asistencia */}
        <div
          className={`modal fade ${showDeleteModal ? "show d-block" : ""}`}
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar Eliminación</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>¿Estás seguro de que quieres eliminar esta asistencia?</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Toast Bootstrap */}
        <div
          className={`toast position-fixed bottom-0 end-0 m-3 ${
            showToast ? "show" : ""
          }`}
          style={{ zIndex: 1 }}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div
            className={`toast-header ${
              toastType === "success"
                ? "bg-success text-white"
                : "bg-danger text-white"
            }`}
          >
            <strong className="me-auto">
              {toastType === "success" ? "Éxito" : "Error"}
            </strong>
            <button
              type="button"
              className="btn-close"
              onClick={() => setShowToast(false)}
            ></button>
          </div>
          <div className="toast-body">{toastMessage}</div>
        </div>
      </div>
    </div>
  );
}

export default Asistencia;

//TODO: Agregar verificacion para que no haya fechas repetidas
